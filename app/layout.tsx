import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TD Chatbot',
  description: 'Chatbot powered by Treasure Data Agent API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
