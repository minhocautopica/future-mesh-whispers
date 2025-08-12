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


      <main className="container max-w-3xl mx-auto text-left px-4 md:px-6 pt-56 md:pt-64">
        <header className="mb-8 md:mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight font-display text-foreground break-words">
            Já pensaste como será o futuro em Guimarães?
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-muted-foreground">Vamos construir uma visão coletiva para aqui.</p>
        </header>
        <section className="space-y-4 md:space-y-6">
          <div className="flex justify-end">
            <Button size="xl" variant="hero" asChild className="group rounded-xl w-full md:w-auto">
              <a href="/terms" aria-label="Toca para começar">
                Toca para começar
                <ArrowRight className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Associação Minhoca Utópica</p>
        </section>
      </main>
    </div>
  );
};

export default Index;
