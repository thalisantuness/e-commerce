import React from "react";
import NavBar from "../../components/NavBar/index";
import Footer from "../../components/Footer/index";
import ImovelList from "../../components/ImovelList";
import ImovelFilter from "../../components/ImovelFilter";

import ReactWhatsappButton from "react-whatsapp-button";

import "./style.css";
import "../../global.css";

function ImovelListPage() {
  return (
    <div className="imovels-container">
      <ReactWhatsappButton countryCode="55" phoneNumber="99293516" />
      <NavBar />

      <h1>Filtre o imóvel dos seus sonhos</h1>

      <ImovelFilter />
      <ImovelList />

      {/* <Blog /> */}
      <Footer />
    </div>
  );
}

export default ImovelListPage;
