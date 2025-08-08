import { Button } from "@/components/ui/button";
import { ConnectionBadge } from "@/components/ConnectionBadge";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center hero-surface relative">
      <ConnectionBadge />
      <main className="container max-w-3xl mx-auto text-center px-6">
        <header className="mb-10">
          <h1 className="text-5xl md:text-6xl">FUTUROS EM REDE</h1>
          <p className="mt-4 text-lg text-muted-foreground">Imagine o futuro do Bairro C</p>
        </header>
        <section className="space-y-6">
          <Button size="xl" variant="hero" asChild>
            <a href="/terms" aria-label="Começar o questionário">COMEÇAR</a>
          </Button>
          <p className="text-sm text-muted-foreground">Associação Minhoca Utópica</p>
        </section>
      </main>
    </div>
  );
};

export default Index;
