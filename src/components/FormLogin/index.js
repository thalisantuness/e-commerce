import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/apiConfig";
import "./styles.css";
import { ToastContainer, toast } from 'react-toastify';

export default function FormLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      ); 
      
      const token = response.data.token;
      const usuario = response.data.usuario;
      
      if (token) {
          toast.success("Login realizado com sucesso!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
        
        // Salvar token e informações do usuário
        localStorage.setItem("token", token);
        
        if (usuario) {
          localStorage.setItem("user_id", usuario.usuario_id);
          localStorage.setItem("user_name", usuario.nome);
          localStorage.setItem("user_email", usuario.email);
          localStorage.setItem("user_type", usuario.role);
          if (usuario.telefone) {
            localStorage.setItem("user_phone", usuario.telefone);
          }
          
          // Salvar foto do perfil do usuário - prioridade para foto_perfil
          const foto = usuario.foto_perfil || 
                       usuario.foto_principal || 
                       usuario.imageData || 
                       usuario.image || 
                       usuario.url_imagem || 
                       usuario.avatar || 
                       usuario.photo || 
                       "";
          
          if (foto) {
            localStorage.setItem("user_photo", foto);
            console.log("📸 Foto de perfil salva:", foto);
          } else {
            localStorage.removeItem("user_photo");
            console.log("⚠️ Usuário não possui foto de perfil");
          }
        }
        
        // Redireciona para a home após login bem-sucedido
        window.location.href = "/";
        
        /* CÓDIGO ORIGINAL - REDIRECIONAMENTO PARA ADMIN (mantido para uso futuro)
        window.location.href = "/imovel-list-admin";
        */ 
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
        
      
      const errorMessage = error.response?.data?.message || "Erro desconhecido ao logar!";

      toast.error(`Erro ao logar: ${errorMessage}`, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div className="login-card">
        <h2 className="login-title">Acesso Cliente</h2>
        <p className="login-subtitle">Insira suas credenciais para acessar o painel</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              id="email"
              className="login-input"
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="senha" className="input-label">Senha</label>
            <input
              id="senha"
              className="login-input"
              type="password"
              name="senha"
              placeholder="••••••••"
              value={formData.senha}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button className="login-button" type="submit" disabled={loading}>
            {loading ? (
              <span className="button-loader"></span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '12px' }}>
            Não tem uma conta?
          </p>
          <button
            type="button"
            onClick={() => navigate('/cadastrar')}
            style={{
              background: 'transparent',
              border: '1px solid #3182ce',
              color: '#3182ce',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3182ce';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#3182ce';
            }}
          >
            Cadastrar-se
          </button>
        </div>
      </div>
    </div>
  );
}