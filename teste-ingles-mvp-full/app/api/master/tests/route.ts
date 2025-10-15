import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { verifyToken } from '@/lib/auth'
export async function GET(req: NextRequest){
  const token = req.cookies.get('auth')?.value
  const payload = token ? await verifyToken<{role:string,id:number}>(token) : null
  if(!payload || payload.role!=='master') return NextResponse.json({ error:'Não autenticado' }, { status:401 })
  const { rows } = await query(`SELECT t.id, t.created_at, t.student_name, t.assigned_level, p.email as professor_email FROM tests t JOIN professors p ON p.id=t.professor_id WHERE t.deleted_at IS NULL ORDER BY t.created_at DESC`)
  return NextResponse.json({ rows })
}
