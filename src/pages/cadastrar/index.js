import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/apiConfig";
import NavBar from "../../components/NavBar/index";
import Footer from "../../components/Footer/index";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./styles.css";

function Cadastrar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    foto_perfil: null
  });
  const [loading, setLoading] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione uma imagem válida", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, foto_perfil: base64String });
        setPreviewFoto(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
      return;
    }

    try {
      // Preparar dados para envio
      const dadosCadastro = {
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        role: "cliente", // Sempre cliente para cadastros públicos
        ...(formData.foto_perfil && { foto_perfil: formData.foto_perfil })
      };

      await axios.post(
        `${API_BASE_URL}/cadastrar`,
        dadosCadastro,
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Cadastro realizado com sucesso!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate("/login-admin");
      }, 2000);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      
      const errorMessage = error.response?.data?.message || "Erro desconhecido ao cadastrar!";
      
      toast.error(`Erro ao cadastrar: ${errorMessage}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <NavBar />
      <div className="cadastro-container">
        <ToastContainer />
        <div className="cadastro-card">
          <h2 className="cadastro-title">Criar Conta</h2>
          <p className="cadastro-subtitle">Preencha os dados abaixo para criar sua conta</p>
          
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome" className="input-label">Nome Completo</label>
              <input
                id="nome"
                className="cadastro-input"
                type="text"
                name="nome"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone" className="input-label">Telefone</label>
              <input
                id="telefone"
                className="cadastro-input"
                type="tel"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = value.slice(0, 11); // Limita a 11 dígitos
                  setFormData({ ...formData, telefone: value });
                }}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                className="cadastro-input"
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
                className="cadastro-input"
                type="password"
                name="senha"
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha" className="input-label">Confirmar Senha</label>
              <input
                id="confirmarSenha"
                className="cadastro-input"
                type="password"
                name="confirmarSenha"
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="foto_perfil" className="input-label">Foto de Perfil (Opcional)</label>
              <input
                id="foto_perfil"
                className="cadastro-input-file"
                type="file"
                name="foto_perfil"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              {previewFoto && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={previewFoto}
                    alt="Preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0'
                    }}
                  />
                </div>
              )}
            </div>
            
            <button className="cadastro-button" type="submit" disabled={loading}>
              {loading ? (
                <span className="button-loader"></span>
              ) : (
                "Cadastrar"
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Já tem uma conta?{" "}
              <Link
                to="/login-admin"
                style={{
                  color: '#3182ce',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cadastrar;

