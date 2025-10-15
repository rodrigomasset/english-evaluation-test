import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/db'
import { createToken } from '../../../../lib/auth'

export async function POST(req: NextRequest){
  const { email, password } = await req.json()
  const { rows } = await query<{id:number,password:string}>('SELECT id,password FROM masters WHERE email=$1',[email])
  if(!rows[0]) return NextResponse.json({error:'Credenciais inválidas'}, { status: 401 })
  const ok = process.env.USE_PLAINTEXT_PASSWORDS==='true' ? (password===rows[0].password) : false
  if(!ok) return NextResponse.json({error:'Credenciais inválidas'}, { status: 401 })
  const token = await createToken({ role:'master', id: rows[0].id })
  const res = NextResponse.json({ ok:true })
  res.cookies.set('auth', token, { httpOnly:true, path:'/' })
  return res
}
