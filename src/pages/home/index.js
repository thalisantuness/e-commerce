import React, { useEffect } from "react";
import NavBar from "../../components/NavBar/index";
import BannerPrimary from "../../components/BannerPrimary/index";
import HomeProducts from "../../components/HomeProducts/index";
import Footer from "../../components/Footer/index";
import ReactWhatsappButton from "react-whatsapp-button";
import { getUserName } from "../../services/authService";
import { useProduto } from "../../context/ProdutoContext";
import "../../global.css";

function Home() {
  const { empresaAtual } = useProduto();

  // Atualizar título da página com nome da empresa ou usuário
  useEffect(() => {
    const updateTitle = () => {
      // Prioridade: nome da empresa > nome do usuário > padrão
      if (empresaAtual && empresaAtual.nome) {
        document.title = empresaAtual.nome;
        console.log('📝 Título da página atualizado com nome da empresa:', empresaAtual.nome);
      } else {
        const userName = getUserName();
        const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
        
        if (token && userName) {
          document.title = userName;
          console.log('📝 Título da página atualizado com nome do usuário:', userName);
        } else {
          document.title = 'Marketplace';
        }
      }
    };
    
    // Atualizar imediatamente
    updateTitle();
    
    // Listener para mudanças no localStorage (quando usuário faz login em outra aba)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "auth_token" || e.key === "user_name") {
        updateTitle();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Verificar mudanças periodicamente (para atualizar após login na mesma aba)
    const interval = setInterval(() => {
      updateTitle();
    }, 1000);
    
    // Cleanup: restaurar título padrão quando sair da página
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
      document.title = 'Marketplace';
    };
  }, [empresaAtual]);

  return (
    <div className="home-container">
      <ReactWhatsappButton countryCode="55" phoneNumber="99293516" />
      <NavBar />
      <main className="home-content">
        <BannerPrimary />
        <HomeProducts />
        {/* <Blog /> */}
        {/* <Companies /> */}
      </main>
      <Footer /> 
    </div>
  );
}

export default Home;