import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSurvey } from "@/context/SurveyContext";
import { useNavigate } from "react-router-dom";
import { Mic2, FileText, Edit3, ArrowLeft, CheckSquare } from "lucide-react";

const Review = () => {
  const { demographics, responses, submit } = useSurvey();
  const navigate = useNavigate();

  const onSend = async () => {
    await submit();
    navigate('/thank-you');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="container max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Revise as suas respostas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h2 className="text-xl">Dados demográficos</h2>
              <p className="text-muted-foreground">Gênero: {demographics.gender || '—'}</p>
              <p className="text-muted-foreground">Idade: {demographics.age || '—'}</p>
              <p className="text-muted-foreground">Residente: {demographics.resident === undefined ? '—' : demographics.resident ? 'Sim' : 'Não'}</p>
            </section>

            {(() => {
              const items = [
                { k: 'future_vision' as const, t: 'Como imagina a cidade daqui a 30 anos?', i: 1 },
                { k: 'magic_wand' as const, t: 'Se tivesse uma varinha mágica, o que mudaria neste espaço?', i: 2 },
                { k: 'what_is_missing' as const, t: 'O que desapareceu aqui que faz muita falta?', i: 3 },
              ];
              return items.map(({ k, t, i }) => (
                <section key={k} className="border rounded-md p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{t}</h3>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/q/${i}`)}>
                      <Edit3 className="mr-2" /> Editar
                    </Button>
                  </div>
                  {responses[k].text && (
                    <div className="p-3 rounded-md bg-background/50 border mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><FileText className="w-5 h-5" /> Texto</div>
                      <p className="whitespace-pre-wrap">{responses[k].text}</p>
                    </div>
                  )}
                  {responses[k].audio && (
                    <div className="p-3 rounded-md bg-background/50 border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Mic2 className="w-5 h-5" /> Áudio</div>
                      <audio src={responses[k].audio || undefined} controls className="w-full" />
                    </div>
                  )}
                  {!responses[k].text && !responses[k].audio && (
                    <p className="text-muted-foreground">Sem resposta.</p>
                  )}
                </section>
              ));
            })()}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => navigate('/q/3')}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <Button variant="default" onClick={onSend}>
                <CheckSquare className="w-5 h-5 mr-2" />
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Review;
