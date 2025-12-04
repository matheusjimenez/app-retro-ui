import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Retrospectiva Medcof 2024',
  description: 'Veja sua jornada de estudos em medicina durante o ano',
  openGraph: {
    title: 'Retrospectiva Medcof 2024',
    description: 'Veja sua jornada de estudos em medicina durante o ano',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-[#0A0A0A] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
