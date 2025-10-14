import './globals.css'
import React from 'react'
export const metadata = { title: 'Teste de inglês', description: 'Plataforma de teste adaptativo' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
