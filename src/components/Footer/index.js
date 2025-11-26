import React from "react";
import "./styles.css";
import { Link } from "react-router-dom";

function Footer() {
  // Logo fixa - sempre mostra logo-cardial.png

  return (
    <>
      <footer className="footer">
        <div className="footer-left">
          <img 
            src="/logo-cardial.png" 
            alt="Logo Cardial" 
            className="footer-logo"
            onError={(e) => {
              console.error('Erro ao carregar logo:', e);
            }}
          />
        </div>

        <div className="footer-right">
          <div className="footer-center">
            <ul className="footer-links">
              <li>
                <Link to="/produto-list">Produtos</Link>
              </li>
              <li>
                <a 
                href={`https://wa.me/555599293516?text=${encodeURIComponent('Olá, gostei de um produto que vi no seu site!')}`} 
                target="_blank"
                rel="noopener noreferrer" >
                  Contato
                </a>
              </li>
              {/* <li>
                <a href="#">Sobre Nós</a>
              </li> */}
            </ul>
          </div>
          {/* <div className="footer-center">
            <ul className="footer-links">
              <li>
                <a href="#">Instagram</a>
              </li>
            </ul>
          </div> */}
          {/* <div className="footer-center">
            <ul className="footer-links">
              <li>
                <a href="#">WhatsApp</a>
              </li>
            </ul>
          </div> */}
        </div>
      </footer>

      <footer className="footerEnd">
        <div className="footer-content">
          <p>Cardial I.T © 2025 - Todos os direitos reservados</p>
        </div>
        {/* <div className="footerEnd-links">
          <a href="#">Terms of Use</a>
          <a href="#">Privacy Policy</a>
        </div> */}
      </footer>
    </>
  );
}

export default Footer;
