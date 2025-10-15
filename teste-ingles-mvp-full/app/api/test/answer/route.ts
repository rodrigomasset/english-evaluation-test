import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { type Level, nextLevel, prevLevel } from '../../../lib/levels'

export async function POST(req: NextRequest){
  const { test_id, question_id, chosen_option_index } = await req.json()
  const q = await query<{correct_index:number, level:Level}>(`SELECT correct_index, level FROM questions WHERE id=$1`,[question_id])
  if(!q.rows[0]) return NextResponse.json({ error: 'Questão inválida' }, { status: 400 })
  const correct = q.rows[0].correct_index === Number(chosen_option_index)

  const items = await query<{count:string}>(`SELECT COUNT(*)::int as count FROM test_items WHERE test_id=$1`,[test_id])
  const order = Number(items.rows[0].count)
  await query(`INSERT INTO test_items(test_id,question_id,order_index,chosen_option_index,is_correct) VALUES($1,$2,$3,$4,$5)`,[test_id,question_id,order,chosen_option_index,correct])

  const lastTwo = await query<{is_correct:boolean, level:Level}>(
    `SELECT ti.is_correct, q.level FROM test_items ti JOIN questions q ON q.id=ti.question_id WHERE ti.test_id=$1 ORDER BY ti.order_index DESC LIMIT 2`,
    [test_id]
  )
  let level = q.rows[0].level
  if(lastTwo.rows.length===2){
    const [a,b] = lastTwo.rows
    if(a.is_correct && b.is_correct) level = nextLevel(level)
    if(!a.is_correct && !b.is_correct) level = prevLevel(level)
  } else {
    if(correct) level = nextLevel(level)
  }

  const progress = order + 1
  if(progress>=15){
    return NextResponse.json({ done: true })
  }
  const nextQ = await query<{id:number,prompt:string,options:any}>(`SELECT id,prompt,options FROM questions WHERE level=$1 AND active=true ORDER BY random() LIMIT 1`,[level])
  const nq = nextQ.rows[0]
  return NextResponse.json({ progress: progress+1, question: { id:nq.id, prompt:nq.prompt, options:nq.options, order_index: order+1 } })
}
