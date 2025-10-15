import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../../lib/db'
import { verifyToken } from '../../../../../lib/auth'
import { sendMail } from '../../../../../lib/email'
export async function POST(req: NextRequest, { params }: { params: { id: string } }){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string,id:number}>(token) : null
  if(!payload || payload.role!=='professor') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  const t = await query(`SELECT id, student_name, created_at, professor_id, assigned_level FROM tests WHERE id=$1 AND professor_id=$2`,[params.id, payload.id])
  const items = await query(`SELECT q.prompt,q.options,q.correct_index,ti.chosen_option_index,ti.is_correct FROM test_items ti JOIN questions q ON q.id=ti.question_id WHERE ti.test_id=$1 ORDER BY ti.order_index`,[params.id])
  const prof = await query<{email:string}>(`SELECT email FROM professors WHERE id=$1`,[payload.id])
  const list = items.rows.map((it:any,i:number)=>{
    const opts = (it.options as string[]).map((op:string,idx:number)=>{
      const isCorrect = idx===it.correct_index
      const isChosen = idx===it.chosen_option_index
      const pre = isChosen? '<strong>X</strong> ' : ''
      const style = isCorrect? 'color:#0B5ED7;' : ''
      return `<li style=\"margin:2px 0; ${style}\">${pre}${op}</li>`
    }).join('')
    const icon = it.is_correct ? '✅' : '❌'
    return `<div style=\"padding:12px 0;border-top:1px solid #eee;\"><h3 style=\"margin:0 0 8px;\">${icon} Questão ${i+1}</h3><p style=\"margin:0 0 6px;\">${it.prompt}</p><ol type=\"A\" style=\"padding-left:18px; margin:6px 0 0;\">${opts}</ol></div>`
  }).join('')
  await sendMail({ to: prof.rows[0].email, subject: `Teste Inglês de ${t.rows[0].student_name}`, html: `<div style=\"font-family:Arial,sans-serif;font-size:14px;color:#222;\"><h2>Resultado do teste – ${t.rows[0].student_name}</h2><p><strong>Data:</strong> ${new Date(t.rows[0].created_at).toLocaleString()}</p><p><strong>Nível estimado:</strong> ${t.rows[0].assigned_level}</p>${list}</div>` })
  return NextResponse.json({ ok:true })
}
