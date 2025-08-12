import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioRecorder } from "@/components/AudioRecorder";
import { useSurvey } from "@/context/SurveyContext";
import { useNavigate } from "react-router-dom";
import { PenTool, Mic2, ArrowLeft, ArrowRight, MessageCircle, Wand2, Heart } from "lucide-react";
import { useState } from "react";

const prompts = {
  1: {
    key: 'future_vision' as const,
    title: 'Como imagina a cidade daqui a 30 anos?',
    icon: MessageCircle,
  },
  2: {
    key: 'magic_wand' as const,
    title: 'Se tivesse uma varinha mágica, o que mudaria neste espaço?',
    icon: Wand2,
  },
  3: {
    key: 'what_is_missing' as const,
    title: 'O que desapareceu aqui que faz muita falta?',
    icon: Heart,
  },
};

const Question = ({ id }: { id: 1 | 2 | 3 }) => {
  const navigate = useNavigate();
  const { responses, updateResponse } = useSurvey();
  const { key, title, icon: Icon } = prompts[id];

  const current = responses[key];
  const [mode, setMode] = useState<'text' | 'audio' | null>(current?.audio ? 'audio' : current?.text ? 'text' : null);
  const isAnswered = !!(current?.text || current?.audio);

  const next = async () => {
    if (id < 3) navigate(`/q/${id + 1}`);
    else {
      navigate('/review');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6">
      <main className="container max-w-3xl">
        <Card key={id}>
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <Icon className="w-12 h-12 text-primary" />
              <CardTitle className="text-xl md:text-2xl text-center leading-tight">{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset>
              <legend className="sr-only">Escolha o tipo de resposta</legend>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant={mode === 'text' ? 'default' : 'outline'} size="lg" onClick={() => setMode('text')} disabled={mode === 'audio'} className="w-full sm:w-auto">
                  <PenTool className="w-5 h-5 mr-2" /> Escrever
                </Button>
                <Button variant={mode === 'audio' ? 'default' : 'outline'} size="lg" onClick={() => setMode('audio')} disabled={mode === 'text'} className="w-full sm:w-auto">
                  <Mic2 className="w-5 h-5 mr-2" /> Gravar voz
                </Button>
              </div>
            </fieldset>

            {mode === 'text' && (
              <Textarea
                placeholder="Escreva aqui a sua resposta"
                className="min-h-40 bg-card"
                value={current?.text || ''}
                onChange={(e) => updateResponse(key, { text: e.target.value })}
              />
            )}

            {mode === 'audio' && (
              <AudioRecorder
                onAudioReady={(b64) => updateResponse(key, { audio: b64 })}
                audioUrl={current?.audio}
              />
            )}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button variant="outline" onClick={() => navigate(id === 1 ? '/demographics/residente' : `/q/${id - 1}`)} className="w-full sm:w-auto">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <Button variant="default" onClick={next} disabled={!isAnswered} className="w-full sm:w-auto">
                {id < 3 ? 'Próxima' : 'Revisar'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Question;
