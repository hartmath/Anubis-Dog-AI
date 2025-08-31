import { AvatarGenerator } from "@/components/avatar-generator";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Anubis Dog AI Logo"
              width={32}
              height={32}
            />
            <span className="font-headline text-xl text-foreground">
              Anubis Dog AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <a href="#upload" className="hover:text-primary">
              Upload
            </a>
            <a href="#preview" className="hover:text-primary">
              Adjust
            </a>
            <a href="#style" className="hover:text-primary">
              Style
            </a>
            <a href="#download" className="hover:text-primary">
              Download
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <AvatarGenerator />
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Anubis Dog AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
