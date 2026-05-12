import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import DemoEndedOverlay from '@/components/DemoEndedOverlay'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LightAudit Pro',
  description: 'Lighting Audit & Sales Workflow Management',
}

const DEMO_ENDED = false

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          {DEMO_ENDED ? (
            <DemoEndedOverlay>{children}</DemoEndedOverlay>
          ) : (
            children
          )}
        </AppProvider>
      </body>
    </html>
  )
}
