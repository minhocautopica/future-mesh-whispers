import React from "react";
import { Link, useLocation } from "react-router-dom";

const HeaderLogo = () => {
  const location = useLocation();
  const isReviewPage = location.pathname === '/review';
  const isThankYouPage = location.pathname === '/thank-you';
  
  if (isReviewPage) return null;
  
  return (
    <header className={`fixed inset-x-0 z-50 pointer-events-none ${isThankYouPage ? 'top-8' : 'top-6'}`} aria-label="Site logo">
      <div className={`container max-w-3xl mx-auto px-6 ${isThankYouPage ? 'text-center' : ''}`}>
        <Link
          to="/"
          aria-label="Ir para a página inicial"
          className="pointer-events-auto inline-block"
        >
          <img
            src="/lovable-uploads/be59a410-541d-4f1a-b906-40f6c6ceaf12.png"
            alt="Logo Futuro em Rede Guimarães"
            className="h-40 w-40 rounded-full object-cover"
            loading="eager"
          />
        </Link>
      </div>
    </header>
  );
};

export default HeaderLogo;
