import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/db'
import { verifyToken } from '../../../../lib/auth'
export async function GET(req: NextRequest, { params }: { params: { id: string } }){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string,id:number}>(token) : null
  if(!payload || payload.role!=='professor') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  const test = await query(`SELECT t.id, t.created_at, t.student_name, t.assigned_level FROM tests t WHERE t.id=$1 AND t.professor_id=$2`,[params.id,payload.id])
  const items = await query(`SELECT q.prompt,q.options,q.correct_index,ti.chosen_option_index,ti.is_correct FROM test_items ti JOIN questions q ON q.id=ti.question_id WHERE ti.test_id=$1 ORDER BY ti.order_index`,[params.id])
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;">
    <h2 style="margin:0 0 12px;">Resultado do teste – ${test.rows[0].student_name}</h2>
    <p><strong>Data:</strong> ${new Date(test.rows[0].created_at).toLocaleString()}</p>
    <p><strong>Nível estimado:</strong> ${test.rows[0].assigned_level}</p>
    ${items.rows.map((it:any,i:number)=>{
      const opts = (it.options as string[]).map((op:string,idx:number)=>{
        const isCorrect = idx===it.correct_index
        const isChosen = idx===it.chosen_option_index
        const pre = isChosen? '<strong>X</strong> ' : ''
        const style = isCorrect? 'color:#0B5ED7;' : ''
        return `<li style=\"margin:2px 0; ${style}\">${pre}${op}</li>`
      }).join('')
      const icon = it.is_correct ? '✅' : '❌'
      return `<div style=\"padding:12px 0;border-top:1px solid #eee;\"><h3 style=\"margin:0 0 8px;\">${icon} Questão ${i+1}</h3><p style=\"margin:0 0 6px;\">${it.prompt}</p><ol type=\"A\" style=\"padding-left:18px; margin:6px 0 0;\">${opts}</ol></div>`
    }).join('')}
  </div>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string,id:number}>(token) : null
  if(!payload || payload.role!=='professor') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  await query(`UPDATE tests SET deleted_at=now() WHERE id=$1 AND professor_id=$2`,[params.id, payload.id])
  return NextResponse.json({ ok:true })
}
