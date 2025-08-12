import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';

// Type for the Neon SQL client which is both callable and a template tag
export type NeonSql = any; // keep flexible; Neon client supports tagged template and function calls

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly sql: NeonSql;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('DATABASE_URL');
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    this.sql = neon(url);
    const masked = this.maskDbUrl(url);
    console.log(`[Database] Initialized Neon client for ${masked}`);
  }

  // Expose the raw neon client for tagged template usage if needed
  get client(): NeonSql {
    return this.sql;
  }

  // Helper for plain queries with params
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    return this.sql.query(text, params);
  }

  async onModuleInit(): Promise<void> {
    const start = Date.now();
    try {
      // quick health check
      const res = await this.sql`select 1 as ok`;
      const ms = Date.now() - start;
      console.log(`[Database] Connectivity check passed in ${ms}ms:`, res?.[0]);
    } catch (err) {
      const ms = Date.now() - start;
      console.error(`[Database] Connectivity check FAILED in ${ms}ms:`, err);
    }
  }

  private maskDbUrl(url: string): string {
    try {
      const u = new URL(url);
      const host = u.host;
      const db = u.pathname?.replace(/^\//, '') || '';
      return `${host}/${db}`;
    } catch {
      return 'database (masked)';
    }
  }
}
