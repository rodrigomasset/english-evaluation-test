'use client'
import { useEffect, useState } from 'react'

type Row = { id:number; created_at:string; student_name:string; assigned_level:string }
export default function ProfDash(){
  const [rows,setRows] = useState<Row[]>([])
  async function load(){ const r = await fetch('/api/professor/tests'); const data = await r.json(); setRows(data.rows||[]) }
  useEffect(()=>{ load() },[])
  async function resend(id:number){ await fetch(`/api/professor/tests/${id}/resend`,{method:'POST'}); alert('Reenviado!') }
  async function del(id:number){ await fetch(`/api/professor/tests/${id}`,{method:'DELETE'}); load() }
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Meus testes</h1>
      <div className="overflow-x-auto bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-2 text-left">Data</th><th className="p-2 text-left">Aluno</th><th className="p-2 text-left">Nível</th><th className="p-2">Ações</th></tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{r.student_name}</td>
                <td className="p-2">{r.assigned_level}</td>
                <td className="p-2 text-center space-x-2">
                  <a className="underline" href={`/api/professor/tests/${r.id}`}>Ver</a>
                  <button className="underline" onClick={()=>resend(r.id)}>Reenviar</button>
                  <button className="underline text-red-600" onClick={()=>del(r.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
