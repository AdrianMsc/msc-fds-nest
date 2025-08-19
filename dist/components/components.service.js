"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const s3_service_1 = require("../storage/s3.service");
const s3_helpers_1 = require("../common/utils/s3-helpers");
let ComponentsService = class ComponentsService {
    db;
    s3;
    constructor(db, s3) {
        this.db = db;
        this.s3 = s3;
    }
    async handshake() {
        return '👍';
    }
    async getAllComponentNames() {
        const query = 'SELECT c.name FROM component c ORDER BY c.name;';
        return this.db.query(query);
    }
    async getComponentCount() {
        const [result] = await this.db.query('SELECT COUNT(*) FROM component;');
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
        const rows = await this.db.query(query);
        const grouped = rows.reduce((acc, row) => {
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
        }, []);
        return grouped;
    }
    async createComponent(params, body, file) {
        const { category } = params;
        const { name, comment = '', description = '', figma = '', figmaLink = '', guidelines = '', cdn = '', storybook = '', storybookLink = '', } = body ?? {};
        if (!name?.trim() || !category?.trim()) {
            throw new common_1.BadRequestException('Required fields: name and category.');
        }
        let imageUrl = null;
        if (file) {
            const { mimetype, size, buffer } = file;
            if (!mimetype.startsWith('image/')) {
                throw new common_1.BadRequestException('Only image files are allowed.');
            }
            const maxSize = 5 * 1024 * 1024;
            if (size > maxSize) {
                throw new common_1.BadRequestException('Image size exceeds 5MB.');
            }
            imageUrl = await this.s3.uploadCompressedImage(buffer, name);
        }
        const componentResult = await this.db.query(`INSERT INTO component (name, category, comment, description, image)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`, [name, category, comment, description, imageUrl]);
        const componentId = componentResult[0]?.id;
        if (!componentId) {
            throw new Error('Component ID not retrieved after insert.');
        }
        await this.db.query(`INSERT INTO statuses (comp_id, figma, guidelines, cdn, storybook)
       VALUES ($1, $2, $3, $4, $5)`, [componentId, figma, guidelines, cdn, storybook]);
        await this.db.query(`INSERT INTO platform_links (comp_id, figma, storybook)
       VALUES ($1, $2, $3)`, [componentId, figmaLink, storybookLink]);
        return { message: 'Component created successfully.', componentId, imageUrl };
    }
    async updateComponent(params, body, file) {
        const { category, id } = params;
        const { name, comment, description, figma, guidelines, cdn, storybook, figmaLink, storybookLink } = body ?? {};
        if (!name || !category || !id) {
            throw new common_1.BadRequestException('Required fields: name, category, and id.');
        }
        let imageKey;
        if (file) {
            const [existingComponent] = await this.db.client `SELECT image FROM component WHERE id = ${id}`;
            const previousUrl = existingComponent?.image;
            if (previousUrl) {
                const actualKey = (0, s3_helpers_1.extractS3KeyFromUrl)(previousUrl);
                if (actualKey) {
                    await this.s3.overwriteImage(file.buffer, actualKey);
                    imageKey = previousUrl;
                }
            }
            else {
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
        if (componentResult.length === 0) {
            throw new common_1.NotFoundException('Component not found.');
        }
        const [status] = await this.db.client `SELECT * FROM statuses WHERE comp_id = ${id}`;
        if (status) {
            await this.db.client `
        UPDATE statuses SET figma = ${figma}, guidelines = ${guidelines}, cdn = ${cdn}, storybook = ${storybook}
        WHERE comp_id = ${id}
      `;
        }
        else {
            await this.db.client `
        INSERT INTO statuses (comp_id, figma, guidelines, cdn, storybook)
        VALUES (${id}, ${figma}, ${guidelines}, ${cdn}, ${storybook})
      `;
        }
        const [links] = await this.db.client `SELECT * FROM platform_links WHERE comp_id = ${id}`;
        if (links) {
            await this.db.client `
        UPDATE platform_links SET figma = ${figmaLink}, storybook = ${storybookLink}
        WHERE comp_id = ${id}
      `;
        }
        else {
            await this.db.client `
        INSERT INTO platform_links (comp_id, figma, storybook)
        VALUES (${id}, ${figmaLink}, ${storybookLink})
      `;
        }
        return { message: 'Component, statuses, and platform links updated successfully.' };
    }
    async updateComponentResources(params, body) {
        const { id } = params;
        const { figma, guidelines, cdn, storybook, figmaLink, storybookLink } = body ?? {};
        let statusUpdated = false;
        let linksUpdated = false;
        if (figma !== undefined || guidelines !== undefined || cdn !== undefined || storybook !== undefined) {
            await this.db.query(`UPDATE statuses 
         SET 
           figma = COALESCE($1, figma),
           guidelines = COALESCE($2, guidelines),
           cdn = COALESCE($3, cdn),
           storybook = COALESCE($4, storybook)
         WHERE comp_id = $5`, [figma, guidelines, cdn, storybook, id]);
            statusUpdated = true;
        }
        if (figmaLink !== undefined || storybookLink !== undefined) {
            await this.db.query(`UPDATE platform_links 
         SET 
           figma = COALESCE($1, figma),
           storybook = COALESCE($2, storybook)
         WHERE comp_id = $3`, [figmaLink, storybookLink, id]);
            linksUpdated = true;
        }
        if (!statusUpdated && !linksUpdated) {
            throw new common_1.BadRequestException('No valid fields provided to update.');
        }
        return { message: 'Component resources updated successfully.', updated: { statuses: statusUpdated, links: linksUpdated } };
    }
    async deleteComponent(params) {
        const { id } = params;
        const [component] = await this.db.client `SELECT image FROM component WHERE id = ${id}`;
        if (!component) {
            throw new common_1.NotFoundException('Component not found.');
        }
        const imageUrl = component.image;
        if (imageUrl) {
            try {
                const s3Key = imageUrl.split('.amazonaws.com/')[1];
                if (s3Key)
                    await this.s3.deleteImageFromS3(s3Key);
            }
            catch (e) {
                console.warn('Failed to delete image from S3:', e.message);
            }
        }
        const result = await this.db.client `
      WITH deleted_component AS (
        DELETE FROM component WHERE id = ${id} RETURNING id
      )
      DELETE FROM statuses WHERE comp_id IN (SELECT id FROM deleted_component);
    `;
        if (result.count === 0 && result.rowCount === 0) {
            throw new common_1.NotFoundException('Component not found or could not be erased.');
        }
        return { message: 'Component, related records, and image erased successfully.' };
    }
};
exports.ComponentsService = ComponentsService;
exports.ComponentsService = ComponentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        s3_service_1.S3Service])
], ComponentsService);
//# sourceMappingURL=components.service.js.map