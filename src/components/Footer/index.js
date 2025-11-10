import React, { useState, useEffect } from "react";
import "./styles.css";
import Logo from "../../assets/logo-transparente.png"
import { Link } from "react-router-dom";
import { useProduto } from "../../context/ProdutoContext";


function Footer() {
  const { empresaAtual } = useProduto();
  const [empresaLogo, setEmpresaLogo] = useState(null);
  const [empresaNome, setEmpresaNome] = useState(null);

  // Função para obter a logo da empresa
  const getEmpresaLogo = (empresa) => {
    if (!empresa) return null;
    
    const logo = empresa.logo || 
                 empresa.logo_url ||
                 empresa.foto_perfil || 
                 empresa.foto_principal ||
                 empresa.imageData ||
                 empresa.url_logo;
    
    // Retornar apenas se for uma URL válida ou base64
    if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('data:image'))) {
      return logo;
    }
    
    return null;
  };

  // Atualizar logo da empresa quando empresaAtual mudar
  useEffect(() => {
    if (empresaAtual) {
      const logo = getEmpresaLogo(empresaAtual);
      setEmpresaLogo(logo);
      setEmpresaNome(empresaAtual.nome || empresaAtual.razao_social || empresaAtual.nome_fantasia || null);
    } else {
      setEmpresaLogo(null);
      setEmpresaNome(null);
    }
  }, [empresaAtual]);

  return (
    <>
      <footer className="footer">
        <div className="footer-left">
          {empresaLogo ? (
            <img 
              src={empresaLogo} 
              alt={empresaNome || "Logo da empresa"} 
              className="footer-logo"
              onError={(e) => {
                e.target.src = Logo;
              }}
            />
          ) : (
            <img src={Logo} alt="Logo" className="footer-logo" />
          )}
      
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
