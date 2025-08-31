import { AvatarGenerator } from "@/components/avatar-generator";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Anubis Dog AI Logo"
              width={48}
              height={48}
              className="w-12 h-12 sm:w-16 sm:h-16"
            />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-headline text-primary">
              Anubis Dog AI
            </h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Transform your profile picture into a masterpiece of ancient royalty
            with a futuristic Anubis twist.
          </p>
        </header>
        <main>
          <AvatarGenerator />
        </main>
      </div>
      <footer className="text-center mt-8 text-muted-foreground text-xs sm:text-sm font-body">
        <p>Become part of Anubis Dog AI — Transform your profile now.</p>
      </footer>
    </div>
  );
}
