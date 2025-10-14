'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

type Q = { id:number; prompt:string; options:string[]; order_index:number }
export default function TesteAluno(){
  const sp = useSearchParams(); const ref = sp.get('ref')||''
  const [step,setStep] = useState<'form'|'quiz'|'done'>('form')
  const [name,setName] = useState('')
  const [studentPass,setStudentPass] = useState('')
  const [testId,setTestId] = useState<number|null>(null)
  const [q,setQ] = useState<Q|null>(null)
  const [chosen,setChosen] = useState<number|null>(null)
  const [progress,setProgress] = useState(0)

  async function start(){
    const res = await fetch(`/api/test/start?ref=${ref}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ name, student_password: studentPass })})
    const data = await res.json()
    if(data.error){ alert(data.error); return }
    setTestId(data.test_id); setQ(data.question); setProgress(1); setStep('quiz')
  }
  async function answer(){
    if(chosen==null||!testId||!q) return
    const res = await fetch('/api/test/answer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ test_id:testId, question_id:q.id, chosen_option_index: chosen })})
    const data = await res.json()
    if(data.done){
      await fetch('/api/test/finish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ test_id:testId })})
      setStep('done'); return
    }
    setQ(data.question); setChosen(null); setProgress(data.progress)
  }

  if(!ref) return <main className="max-w-xl mx-auto p-6">Link inválido: falta parâmetro ref.</main>

  return (
    <main className="max-w-xl mx-auto p-6">
      {step==='form' && (
        <div className="bg-white border rounded p-4 space-y-3">
          <h1 className="text-xl font-semibold">Iniciar teste</h1>
          <label className="block">Nome do aluno
            <input className="mt-1 w-full border rounded p-2" value={name} onChange={e=>setName(e.target.value)} />
          </label>
          <label className="block">Senha do aluno
            <input className="mt-1 w-full border rounded p-2" value={studentPass} onChange={e=>setStudentPass(e.target.value)} />
          </label>
          <button onClick={start} className="w-full mt-2 bg-blue-600 text-white rounded p-2">Iniciar teste</button>
          <p className="text-sm text-gray-600">Serão 15 perguntas com 5 opções cada.</p>
        </div>
      )}
      {step==='quiz' && q && (
        <div className="bg-white border rounded p-4">
          <div className="mb-2 text-sm text-gray-500">Progresso: {progress}/15</div>
          <h2 className="font-semibold mb-3">{q.order_index+1}. {q.prompt}</h2>
          <div className="space-y-2">
            {q.options.map((opt,idx)=> (
              <button key={idx} onClick={()=>setChosen(idx)} className={`w-full text-left border rounded p-2 ${chosen===idx?'border-blue-600 ring-2 ring-blue-200':''}`}>{String.fromCharCode(65+idx)}) {opt}</button>
            ))}
          </div>
          <button disabled={chosen==null} onClick={answer} className="w-full mt-4 bg-blue-600 text-white rounded p-2 disabled:opacity-50">Confirmar resposta</button>
        </div>
      )}
      {step==='done' && (
        <div className="bg-white border rounded p-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Teste concluído</h2>
          <p>O resultado foi enviado para o e-mail do seu professor.</p>
          <a className="inline-block mt-4 underline" href="/">Voltar à página inicial</a>
        </div>
      )}
    </main>
  )
}
