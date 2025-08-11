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
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <main className="container max-w-lg space-y-4">
        <h1 className="text-4xl">Obrigado por partilhar a sua visão!</h1>
        <p className="text-lg text-muted-foreground">A sua participação foi registrada.</p>
        <p className="text-md">Participante nº {count} do dia</p>
        <Button variant="hero" size="lg" asChild>
          <Link to="/">NOVA PARTICIPAÇÃO</Link>
        </Button>
      </main>
    </div>
  );
};

export default ThankYou;
