import 'reflect-metadata';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import '@/lib/container';
import { PrepaidCardTemplateProvider } from '@/context/prepaid-card-template-context';
import { PrepaidCardProvider } from '@/context/prepaid-card-context';
import { DriverProvider } from '@/context/driver-context';
import { CashoutRequestProvider } from '@/context/cashout-request-context';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = { title: 'Fady' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PrepaidCardTemplateProvider>
          <PrepaidCardProvider>
            <DriverProvider>
              <CashoutRequestProvider>
                {children}
              </CashoutRequestProvider>
            </DriverProvider>
          </PrepaidCardProvider>
        </PrepaidCardTemplateProvider>

        <Toaster />
      </body>
    </html>
  );
}
