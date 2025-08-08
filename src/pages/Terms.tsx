import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="container max-w-3xl">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-3xl">Termos de Participação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <p>• Seus depoimentos serão gravados anonimamente.</p>
            <p>• Podem ser usados em atividades educativas e culturais.</p>
            <p>• Você pode desistir a qualquer momento.</p>
            <div className="flex gap-4 pt-4">
              <Button variant="hero" size="lg" asChild>
                <a href="/demographics">ACEITO</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/">NÃO ACEITO</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
