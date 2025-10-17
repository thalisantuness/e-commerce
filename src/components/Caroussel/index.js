import React, { useState } from "react";
import { useProduto } from "../../context/ProdutoContext";

import "./style.css";

function Caroussel() {
  const { imagens } = useProduto(); 
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prevIndex) => (prevIndex + 1) % imagens.length);
  };

  const prevSlide = () => {
    setIndex((prevIndex) => (prevIndex - 1 + imagens.length) % imagens.length);
  };

  return (
    <div className="carrousel">
      <button className="prev" onClick={prevSlide}>{"<"}</button>
      
      <div className="carrousel-images">
        {imagens.map((img, i) => (
          <img 
            key={i} 
            src={img} 
            alt={`Slide ${i}`} 
            className={i === index ? "active" : "hidden"} 
          />
        ))}
      </div>

      <button className="next" onClick={nextSlide}>{">"}</button>
    </div>
  );
}

export default Caroussel;
