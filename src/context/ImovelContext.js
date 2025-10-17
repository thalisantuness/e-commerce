// context/ImovelContext.js
import { createContext, useContext, useState } from "react";

const ImovelContext = createContext();

export const ImovelProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({});
  const [carrinho, setCarrinho] = useState([]);

  // Adicionar item ao carrinho
  const adicionarAoCarrinho = (imovel) => {
    setCarrinho(prev => {
      const existingItem = prev.find(item => item.imovel_id === imovel.imovel_id);
      if (existingItem) {
        return prev.map(item =>
          item.imovel_id === imovel.imovel_id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prev, { ...imovel, quantidade: 1 }];
      }
    });
  };

  // Remover item do carrinho
  const removerDoCarrinho = (imovelId) => {
    setCarrinho(prev => prev.filter(item => item.imovel_id !== imovelId));
  };

  // Ajustar quantidade
  const ajustarQuantidade = (imovelId, novaQuantidade) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(imovelId);
      return;
    }
    setCarrinho(prev =>
      prev.map(item =>
        item.imovel_id === imovelId
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    );
  };

  // Limpar carrinho
  const limparCarrinho = () => {
    setCarrinho([]);
  };

  // Calcular total
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.valor * item.quantidade), 0);
  };

  // Calcular quantidade total de itens
  const calcularQuantidadeTotal = () => {
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
  };

  return (
    <ImovelContext.Provider value={{ 
      filtros, 
      setFiltros,
      carrinho,
      adicionarAoCarrinho,
      removerDoCarrinho,
      ajustarQuantidade,
      limparCarrinho,
      calcularTotal,
      calcularQuantidadeTotal
    }}>
      {children}
    </ImovelContext.Provider>
  );
};

export const useImovel = () => {
  return useContext(ImovelContext);
};