import type { Metadata } from 'next';
import './globals.css';
import { CommerceProvider } from '@/components/CommerceContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { NotificationToastContainer } from '@/components/NotificationToast';
import { BuyingAssistantButton } from '@/components/BuyingAssistantButton';

export const metadata: Metadata = {
  title: 'Cymbal Auto | UK Tyres, Autocentres & Mobile Fitting',
  description:
    'National UK tyre retailer and autocentre network in Birmingham, Bristol, and Croydon. Premium tyres, guaranteed laser wheel alignment, and certified technician fitting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased" suppressHydrationWarning>
        <CommerceProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <NotificationToastContainer />
          <BuyingAssistantButton />
        </CommerceProvider>
      </body>
    </html>
  );
}
