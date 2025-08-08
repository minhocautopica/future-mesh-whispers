import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Demographics from "./pages/Demographics";
import DemographicsGender from "./pages/DemographicsGender";
import DemographicsAge from "./pages/DemographicsAge";
import DemographicsResident from "./pages/DemographicsResident";
import Question from "./pages/Question";
import Review from "./pages/Review";
import ThankYou from "./pages/ThankYou";
import { SurveyProvider } from "./context/SurveyContext";

const queryClient = new QueryClient();

const QRoute = () => {
  const { id } = useParams();
  const num = Number(id);
  if (![1, 2, 3].includes(num)) return <Navigate to="/q/1" replace />;
  return <Question id={num as 1 | 2 | 3} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SurveyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/demographics" element={<Demographics />} />
            <Route path="/demographics/genero" element={<DemographicsGender />} />
            <Route path="/demographics/idade" element={<DemographicsAge />} />
            <Route path="/demographics/residente" element={<DemographicsResident />} />
            <Route path="/q/:id" element={<QRoute />} />
            <Route path="/review" element={<Review />} />
            <Route path="/thank-you" element={<ThankYou />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SurveyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
