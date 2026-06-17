import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORATO — Interview Preparation Platform",
  description:
    "ORATO helps you prepare for interviews with realistic practice sessions, personalized question sets from your resume, and detailed performance reports.",
  keywords: ["interview prep", "mock interview", "interview practice", "career prep", "job interview"],
  openGraph: {
    title: "ORATO — Practice Interviews That Feel Real",
    description: "Get interview-ready with personalized practice sessions, instant feedback, and performance analytics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} style={{ fontFamily: 'var(--font-inter), var(--font-sans)' }}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--orato-surface)',
                color: 'var(--orato-text-primary)',
                border: '1px solid var(--orato-border)',
                borderRadius: '12px',
                fontFamily: 'var(--font-inter)',
                fontSize: '14px',
                boxShadow: 'var(--shadow-hover)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--orato-success)',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--orato-error)',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
