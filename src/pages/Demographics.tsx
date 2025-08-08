import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSurvey } from "@/context/SurveyContext";
import { useNavigate } from "react-router-dom";

const Demographics = () => {
  const { demographics, setDemographics } = useSurvey();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="container max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Dados Demográficos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-xl mb-3">Gênero</h2>
              <RadioGroup
                value={demographics.gender}
                onValueChange={(v) => setDemographics({ ...demographics, gender: v as any })}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {['Masculino','Feminino','Não-binário','Prefiro não responder'].map((opt) => (
                  <div key={opt} className="flex items-center space-x-2 border rounded-md p-3 bg-card">
                    <RadioGroupItem id={opt} value={opt} />
                    <Label htmlFor={opt}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </section>

            <section>
              <h2 className="text-xl mb-3">Idade</h2>
              <RadioGroup
                value={demographics.age}
                onValueChange={(v) => setDemographics({ ...demographics, age: v as any })}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {['Até 18','19-25','26-35','36-45','46-60','60+'].map((opt) => (
                  <div key={opt} className="flex items-center space-x-2 border rounded-md p-3 bg-card">
                    <RadioGroupItem id={opt} value={opt} />
                    <Label htmlFor={opt}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </section>

            <section>
              <h2 className="text-xl mb-3">És residente de Guimarães?</h2>
              <RadioGroup
                value={
                  demographics.resident === undefined ? undefined : demographics.resident ? 'Sim' : 'Não'
                }
                onValueChange={(v) => setDemographics({ ...demographics, resident: v === 'Sim' })}
                className="grid grid-cols-2 gap-3"
              >
                {['Sim','Não'].map((opt) => (
                  <div key={opt} className="flex items-center space-x-2 border rounded-md p-3 bg-card">
                    <RadioGroupItem id={opt} value={opt} />
                    <Label htmlFor={opt}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </section>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
              <Button variant="hero" onClick={() => navigate('/q/1')}>Continuar</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Demographics;
