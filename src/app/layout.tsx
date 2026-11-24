import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Detective's Desk | Noir Murder Mystery",
  description: "A gritty full-stack detective noir murder mystery game powered by Groq and GPT models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-noir-950 text-noir-100 min-h-screen antialiased selection:bg-amber-600 selection:text-white pointer-events-auto">
        {children}
      </body>
    </html>
  );
}
