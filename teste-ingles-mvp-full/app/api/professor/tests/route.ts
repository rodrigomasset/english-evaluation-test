import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
export async function GET(req: NextRequest){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string,id:number,code:string}>(token) : null
  if(!payload || payload.role!=='professor') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  const { rows } = await query(`SELECT id, created_at, student_name, assigned_level FROM tests WHERE professor_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC`,[payload.id])
  return NextResponse.json({ rows })
}
