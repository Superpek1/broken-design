// Root Layout — Lixyte
import type { Metadata } from 'next';
import { Chakra_Petch, Michroma, Share_Tech_Mono } from 'next/font/google';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import './globals.css';

const chakra = Chakra_Petch({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });
const michroma = Michroma({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-display' });
const shareTechMono = Share_Tech_Mono({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Lixyte',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${chakra.className} ${michroma.variable} ${shareTechMono.variable}`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
