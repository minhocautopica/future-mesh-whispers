import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSurvey } from "@/context/SurveyContext";
import { useNavigate } from "react-router-dom";
import { Home, MapPin } from "lucide-react";
import { useState } from "react";

const options = ['Sim','Não'] as const;

type Opt = typeof options[number];

const DemographicsResident = () => {
  const { demographics, setDemographics } = useSurvey();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Opt | undefined>(
    demographics.resident === undefined ? undefined : demographics.resident ? 'Sim' : 'Não'
  );

  const proceed = () => {
    if (!selected) return;
    setDemographics({ ...demographics, resident: selected === 'Sim' });
    navigate('/q/1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="container max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Home className="text-primary" /> És residente de Guimarães?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {options.map((opt) => (
                <Button
                  key={opt}
                  variant={selected === opt ? 'hero' : 'outline'}
                  size="xl"
                  className="justify-center h-16"
                  onClick={() => setSelected(opt)}
                  aria-pressed={selected === opt}
                >
                  {opt === 'Sim' ? <Home /> : <MapPin />} <span className="ml-2">{opt}</span>
                </Button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
              <Button variant="hero" disabled={!selected} onClick={proceed}>Continuar</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DemographicsResident;
