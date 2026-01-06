import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Duty Roster',
  description: 'Duty Roster & Event Scheduling System'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
