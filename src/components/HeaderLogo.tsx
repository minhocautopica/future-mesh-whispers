import React from "react";
import { Link, useLocation } from "react-router-dom";

const HeaderLogo = () => {
  const location = useLocation();
  const isReviewPage = location.pathname === '/review';
  const isThankYouPage = location.pathname === '/thank-you';
  const isHomePage = location.pathname === '/';
  
  if (isReviewPage) return null;
  
  const getLogoSize = () => {
    if (isHomePage) return "h-48 w-48 md:h-56 md:w-56";
    return "h-32 w-32 md:h-40 md:w-40";
  };
  
  const getTopPosition = () => {
    if (isThankYouPage) return "top-6";
    if (isHomePage) return "top-6 md:top-8";
    return "top-6";
  };
  
  return (
    <header className={`fixed inset-x-0 z-50 pointer-events-none ${getTopPosition()}`} aria-label="Site logo">
      <div className={`container max-w-3xl mx-auto px-4 md:px-6 ${isThankYouPage ? 'text-center' : ''}`}>
        <Link
          to="/"
          aria-label="Ir para a página inicial"
          className="pointer-events-auto inline-block"
        >
          <img
            src="/lovable-uploads/be59a410-541d-4f1a-b906-40f6c6ceaf12.png"
            alt="Logo Futuro em Rede Guimarães"
            className={`${getLogoSize()} rounded-full object-cover`}
            loading="eager"
          />
        </Link>
      </div>
    </header>
  );
};

export default HeaderLogo;
