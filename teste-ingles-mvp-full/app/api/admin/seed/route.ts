import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest){
  const secret = new URL(req.url).searchParams.get('secret')
  if(!secret || secret !== process.env.ADMIN_SEED_SECRET){
    return NextResponse.json({ error:'Unauthorized' }, { status: 401 })
  }
  const file = path.join(process.cwd(), 'data', 'questions.full.json')
  const raw = fs.readFileSync(file, 'utf8')
  const items = JSON.parse(raw)
  let inserted = 0
  for(const q of items){
    await query(
      `INSERT INTO questions(level,prompt,options,correct_index,active) VALUES($1,$2,$3,$4,true)`,
      [q.level, q.prompt, JSON.stringify(q.options), q.correct_index]
    )
    inserted++
  }
  return NextResponse.json({ ok:true, inserted })
}
