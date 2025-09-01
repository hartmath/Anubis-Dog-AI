import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Anubis Dog AI",
  description: "Generate your own Anubis Dog AI avatar.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Anubis Dog AI",
    description: "Generate your own Anubis Dog AI avatar.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Anubis Dog AI",
      },
    ],
    url: "https://anubisdog.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anubis Dog AI",
    description: "Generate your own Anubis Dog AI avatar.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Roboto+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("font-body antialiased")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
