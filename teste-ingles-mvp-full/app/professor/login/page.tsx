'use client'
import { useState } from 'react'
export default function ProfLogin(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  async function login(){
    const res = await fetch('/api/auth/professor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ email, password })})
    const data = await res.json(); if(data.error){ alert(data.error); return }
    location.href='/professor'
  }
  return (
    <main className="max-w-sm mx-auto p-6">
      <div className="bg-white border rounded p-4 space-y-3">
        <h1 className="text-xl font-semibold">Professor – Entrar</h1>
        <input placeholder="E-mail" className="w-full border rounded p-2" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" className="w-full border rounded p-2" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={login} className="w-full bg-blue-600 text-white rounded p-2">Entrar</button>
      </div>
    </main>
  )
}
