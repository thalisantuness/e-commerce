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
        'Vista o amor pelo seu time.',
        1000, 
        'Seu time, seu nome, seu estilo.',
        1000,
        'Camisas que representam o que corre nas suas veias.',
        1000,
        'Para quem carrega o time no peito, literalmente.',
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
