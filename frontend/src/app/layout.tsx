import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import FlowProvider from '@/components/providers/FlowProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlowFit - Gamified Fitness Protocol',
  description: 'The first gasless fitness protocol on Flow blockchain that rewards your workouts with crypto and evolving NFTs',
  keywords: 'fitness, blockchain, crypto, NFT, Flow, gamification, rewards',
  authors: [{ name: 'FlowFit Team' }],
  metadataBase: new URL('https://flowfit.io'),
  openGraph: {
    title: 'FlowFit - Gamified Fitness Protocol',
    description: 'Earn crypto and NFTs by completing fitness challenges on Flow blockchain',
    url: 'https://flowfit.io',
    siteName: 'FlowFit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowFit - Gamified Fitness Protocol',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowFit - Gamified Fitness Protocol',
    description: 'Earn crypto and NFTs by completing fitness challenges',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <FlowProvider>
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              className: '',
              duration: 4000,
              style: {
                background: 'rgba(17, 24, 39, 0.95)',
                color: '#fff',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                style: {
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  background: 'rgba(17, 24, 39, 0.95)',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#111827',
                },
              },
              error: {
                duration: 4000,
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(17, 24, 39, 0.95)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#111827',
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  background: 'rgba(17, 24, 39, 0.95)',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#111827',
                },
              },
            }}
          />
        </FlowProvider>
      </body>
    </html>
  )
} 