import type { Metadata } from 'next'
import { Archivo, Fragment_Mono } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
})

const fragment = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fragment',
})

export const metadata: Metadata = {
  title: 'AfterCall — the call ended, the CRM updated itself',
  description:
    'Live demo: a sales-call transcript goes in, Claude extracts a strictly-typed analysis, deterministic guardrails validate every claim, and the deal card moves across the pipeline. Built by Kumar Abhishek.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${archivo.variable} ${fragment.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
