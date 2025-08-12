import React from "react";
import { Link } from "react-router-dom";
const HeaderLogo = () => {
  return (
    <header className="fixed inset-x-0 top-4 z-50 pointer-events-none" aria-label="Site logo">
      <div className="container max-w-3xl mx-auto px-6">
        <Link
          to="/"
          aria-label="Ir para a página inicial"
          className="pointer-events-auto inline-block"
        >
          <img
            src="/lovable-uploads/be59a410-541d-4f1a-b906-40f6c6ceaf12.png"
            alt="Logo Futuro em Rede Guimarães"
            className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover"
            loading="eager"
          />
        </Link>
      </div>
    </header>
  );
};

export default HeaderLogo;
