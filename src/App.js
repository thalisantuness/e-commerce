import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ProdutoProvider } from "./context/ProdutoContext"; // CORRIGIDO: ProductProvider → ProdutoProvider
import "./global.css";

import Home from "./pages/home";
import ImovelListPage from "./pages/imovel-list";
import ProdutoListPage from "./pages/produto-list";
import ProductListDetails from "./pages/product-details";
import RegisterImovel from "./pages/register-imovel-admin";
import ImovelListAdminPage from "./pages/imovel-list-admin";
import LoginAdmin from "./pages/login-admin";
import Cadastrar from "./pages/cadastrar";
import ProtectRoute from "./components/ProtectRoute";
import EditImovel from "./pages/edit-imovel-admin";
import Cart from "./pages/cart";
import MeusPedidos from "./pages/meus-pedidos";
import Perfil from "./pages/perfil";
import ChatPage from "./pages/chat";

function App() {
  return (
    <ProdutoProvider> {/* CORRIGIDO: ProductProvider → ProdutoProvider */}
      <Router>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imovel-list" element={<ImovelListPage />} />
            <Route path="/produto-list" element={<ProdutoListPage />} />
            <Route path="/detalhes-produto/:id" element={<ProductListDetails />} />
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/cadastrar" element={<Cadastrar />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            <Route
              path="/chat"
              element={<ProtectRoute element={<ChatPage />} />}
            />
            <Route
              path="/perfil"
              element={<ProtectRoute element={<Perfil />} />}
            />
            <Route
              path="/editar-imovel/:id"
              element={<ProtectRoute element={<EditImovel />} />}
            />
            <Route
              path="/cadastro-imovel-admin"
              element={<ProtectRoute element={<RegisterImovel />} />}
            />
            <Route
              path="/imovel-list-admin"
              element={<ProtectRoute element={<ImovelListAdminPage />} />}
            />
          </Routes>
        </div>
      </Router>
    </ProdutoProvider> 
  );
}

export default App;