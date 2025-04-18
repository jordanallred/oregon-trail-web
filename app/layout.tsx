// File: app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Oregon Trail',
    description: 'A recreation of the classic Oregon Trail game',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="min-h-screen">
        <div className="crt-effect">{children}</div>
        </body>
        </html>
    );
}