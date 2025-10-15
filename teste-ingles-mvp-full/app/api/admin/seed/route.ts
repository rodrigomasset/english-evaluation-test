import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/db'
import items from '../../../../data/questions.full.json'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest){
  const secret = new URL(req.url).searchParams.get('secret')
  if(!secret || secret !== process.env.ADMIN_SEED_SECRET){
    return NextResponse.json({ error:'Unauthorized' }, { status: 401 })
  }
  let inserted = 0
  for (const q of items as any[]){
    await query(
      `INSERT INTO questions(level,prompt,options,correct_index,active)
       VALUES($1,$2,$3,$4,true)`,
      [q.level, q.prompt, JSON.stringify(q.options), q.correct_index]
    )
    inserted++
  }
  return NextResponse.json({ ok:true, inserted })
}
