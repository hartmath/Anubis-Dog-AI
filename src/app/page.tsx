import { AvatarGenerator } from "@/components/avatar-generator";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter } from "lucide-react";

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
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
