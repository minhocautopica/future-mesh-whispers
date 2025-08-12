import React from "react";
import { Link } from "react-router-dom";
const HeaderLogo = () => {
  return (
    <header className="fixed left-4 top-4 z-50" aria-label="Site logo">
      <Link to="/" aria-label="Ir para a página inicial">
        <img
          src="/lovable-uploads/be59a410-541d-4f1a-b906-40f6c6ceaf12.png"
          alt="Logo Futuro em Rede Guimarães"
          className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover"
          loading="eager"
        />
      </Link>
    </header>
  );
};

export default HeaderLogo;
