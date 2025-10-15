import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { LEVELS, type Level } from '../../../lib/levels'
import { sendMail } from '../../../lib/email'

function indexToLevel(idx:number){ return LEVELS[Math.max(0,Math.min(LEVELS.length-1, idx))] as Level }

export async function POST(req: NextRequest){
  const { test_id } = await req.json()
  const { rows: items } = await query<{is_correct:boolean, level:Level, prompt:string, options:any, correct_index:number, chosen_option_index:number}>(
    `SELECT ti.is_correct, q.level, q.prompt, q.options, q.correct_index, ti.chosen_option_index
     FROM test_items ti JOIN questions q ON q.id=ti.question_id WHERE ti.test_id=$1 ORDER BY ti.order_index`, [test_id])
  if(items.length===0) return NextResponse.json({ error:'Teste vazio' }, { status:400 })
  let sum = 0, w = 0
  for(const it of items){ const li = LEVELS.indexOf(it.level); const weight = it.is_correct ? (li+1) : 1; sum += li*weight; w += weight }
  const idx = Math.round(sum/Math.max(1,w))
  const assigned = indexToLevel(idx)
  await query(`UPDATE tests SET assigned_level=$1, finished_at=now() WHERE id=$2`,[assigned, test_id])

  const t = await query<{student_name:string, created_at:string, professor_id:number}>(`SELECT student_name, created_at, professor_id FROM tests WHERE id=$1`,[test_id])
  const prof = await query<{email:string}>(`SELECT email FROM professors WHERE id=$1`,[t.rows[0].professor_id])

  const header = `<h2 style="margin:0 0 12px;">Resultado do teste – ${t.rows[0].student_name}</h2>
  <p><strong>Data:</strong> ${new Date(t.rows[0].created_at).toLocaleString()}</p>
  <p><strong>Nível estimado:</strong> ${assigned}</p>`
  const list = items.map((it, i)=>{
    const opts = (it.options as string[]).map((op,idx)=>{
      const isCorrect = idx===it.correct_index
      const isChosen = idx===it.chosen_option_index
      const pre = isChosen? '<strong>X</strong> ' : ''
      const style = isCorrect? 'color:#0B5ED7;' : ''
      return `<li style="margin:2px 0; ${style}">${pre}${op}</li>`
    }).join('')
    const icon = it.is_correct ? '✅' : '❌'
    return `<div style="padding:12px 0;border-top:1px solid #eee;">
      <h3 style="margin:0 0 8px;">${icon} Questão ${i+1}</h3>
      <p style="margin:0 0 6px;">${it.prompt}</p>
      <ol type="A" style="padding-left:18px; margin:6px 0 0;">${opts}</ol>
    </div>`
  }).join('')

  await sendMail({ to: prof.rows[0].email, subject: `Teste Inglês de ${t.rows[0].student_name}`, html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;">${header}${list}</div>` })
  return NextResponse.json({ ok:true })
}
