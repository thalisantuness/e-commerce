import React from "react";
import { FaTshirt, FaShippingFast, FaHeadset, FaShieldAlt } from "react-icons/fa";
import "./styles.css";
import Roll from "react-reveal/Roll";

function Statistics() {
  return (
    <>
      <Roll right>
        <section className="products-stats">
          <div className="stats-container">
            <div className="stats-header">
              <h2>Porque Comprar na Nossa Loja?</h2>
              <p>Qualidade, confiança e o melhor atendimento para você</p>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">
                  <FaTshirt />
                </div>
                <div className="stat-content">
                  <h3>+5.000</h3>
                  <p>Camisas Vendidas</p>
                  <span>Produtos de alta qualidade</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <FaShippingFast />
                </div>
                <div className="stat-content">
                  <h3>Entrega Rápida</h3>
                  <p>2-5 Dias Úteis</p>
                  <span>Para todo Brasil</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <FaHeadset />
                </div>
                <div className="stat-content">
                  <h3>24 HORAS</h3> 
                  <p>Atendimento Personalizado</p>
                  <span>Via WhatsApp e Email</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <FaShieldAlt />
                </div>
                <div className="stat-content">
                  <h3>Compra Segura</h3>
                  <p>Garantia de 7 Dias</p>
                  <span>Pagamento protegido</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </Roll>
    </>
  );
}

export default Statistics;