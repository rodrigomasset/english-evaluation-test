import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import items from '../../../data/questions.full.json'

// Segredo do seed: usa variável de ambiente SEED_SECRET, senão fallback
const SEED_SECRET = process.env.SEED_SECRET || 'seed-123456'

// Função principal do seed
async function runSeed() {
  // 1) Cria tabela se não existir (schema simples)
  await query(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      level TEXT NOT NULL,
      prompt TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_index INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE
    );
  `)

  // 2) Se já estiver populado (>= 200), não insere de novo
  const count = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM questions;`)
  const current = Number(count.rows[0].count || '0')
  if (current >= 200) {
    return { ok: true, inserted: 0, already: current }
  }

  // 3) Inserção em transação
  await query('BEGIN')
  try {
    for (const it of items as any[]) {
      // it: { level: 'basic1'|..., prompt: string, options: string[], correct_index: number, active?: boolean }
      await query(
        `INSERT INTO questions (level, prompt, options, correct_index, active)
         VALUES ($1, $2, $3, $4, $5);`,
        [
          it.level,
          it.prompt,
          JSON.stringify(it.options),
          Number(it.correct_index),
          typeof it.active === 'boolean' ? it.active : true,
        ]
      )
    }
    await query('COMMIT')
  } catch (e) {
    await query('ROLLBACK')
    throw e
  }

  const after = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM questions;`)
  return { ok: true, inserted: Number(after.rows[0].count) - current }
}

// Reaproveita a mesma lógica para GET e POST
async function handle(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret') || ''
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runSeed()
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: 'Seed failed', detail: String(err?.message || err) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
