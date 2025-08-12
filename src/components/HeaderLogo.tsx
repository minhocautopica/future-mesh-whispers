import React from "react";

const HeaderLogo = () => {
  return (
    <header className="fixed left-4 top-4 z-50" aria-label="Site logo">
      <a href="/" aria-label="Ir para a página inicial">
        <img
          src="/lovable-uploads/be59a410-541d-4f1a-b906-40f6c6ceaf12.png"
          alt="Logo Futuro em Rede Guimarães"
          className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover"
          loading="eager"
        />
      </a>
    </header>
  );
};

export default HeaderLogo;
