import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioRecorder } from "@/components/AudioRecorder";
import { useSurvey } from "@/context/SurveyContext";
import { useNavigate } from "react-router-dom";

const prompts = {
  1: {
    key: 'future_vision' as const,
    title: 'Como imagina a cidade daqui a 30 anos?',
  },
  2: {
    key: 'magic_wand' as const,
    title: 'Se tivesse uma varinha mágica, o que mudaria neste espaço?',
  },
  3: {
    key: 'what_is_missing' as const,
    title: 'O que desapareceu aqui que faz muita falta?',
  },
};

const Question = ({ id }: { id: 1 | 2 | 3 }) => {
  const navigate = useNavigate();
  const { responses, updateResponse, submit } = useSurvey();
  const { key, title } = prompts[id];

  const current = responses[key];

  const next = async () => {
    if (id < 3) navigate(`/q/${id + 1}`);
    else {
      await submit();
      navigate('/thank-you');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="container max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="Escreva aqui a sua resposta"
              className="min-h-40 bg-card"
              value={current?.text || ''}
              onChange={(e) => updateResponse(key, { text: e.target.value })}
            />
            <AudioRecorder onAudioReady={(b64) => updateResponse(key, { audio: b64 })} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(id === 1 ? '/demographics' : `/q/${id - 1}`)}>Voltar</Button>
              <Button variant="hero" onClick={next}>{id < 3 ? 'Próxima' : 'Enviar'}</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Question;
