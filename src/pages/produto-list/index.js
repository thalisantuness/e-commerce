import React from "react";
import NavBar from "../../components/NavBar/index";
import Footer from "../../components/Footer/index";
import ProdutosList from "../../components/ProdutosList";
import ReactWhatsappButton from "react-whatsapp-button";
import "./style.css";
import "../../global.css";

function ProdutoListPage() {
  return (
    <div className="produtos-container">
      <ReactWhatsappButton countryCode="55" phoneNumber="99293516" />
      <NavBar />

      <div className="produtos-header-section">
        <h1>Nossos Produtos</h1>
        <p>Encontre os melhores produtos para você</p>
      </div>

      <ProdutosList />

      <Footer />
    </div>
  );
}

export default ProdutoListPage;

