import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeSync } from '@/components/theme/theme-sync';
import { AuthProvider } from '@/features/auth/auth-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastContainer } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'NNN – Neural Network Nook',
  description: 'Build, visualise, and explore neural networks on an interactive infinite canvas.',
  keywords: ['neural network', 'machine learning', 'deep learning', 'visualisation', 'education'],
  authors: [{ name: 'Neural Network Nook' }],
  openGraph: {
    title: 'NNN – Neural Network Nook',
    description: 'Build neural networks visually. Design, connect, and explore on an infinite canvas.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider delayDuration={300}>
            <AuthProvider>
              <ThemeSync />
              {children}
              <ToastContainer />
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
