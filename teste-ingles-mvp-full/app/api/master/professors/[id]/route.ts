import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
export async function PUT(req: NextRequest, { params }: { params: { id: string } }){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string}>(token) : null
  if(!payload || payload.role!=='master') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  const { email, password, student_password } = await req.json()
  await query(`UPDATE professors SET email=$1, password=$2, student_password=$3 WHERE id=$4`,[email,password,student_password,params.id])
  return NextResponse.json({ ok:true })
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string}>(token) : null
  if(!payload || payload.role!=='master') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  await query(`DELETE FROM professors WHERE id=$1`,[params.id])
  return NextResponse.json({ ok:true })
}
