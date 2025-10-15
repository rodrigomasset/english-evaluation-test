import { Suspense } from 'react'
import TesteClient from './TesteClient'

// Evita tentativa de pré-render estático que pode falhar com search params
export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Carregando…</div>}>
      <TesteClient />
    </Suspense>
  )
}
