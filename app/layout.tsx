import type { Metadata } from 'next'
import { Fragment_Mono } from 'next/font/google'
import './globals.css'

const fragment = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fragment',
})

export const metadata: Metadata = {
  title: 'AfterCall: the call ended, the CRM updated itself',
  description:
    'Paste a sales-call transcript, get a typed lead analysis that four plain-code guardrails check before the deal card moves. Built by Kumar Abhishek.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${fragment.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
