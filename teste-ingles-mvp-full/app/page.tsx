export default function Home(){
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Teste de inglês</h1>
      <p className="mb-6">Escolha uma opção:</p>
      <div className="space-y-3">
        <a className="block p-3 rounded bg-white border" href="/teste?ref=01">Área do aluno</a>
        <a className="block p-3 rounded bg-white border" href="/professor/login">Área do professor</a>
        <a className="block p-3 rounded bg-white border" href="/master/login">Área do master</a>
      </div>
    </main>
  )
}
