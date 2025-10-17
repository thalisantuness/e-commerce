import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ProdutoProvider } from "./context/ProdutoContext"; // CORRIGIDO: ProductProvider → ProdutoProvider
import "./global.css";

import Home from "./pages/home";
import ImovelListPage from "./pages/imovel-list";
import ProductListDetails from "./pages/product-details";
import RegisterImovel from "./pages/register-imovel-admin";
import ImovelListAdminPage from "./pages/imovel-list-admin";
import LoginAdmin from "./pages/login-admin";
import ProtectRoute from "./components/ProtectRoute";
import EditImovel from "./pages/edit-imovel-admin";
import Cart from "./pages/cart";

function App() {
  return (
    <ProdutoProvider> {/* CORRIGIDO: ProductProvider → ProdutoProvider */}
      <Router>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imovel-list" element={<ImovelListPage />} />
           <Route path="/detalhes-produto/:id" element={<ProductListDetails />} />
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/cart" element={<Cart />} />
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