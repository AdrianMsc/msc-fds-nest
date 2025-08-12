import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { S3Service } from './storage/s3.service';
import { extractS3KeyFromUrl } from './common/utils/s3-helpers';

@Injectable()
export class ComponentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly s3: S3Service,
  ) {}

  async handshake(): Promise<string> {
    return '👍';
  }

  async getAllComponentNames() {
    const query = 'SELECT c.name FROM component c ORDER BY c.name;';
    return this.db.query(query);
  }

  async getComponentCount() {
    const [result] = await this.db.query<{ count: string }>('SELECT COUNT(*) FROM component;');
    return { count: Number(result.count) };
  }

  async getAllComponents() {
    const query = `
      SELECT 
        c.id AS component_id,
        c.name AS component_name,
        c.category AS component_category,
        c.comment AS component_comment,
        c.description AS component_description,
        c.image AS component_image,
        c.created_at AS component_creation,
        c.updated_at AS component_update,
        pl.figma AS figma_link,
        pl.storybook AS storybook_link,
        s.guidelines AS component_guidelines,  
        s.figma AS component_figma,
        s.storybook AS component_storybook,
        s.cdn AS component_cdn
      FROM component c
      LEFT JOIN statuses s ON c.id = s.comp_id
      LEFT JOIN platform_links pl ON c.id = pl.comp_id   
      ORDER BY c.id;`;

    const rows = await this.db.query<any>(query);

    const grouped = rows.reduce((acc: any[], row: any) => {
      let category = acc.find((c) => c.category === row.component_category);
      if (!category) {
        category = { category: row.component_category, components: [] };
        acc.push(category);
      }
      let component = category.components.find((c) => c.id === row.component_id);
      if (!component) {
        component = {
          id: row.component_id,
          name: row.component_name,
          description: row.component_description,
          category: category.category,
          comment: row.component_comment,
          image: row.component_image,
          createdAt: row.component_creation,
          updatedAt: row.component_update,
          statuses: [],
          storybookLink: row.storybook_link,
          figmaLink: row.figma_link,
        };
        category.components.push(component);
      }
      component.statuses.push({
        guidelines: row.component_guidelines,
        figma: row.component_figma,
        storybook: row.component_storybook,
        cdn: row.component_cdn,
      });
      return acc;
    }, [] as any[]);

    return grouped;
  }

  async createComponent(params: { category: string }, body: any, file?: Express.Multer.File) {
    const { category } = params;
    const {
      name,
      comment = '',
      description = '',
      figma = '',
      figmaLink = '',
      guidelines = '',
      cdn = '',
      storybook = '',
      storybookLink = '',
    } = body ?? {};

    if (!name?.trim() || !category?.trim()) {
      throw new BadRequestException('Required fields: name and category.');
    }

    let imageUrl: string | null = null;

    if (file) {
      const { mimetype, size, buffer } = file;
      if (!mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed.');
      }
      const maxSize = 5 * 1024 * 1024;
      if (size > maxSize) {
        throw new BadRequestException('Image size exceeds 5MB.');
      }
      imageUrl = await this.s3.uploadCompressedImage(buffer, name);
    }

    const componentResult = await this.db.query<{ id: number }>(
      `INSERT INTO component (name, category, comment, description, image)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, category, comment, description, imageUrl],
    );

    const componentId = componentResult[0]?.id;
    if (!componentId) {
      throw new Error('Component ID not retrieved after insert.');
    }

    await this.db.query(
      `INSERT INTO statuses (comp_id, figma, guidelines, cdn, storybook)
       VALUES ($1, $2, $3, $4, $5)`,
      [componentId, figma, guidelines, cdn, storybook],
    );

    await this.db.query(
      `INSERT INTO platform_links (comp_id, figma, storybook)
       VALUES ($1, $2, $3)`,
      [componentId, figmaLink, storybookLink],
    );

    return { message: 'Component created successfully.', componentId, imageUrl };
  }

  async updateComponent(params: { category: string; id: string }, body: any, file?: Express.Multer.File) {
    const { category, id } = params;
    const { name, comment, description, figma, guidelines, cdn, storybook, figmaLink, storybookLink } = body ?? {};
    if (!name || !category || !id) {
      throw new BadRequestException('Required fields: name, category, and id.');
    }

    let imageKey: string | undefined;

    if (file) {
      const [existingComponent] = await this.db.client`SELECT image FROM component WHERE id = ${id}`;
      const previousUrl = existingComponent?.image as string | undefined;
      if (previousUrl) {
        const actualKey = extractS3KeyFromUrl(previousUrl);
        if (actualKey) {
          await this.s3.overwriteImage(file.buffer, actualKey);
          imageKey = previousUrl;
        }
      } else {
        imageKey = await this.s3.uploadCompressedImage(file.buffer, name);
      }
    }

    const updateQuery = imageKey
      ? `UPDATE component SET name = $1, category = $2, comment = $3, description = $4, image = $5 WHERE id = $6 RETURNING id`
      : `UPDATE component SET name = $1, category = $2, comment = $3, description = $4 WHERE id = $5 RETURNING id`;
    const updateParams = imageKey
      ? [name, category, comment, description, imageKey, id]
      : [name, category, comment, description, id];

    const componentResult = await this.db.query(updateQuery, updateParams);
    if ((componentResult as any).length === 0) {
      throw new NotFoundException('Component not found.');
    }

    const [status] = await this.db.client`SELECT * FROM statuses WHERE comp_id = ${id}`;
    if (status) {
      await this.db.client`
        UPDATE statuses SET figma = ${figma}, guidelines = ${guidelines}, cdn = ${cdn}, storybook = ${storybook}
        WHERE comp_id = ${id}
      `;
    } else {
      await this.db.client`
        INSERT INTO statuses (comp_id, figma, guidelines, cdn, storybook)
        VALUES (${id}, ${figma}, ${guidelines}, ${cdn}, ${storybook})
      `;
    }

    const [links] = await this.db.client`SELECT * FROM platform_links WHERE comp_id = ${id}`;
    if (links) {
      await this.db.client`
        UPDATE platform_links SET figma = ${figmaLink}, storybook = ${storybookLink}
        WHERE comp_id = ${id}
      `;
    } else {
      await this.db.client`
        INSERT INTO platform_links (comp_id, figma, storybook)
        VALUES (${id}, ${figmaLink}, ${storybookLink})
      `;
    }

    return { message: 'Component, statuses, and platform links updated successfully.' };
  }

  async updateComponentResources(params: { id: string }, body: any) {
    const { id } = params;
    const { figma, guidelines, cdn, storybook, figmaLink, storybookLink } = body ?? {};

    let statusUpdated = false;
    let linksUpdated = false;

    if (figma !== undefined || guidelines !== undefined || cdn !== undefined || storybook !== undefined) {
      await this.db.query(
        `UPDATE statuses 
         SET 
           figma = COALESCE($1, figma),
           guidelines = COALESCE($2, guidelines),
           cdn = COALESCE($3, cdn),
           storybook = COALESCE($4, storybook)
         WHERE comp_id = $5`,
        [figma, guidelines, cdn, storybook, id],
      );
      statusUpdated = true;
    }

    if (figmaLink !== undefined || storybookLink !== undefined) {
      await this.db.query(
        `UPDATE platform_links 
         SET 
           figma = COALESCE($1, figma),
           storybook = COALESCE($2, storybook)
         WHERE comp_id = $3`,
        [figmaLink, storybookLink, id],
      );
      linksUpdated = true;
    }

    if (!statusUpdated && !linksUpdated) {
      throw new BadRequestException('No valid fields provided to update.');
    }

    return { message: 'Component resources updated successfully.', updated: { statuses: statusUpdated, links: linksUpdated } };
  }

  async deleteComponent(params: { id: string }) {
    const { id } = params;
    const [component] = await this.db.client`SELECT image FROM component WHERE id = ${id}`;
    if (!component) {
      throw new NotFoundException('Component not found.');
    }

    const imageUrl = component.image as string | undefined;
    if (imageUrl) {
      try {
        const s3Key = imageUrl.split('.amazonaws.com/')[1];
        if (s3Key) await this.s3.deleteImageFromS3(s3Key);
      } catch (e) {
        // warn but continue
        // eslint-disable-next-line no-console
        console.warn('Failed to delete image from S3:', (e as Error).message);
      }
    }

    const result = await this.db.client`
      WITH deleted_component AS (
        DELETE FROM component WHERE id = ${id} RETURNING id
      )
      DELETE FROM statuses WHERE comp_id IN (SELECT id FROM deleted_component);
    `;

    if ((result as any).count === 0 && (result as any).rowCount === 0) {
      throw new NotFoundException('Component not found or could not be erased.');
    }

    return { message: 'Component, related records, and image erased successfully.' };
  }
}
