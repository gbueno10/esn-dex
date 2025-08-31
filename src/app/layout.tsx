import type { Metadata } from "next";
import "./globals.css";
import { AuthGate } from "@/components/AuthGate";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Meet Your ESNners",
  description: "Connect with ESN volunteers and unlock their profiles"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Meet Your ESNners" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthGate>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 pb-20">
              {children}
            </main>
            <BottomNavigation />
          </div>
        </AuthGate>
        <Toaster />
      </body>
    </html>
  );
}
