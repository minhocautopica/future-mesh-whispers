import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Demographics from './pages/Demographics';
import DemographicsGender from './pages/DemographicsGender';
import DemographicsAge from './pages/DemographicsAge';
import DemographicsResident from './pages/DemographicsResident';
import Question from './pages/Question';
import Review from './pages/Review';
import ThankYou from './pages/ThankYou';

const QRoute = () => {
  const { id } = useParams();
  const num = Number(id);
  if (![1, 2, 3].includes(num)) return <Navigate to="/q/1" replace />;
  return <Question id={num as 1 | 2 | 3} />;
};

const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;
