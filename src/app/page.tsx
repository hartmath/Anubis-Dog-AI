import { AvatarGenerator } from "@/components/avatar-generator";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Twitter, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Image
              src="/logo.png"
              alt="Anubis Dog AI Logo"
              width={32}
              height={32}
              className="w-6 h-6 md:w-8 md:h-8"
            />
            <span className="font-headline text-lg md:text-xl text-foreground">
              Anubis Dog AI
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AvatarGenerator />
      </main>

      <footer className="py-6 md:py-8 text-center text-muted-foreground text-xs md:text-sm">
        <div className="container max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <p>&copy; {new Date().getFullYear()} Anubis Dog AI. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://x.com/ctoando" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://t.me/andocto" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-muted-foreground hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l16.4-5.98c.72-.26 1.39.24 1.15 1.1l-3.3 15.55c-.27.9-.96 1.12-1.78.73l-5.42-3.99l-2.55 2.45c-.28.27-.64.44-1.01.44z"></path></svg>
            </a>
            <a href="https://www.geckoterminal.com/ton/pools/EQDLTkY_oTODgSiqcrsYcmQ1Jf8XY3PDX3DIXuGD2q2-V6CC" target="_blank" rel="noopener noreferrer" aria-label="GeckoTerminal" className="text-muted-foreground hover:text-primary transition-colors">
              <TrendingUp className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
