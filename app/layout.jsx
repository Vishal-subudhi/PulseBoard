import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PulseBoard',
  description: 'Your private SaaS analytics dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0f1117] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}