import { AvatarGenerator } from "@/components/avatar-generator";
import { Pyramid } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Pyramid className="w-10 h-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline text-primary">
              Pharaoh Avatar
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Transform your profile picture into a masterpiece of ancient royalty
            with a futuristic Anubis twist.
          </p>
        </header>
        <main>
          <AvatarGenerator />
        </main>
      </div>
      <footer className="text-center mt-8 md:mt-12 text-muted-foreground text-sm font-body">
        <p>Become part of Anubis Dog AI — Transform your profile now.</p>
      </footer>
    </div>
  );
}
