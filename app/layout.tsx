import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MeetingProvider } from "./context/MeetingContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mitoo MOM Generator | Meeting Minutes Tool",
  description: "Generate professional Meeting Minutes (MOM) documents in PDF or DOCX format.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full" style={{ fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
        <MeetingProvider>
          {children}
        </MeetingProvider>
      </body>
    </html>
  );
}
