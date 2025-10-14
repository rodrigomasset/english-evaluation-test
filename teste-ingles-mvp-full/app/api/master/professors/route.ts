import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
function nextCodeStr(prev: string|undefined){
  const n = prev? parseInt(prev,10)+1 : 1
  return String(n).padStart(2,'0')
}
export async function GET(req: NextRequest){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string}>(token) : null
  if(!payload || payload.role!=='master') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  const { rows } = await query(`SELECT id, code, email, password, student_password, created_at FROM professors ORDER BY code ASC`)
  return NextResponse.json({ rows })
}
export async function POST(req: NextRequest){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string}>(token) : null
  if(!payload || payload.role!=='master') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  const { email, password, student_password } = await req.json()
  const last = await query<{code:string}>(`SELECT code FROM professors ORDER BY code DESC LIMIT 1`)
  const code = nextCodeStr(last.rows[0]?.code)
  const ins = await query(`INSERT INTO professors(code,email,password,student_password) VALUES($1,$2,$3,$4) RETURNING id`,[code, email, password, student_password])
  return NextResponse.json({ id: ins.rows[0].id, code })
}
