import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { type Level } from '@/lib/levels'

export async function POST(req: NextRequest){
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  const { name, student_password } = await req.json()
  if(!ref) return NextResponse.json({ error: 'Link inválido' }, { status: 400 })
  const prof = await query<{id:number,student_password:string}>('SELECT id,student_password FROM professors WHERE code=$1',[ref])
  if(!prof.rows[0]) return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 })
  if(student_password !== prof.rows[0].student_password) return NextResponse.json({ error: 'Senha do aluno inválida' }, { status: 401 })

  const level: Level = 'basico1'
  const t = await query<{id:number}>(`INSERT INTO tests(professor_id,student_name,assigned_level,started_at) VALUES($1,$2,$3,now()) RETURNING id`,[prof.rows[0].id, name, level])
  const testId = t.rows[0].id

  const q = await query<{id:number,prompt:string,options:any}>(`SELECT id,prompt,options FROM questions WHERE level=$1 AND active=true ORDER BY random() LIMIT 1`,[level])
  const question = q.rows[0]
  return NextResponse.json({ test_id: testId, progress: 1, question: { id:question.id, prompt:question.prompt, options:question.options, order_index: 0 } })
}
