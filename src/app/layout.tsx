import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Unified QA Security Platform',
  description: 'Agent-native QA and security testing harness for web apps.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
