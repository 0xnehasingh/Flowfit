import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import FlowProvider from '@/components/providers/FlowProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlowFit - Gamified Fitness with Crypto Rewards',
  description: 'The first verifiable fitness protocol on Flow that rewards users with tokens and NFTs for completing VRF-generated workout challenges.',
  keywords: ['fitness', 'blockchain', 'flow', 'gamification', 'crypto', 'rewards', 'NFT', 'VRF'],
  authors: [{ name: 'FlowFit Team' }],
  metadataBase: new URL('https://flowfit.io'),
  openGraph: {
    title: 'FlowFit - Gamified Fitness with Crypto Rewards',
    description: 'Earn tokens and NFTs for completing workout challenges. Built on Flow blockchain.',
    url: 'https://flowfit.io',
    siteName: 'FlowFit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowFit - Gamified Fitness',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowFit - Gamified Fitness with Crypto Rewards',
    description: 'Earn tokens and NFTs for completing workout challenges. Built on Flow blockchain.',
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
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#ffffff',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              },
              success: {
                iconTheme: {
                  primary: '#00ff88',
                  secondary: '#ffffff',
                },
                style: {
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff006e',
                  secondary: '#ffffff',
                },
                style: {
                  border: '1px solid rgba(255, 0, 110, 0.3)',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#00d4ff',
                  secondary: '#ffffff',
                },
                style: {
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                },
              },
            }}
          />
        </FlowProvider>
      </body>
    </html>
  )
} 