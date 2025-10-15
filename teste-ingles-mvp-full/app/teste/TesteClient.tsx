'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TesteClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ref = searchParams.get('ref') ?? ''

  const [name, setName] = useState('')
  const [studentPassword, setStudentPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startTest(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!ref) {
      setError('Link inválido. Verifique se o link contém o parâmetro "ref" do professor.')
      return
    }
    if (!name.trim()) {
      setError('Por favor, informe seu nome.')
      return
    }
    if (!studentPassword.trim()) {
      setError('Por favor, informe a senha do aluno.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/test/start?ref=${encodeURIComponent(ref)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, student_password: studentPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Não foi possível iniciar o teste.')
        setLoading(false)
        return
      }

      // data: { test_id, progress, question: { id, prompt, options, order_index } }
      // Redireciona para a tela de execução do teste (ajuste a rota se sua UI usar outro caminho)
      router.push(`/teste/quiz?test_id=${data.test_id}&q=${data.question?.id}&i=${data.question?.order_index ?? 0}`)
    } catch (err) {
      setError('Erro de rede ao iniciar o teste. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-2">Teste de nível de inglês</h1>
      <p className="text-sm text-gray-600 mb-4">
        Serão 15 perguntas de múltipla escolha (5 opções). Ao final, o resultado será enviado ao professor.
      </p>

      {!ref && (
        <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Atenção: este link não tem o parâmetro <code>ref</code> do professor. Solicite o link correto ao seu professor.
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={startTest} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Seu nome</label>
          <input
            type="text"
            className="w-full rounded-md border px-3 py-2 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Maria Silva"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Senha do aluno</label>
          <input
            type="password"
            className="w-full rounded-md border px-3 py-2 outline-none"
            value={studentPassword}
            onChange={(e) => setStudentPassword(e.target.value)}
            placeholder="Senha do aluno fornecida pelo professor"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Iniciando…' : 'Iniciar teste'}
        </button>
      </form>
    </div>
  )
}
