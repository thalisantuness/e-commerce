import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaBox, FaTag, FaWarehouse, FaShoppingCart, FaWhatsapp } from "react-icons/fa";
import "./style.css";

function ProductListDetails() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        if (id) {
          const response = await axios.get(
            `https://back-pdv-production.up.railway.app/produtos/${id}`
          );
          setProduto(response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="loading-container">
        <p>Produto não encontrado</p>
        <button onClick={handleBack} className="back-button">
          <IoIosArrowBack className="back-icon" />
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <NavBar />
      
      <div className="product-details-container">
        <button onClick={handleBack} className="back-button">
          <IoIosArrowBack className="back-icon" />
          Voltar para lista
        </button>
        
        <div className="product-content-wrapper">
          <div className="product-media-section">
            <div className="carousel-container">
              <div className="main-carousel">
                <div className="slide-container">
                  <img 
                    src={produto.foto_principal} 
                    alt={produto.nome}
                    className="active-slide"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=Imagem+Indisponível';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="product-info-section">
            <div className="property-details">
              <div className="property-header">
                <h1 className="property-title product-text-black">{produto.nome}</h1>
                <div className="property-location">
                  <FaTag className="location-icon" />
                  <span className="product-text-black">{produto.tipo_produto}</span>
                </div>
              </div>

              <div className="property-price-section">
                <div className="price-container">
                  <span className="price-value product-text-black">
                    {formatCurrency(produto.valor)}
                  </span>
                </div>
                <div className="condominium-fee">
                  <span className="product-text-black">
                    {produto.tipo_comercializacao === 'Venda' ? 'Produto para Venda' : 'Produto em Promoção'}
                  </span>
                </div>
              </div>

              <div className="property-features">
                <div className="feature-item">
                  <FaBox className="feature-icon" />
                  <span className="product-text-black">{produto.quantidade} em estoque</span>
                </div>
                <div className="feature-item">
                  <FaTag className="feature-icon" />
                  <span className="product-text-black">{produto.tipo_comercializacao}</span>
                </div>
                <div className="feature-item">
                  <FaWarehouse className="feature-icon" />
                  <span className="product-text-black">{produto.tipo_produto}</span>
                </div>
                <div className="feature-item">
                  <FaShoppingCart className="feature-icon" />
                  <span className="product-text-black">Disponível</span>
                </div>
              </div>

              <div className="property-description-details">
                <h3 className="section-title">
                  Descrição do Produto
                </h3>
                <p className="product-text-black">
                  {produto.descricao || `Produto ${produto.nome} de alta qualidade. ${produto.tipo_comercializacao === 'Venda' ? 'Disponível para venda.' : 'Em promoção por tempo limitado.'}`}
                </p>
              </div>

              <div className="property-details-grid">
                <div className="details-section">
                  <h4 className="section-title">Informações do Produto</h4>
                  <ul className="details-list">
                    <li className="product-text-black">
                      <strong>Nome:</strong> {produto.nome}
                    </li>
                    <li className="product-text-black">
                      <strong>Categoria:</strong> {produto.tipo_produto}
                    </li>
                    <li className="product-text-black">
                      <strong>Tipo:</strong> {produto.tipo_comercializacao}
                    </li>
                    <li className="product-text-black">
                      <strong>Estoque:</strong> {produto.quantidade} unidades
                    </li>
                  </ul>
                </div>

                <div className="details-section">
                  <h4 className="section-title">Valores</h4>
                  <ul className="details-list">
                    <li className="product-text-black">
                      <strong>Preço:</strong> {formatCurrency(produto.valor)}
                    </li>
                    <li className="product-text-black">
                      <strong>Status:</strong> {produto.quantidade > 0 ? 'Disponível' : 'Esgotado'}
                    </li>
                    <li className="product-text-black">
                      <strong>Cadastro:</strong> {new Date(produto.data_cadastro).toLocaleDateString('pt-BR')}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="contact-section">
                <a 
                  href={`https://wa.me/558192200646?text=Olá! Gostaria de mais informações sobre o produto: ${produto.nome}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button"
                >
                  <FaWhatsapp />
                  Entrar em Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default ProductListDetails;