'use client'
import { useEffect, useState } from 'react'

type Row = { id:number; created_at:string; student_name:string; assigned_level:string; professor_email:string }
export default function MasterDash(){
  const [rows,setRows] = useState<Row[]>([])
  async function load(){ const r = await fetch('/api/master/tests'); const data = await r.json(); setRows(data.rows||[]) }
  useEffect(()=>{ load() },[])
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Todos os testes</h1>
      <div className="overflow-x-auto bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-2 text-left">Data</th><th className="p-2 text-left">Professor</th><th className="p-2 text-left">Aluno</th><th className="p-2 text-left">Nível</th></tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{r.professor_email}</td>
                <td className="p-2">{r.student_name}</td>
                <td className="p-2">{r.assigned_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
