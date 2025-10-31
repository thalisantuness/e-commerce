import React, { useEffect } from "react";
import NavBar from "../../components/NavBar/index";
import BannerPrimary from "../../components/BannerPrimary/index";
import HomeProducts from "../../components/HomeProducts/index";
import Footer from "../../components/Footer/index";
import ReactWhatsappButton from "react-whatsapp-button";
import Statistics from "../../components/Statistics";
import Blog from "../../components/Blog";
import Companies from "../../components/CompaniesWorked"; 
import { getUserName } from "../../services/authService";
import "../../global.css";

function Home() {
  // Atualizar título da página com nome do usuário
  useEffect(() => {
    const updateTitle = () => {
      const userName = getUserName();
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      
      if (token && userName) {
        document.title = userName;
        console.log('📝 Título da página atualizado com nome do usuário:', userName);
      } else {
        document.title = 'E-commerce';
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
      document.title = 'E-commerce';
    };
  }, []);

  return (
    <div className="home-container">
      <ReactWhatsappButton countryCode="81" phoneNumber="92200646" />
      <NavBar />
      <main className="home-content">
        <BannerPrimary />
        <HomeProducts />
        <Statistics />
        {/* <Blog /> */}
        {/* <Companies /> */}
      </main>
      <Footer /> 
    </div>
  );
}

export default Home;