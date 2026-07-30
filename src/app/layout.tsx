import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Trolley OS - Agaram Acolytes",
  description: "Light human-designed Smart Trolley application dashboard for Team Agaram Acolytes",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
