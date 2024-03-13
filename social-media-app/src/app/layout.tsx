import './globals.css'
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import TopBar from '@/components/shared/Topbar';
import Bottombar from '@/components/shared/Bottombar';
import LeftsideBar from '@/components/shared/LeftsideBar';
import RightsideBar from '@/components/shared/RightsideBar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={`${inter.className} bg-dark-1`}>
          <TopBar />

          <main className='flex flex-row'>
            <LeftsideBar />
            <section className='main-container'>
              <div className='w-full max-w-4xl'>{children}</div>
            </section>
            {/* @ts-ignore */}
            <RightsideBar />
          </main>

          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  )
}
