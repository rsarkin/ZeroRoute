import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '../providers/AuthProvider';
import { FamilyProvider } from '../providers/FamilyProvider';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const chido = localFont({
  src: '../public/fonts/chido.woff',
  variable: '--font-chido',
});

export const metadata: Metadata = {
  title: 'ZeroRoute — Family Carbon Intelligence',
  description: 'Track household energy, transport emissions, grow your family forest, and plan your reduction goals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${chido.variable} h-full antialiased`}>
      <body className="min-h-full bg-sand text-[#1a1a1a] flex flex-col md:flex-row font-sans">
        <AuthProvider>
          <FamilyProvider>
            <Navbar />
            <main className="flex-1 flex flex-col min-w-0 min-h-screen">
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              <Footer />
            </main>
          </FamilyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
