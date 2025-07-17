import type { Metadata } from 'next'
import { ReactNode } from 'react'
import Navigation from '@/components/Navigation'
import ReduxProvider from '@/components/ReduxProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Disney Trip Planner - Your Magical Journey Starts Here',
  description: 'The ultimate Disney trip planning suite with countdown timers, budget trackers, packing lists, and more. Plan your perfect Disney vacation with our comprehensive tools.',
  keywords: ['Disney', 'trip planner', 'vacation planning', 'Disney World', 'Disneyland', 'countdown timer', 'budget tracker'],
  authors: [{ name: 'Disney Trip Planner' }],
  openGraph: {
    title: 'Disney Trip Planner - Your Magical Journey Starts Here',
    description: 'Plan your perfect Disney vacation with our comprehensive suite of planning tools.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <ReduxProvider>
          <div className="min-h-screen">
            <Navigation />
            {children}
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}