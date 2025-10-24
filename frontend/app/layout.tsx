import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUMP402 - First x402 Meme Token Launchpad",
  description: "Mint PUMP tokens using the revolutionary x402 Payment Protocol. Pay with USDC, get PUMP tokens instantly!",
  keywords: "x402, HTTP 402, meme token, Base, PUMP, cryptocurrency, web3, payment protocol",
  openGraph: {
    title: "PUMP402 - x402 Protocol Meme Token",
    description: "First meme token using HTTP 402 payment protocol on Base",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

