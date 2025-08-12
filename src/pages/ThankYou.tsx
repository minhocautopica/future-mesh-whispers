import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getTodayCount } from "@/utils/db";
import { Link } from "react-router-dom";
const ThankYou = () => {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    getTodayCount().then(setCount);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 md:px-6 pt-40 md:pt-48">
      <main className="container max-w-lg space-y-4 md:space-y-6">
        <h1 className="text-3xl md:text-4xl font-display leading-tight">Obrigado por partilhar a sua visão!</h1>
        <p className="text-base md:text-lg text-muted-foreground">A sua participação foi registrada.</p>
        <p className="text-sm md:text-base">Participante nº {count} do dia</p>
        <Button variant="hero" size="lg" asChild className="w-full md:w-auto">
          <Link to="/">NOVA PARTICIPAÇÃO</Link>
        </Button>
      </main>
    </div>
  );
};

export default ThankYou;
