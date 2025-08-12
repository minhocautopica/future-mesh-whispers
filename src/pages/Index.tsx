import { Button } from "@/components/ui/button";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <Seo
        title="Futuro em Rede - Já pensaste como será o futuro em Guimarães?"
        description="Vamos construir uma visão coletiva para aqui. Participe e compartilhe sua visão para Guimarães."
        canonical="/"
      />
      <ConnectionBadge />


      <main className="container max-w-3xl mx-auto text-left px-6">
        <header className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl leading-tight font-display text-foreground">
            Já pensaste como será o futuro em Guimarães?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Vamos construir uma visão coletiva para aqui.</p>
        </header>
        <section className="space-y-6">
          <Button size="xl" variant="hero" asChild className="group rounded-xl">
            <a href="/terms" aria-label="Toca para começar">
              Toca para começar
              <ArrowRight className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">Associação Minhoca Utópica</p>
        </section>
      </main>
    </div>
  );
};

export default Index;
