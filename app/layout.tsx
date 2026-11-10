import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayPilot AI - Autonomous PayPal Financial Agent & Invoicing Copilot",
  description: "An AI agent that helps small businesses automate invoicing, track payments, and flag fraud in real time using PayPal's APIs.",
  icons: {
    icon: "https://www.paypalobjects.com/webstatic/icon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
