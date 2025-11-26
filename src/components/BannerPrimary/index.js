import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { TypeAnimation } from 'react-type-animation';

function Highlights() {
  const navigate = useNavigate();

  const handleVerMais = () => {
    navigate('/produto-list');
  };

  return (
    <div className="page-container">
    
    <TypeAnimation
      sequence={[
        'Tudo o que você procura, em um só lugar.',
        1000, 
        'Seu shopping online começa aqui.',
        1000,
        'Mais escolhas, melhores preços, sempre.',
        1000,
        'Compre fácil, receba rápido, viva melhor.',
        1000
      ]}
      wrapper="h1"
      speed={50}
      style={{ fontSize: '40px', display: 'inline-block' }}
      repeat={Infinity}
    />

      <p> 
      Preparado para essa experiência?</p> 
      <button onClick={handleVerMais}>Ver Mais</button>



    
    </div>
  );
}

export default Highlights;
