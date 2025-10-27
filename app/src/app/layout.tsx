'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navButtonStyle = (isActive: boolean) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#0056b3' : '#0070f3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    border: isActive ? '2px solid #004085' : '2px solid transparent',
    transition: 'all 0.2s ease',
    display: 'inline-block',
    boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.1)',
  });

  return (
    <html lang="en">
      <head>
        <style>{`
          a:hover {
            background-color: #0056b3 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
          }
        `}</style>
      </head>
      <body>
        <nav style={{ 
          padding: '1rem 2rem', 
          borderBottom: '2px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Link href="/" style={{
            ...navButtonStyle(pathname === '/'),
            marginRight: '1rem'
          }}>Dashboard</Link>
          <Link href="/weather" style={navButtonStyle(pathname === '/weather')}>Weather Data</Link>
        </nav>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}