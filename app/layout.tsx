import type { Metadata } from 'next'
import { Fragment_Mono } from 'next/font/google'
import './globals.css'

const fragment = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fragment',
})

export const metadata: Metadata = {
  title: 'AfterCall — the call ended, the CRM updated itself',
  description:
    'Live demo: a sales-call transcript goes in, an LLM extracts a strictly-typed analysis, deterministic guardrails validate every claim, and the deal card moves across the pipeline. Built by Kumar Abhishek.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${fragment.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
