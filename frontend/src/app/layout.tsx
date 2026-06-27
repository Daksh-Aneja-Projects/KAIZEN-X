import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import EnterpriseCognitiveLayer from "@/cve/EnterpriseCognitiveLayer";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "KAIZEN-X Command Center",
  description: "Enterprise Failure Prevention System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased flex min-h-screen bg-[var(--color-background)] text-white`}>
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Topbar />
            <EnterpriseCognitiveLayer />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: 'black', border: '1px solid var(--color-border-subtle)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' } }} />
        </Providers>
      </body>
    </html>
  );
}
