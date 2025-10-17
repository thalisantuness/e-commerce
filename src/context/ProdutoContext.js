// context/ProdutoContext.js
import { createContext, useContext, useState } from "react";

const ProdutoContext = createContext();

export const ProdutoProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({});
  const [carrinho, setCarrinho] = useState([]);

  // Adicionar item ao carrinho
  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => {
      const existingItem = prev.find(item => item.produto_id === produto.produto_id);
      if (existingItem) {
        return prev.map(item =>
          item.produto_id === produto.produto_id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prev, { ...produto, quantidade: 1 }];
      }
    });
  };

  // Remover item do carrinho
  const removerDoCarrinho = (produtoId) => {
    setCarrinho(prev => prev.filter(item => item.produto_id !== produtoId));
  };

  // Ajustar quantidade
  const ajustarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(produtoId);
      return;
    }
    setCarrinho(prev =>
      prev.map(item =>
        item.produto_id === produtoId
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
    <ProdutoContext.Provider value={{ 
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
    </ProdutoContext.Provider>
  );
};

export const useProduto = () => {
  return useContext(ProdutoContext);
};