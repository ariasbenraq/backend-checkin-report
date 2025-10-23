// src/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('db')
  async db() {
    try {
      await this.dataSource.query('SELECT 1');               // ping
      const [row] = await this.dataSource.query('SELECT now()');
      return { ok: true, now: row?.now ?? null };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }
}
