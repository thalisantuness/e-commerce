import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCamera, 
  FaSave, 
  FaTimes,
  FaArrowLeft,
  FaEdit
} from "react-icons/fa";
import { buscarDadosUsuario, atualizarDadosUsuario, atualizarFotoUsuario, isAuthenticated } from "../../services/authService";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./styles.css";

function Perfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    foto_principal: ""
  });

  const [previewFoto, setPreviewFoto] = useState("");
  const [fotoOriginal, setFotoOriginal] = useState(""); // Para rastrear se a foto foi alterada

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login-admin");
      return;
    }
    
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const usuario = await buscarDadosUsuario();
      
      setFormData({
        nome: usuario.nome || "",
        email: usuario.email || "",
        telefone: usuario.telefone || "",
        foto_principal: usuario.foto_principal || usuario.foto_perfil || ""
      });

      // Definir preview da foto
      const foto = usuario.foto_principal || 
                   usuario.foto_perfil || 
                   usuario.imageData || 
                   usuario.image || 
                   usuario.url_imagem || 
                   usuario.avatar || 
                   usuario.photo || 
                   "";
      
      setPreviewFoto(foto);
      setFotoOriginal(foto); // Salvar foto original para comparação
      console.log('📸 Foto carregada do usuário:', foto ? `${foto.substring(0, 50)}...` : 'Nenhuma foto');
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setPreviewFoto(base64Image);
        // Converter para base64 para salvar como foto_principal
        setFormData(prev => ({
          ...prev,
          foto_principal: base64Image
        }));
        console.log('📸 Nova foto selecionada (base64):', base64Image.substring(0, 50) + '...');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validar campos obrigatórios
      if (!formData.nome.trim()) {
        toast.error('O nome é obrigatório');
        setSaving(false);
        return;
      }

      if (!formData.email.trim()) {
        toast.error('O email é obrigatório');
        setSaving(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Por favor, insira um email válido');
        setSaving(false);
        return;
      }

      // Verificar se a foto foi alterada
      const fotoFoiAlterada = formData.foto_principal && formData.foto_principal !== fotoOriginal;
      
      // Atualizar foto separadamente se foi alterada
      if (fotoFoiAlterada) {
        console.log('📸 Foto foi alterada, atualizando via rota específica...');
        await atualizarFotoUsuario(formData.foto_principal);
      }

      // Preparar dados para envio (sem foto_principal, pois ela é atualizada separadamente)
      const dadosAtualizados = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null
      };

      console.log('💾 Salvando perfil com dados:', dadosAtualizados);

      // Atualizar outros dados do perfil
      await atualizarDadosUsuario(dadosAtualizados);

      toast.success('Perfil atualizado com sucesso!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setIsEditing(false);
      
      // Recarregar dados atualizados (isso também atualizará fotoOriginal)
      await fetchUserData();
      
      // Forçar atualização da NavBar (recarregar página após 1 segundo)
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error(error.message || 'Erro ao atualizar perfil', {
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
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Recarregar dados originais
    fetchUserData();
    setIsEditing(false);
    // Resetar preview para foto original
    setPreviewFoto(fotoOriginal);
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <NavBar />
        <div className="perfil-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando perfil...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-page">
        <NavBar />
        <div className="perfil-container">
          <div className="error-state">
            <h2>Erro ao carregar perfil</h2>
            <p>{error}</p>
            <button onClick={fetchUserData} className="retry-btn">
              Tentar Novamente
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <ToastContainer />
      <NavBar />
      <div className="perfil-container">
        <div className="perfil-header">
          <Link to="/" className="back-link">
            <FaArrowLeft />
            Voltar
          </Link>
          <h1>Meu Perfil</h1>
        </div>

        <div className="perfil-content">
          <div className="perfil-card">
            {/* Seção de Foto de Perfil */}
            <div className="perfil-foto-section">
              <div className="foto-container">
                {previewFoto ? (
                  <img 
                    src={previewFoto} 
                    alt="Foto de perfil" 
                    className="foto-perfil"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="foto-placeholder"
                  style={{ display: previewFoto ? 'none' : 'flex' }}
                >
                  <FaUser />
                </div>
                
                {isEditing && (
                  <label className="foto-upload-btn">
                    <FaCamera />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      style={{ display: 'none' }}
                    />
                    Alterar Foto
                  </label>
                )}
              </div>
            </div>

            {/* Formulário de Dados */}
            <div className="perfil-form-section">
              <div className="form-group">
                <label>
                  <FaUser />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "disabled" : ""}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaEnvelope />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "disabled" : ""}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaPhone />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "disabled" : ""}
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Botões de Ação */}
              <div className="perfil-actions">
                {!isEditing ? (
                  <button 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit />
                    Editar Perfil
                  </button>
                ) : (
                  <>
                    <button 
                      className="save-btn"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <FaSave />
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <FaTimes />
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Perfil;

