// context/ProdutoContext.js
import { createContext, useContext, useState } from "react";

const ProdutoContext = createContext();

export const ProdutoProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({});
  const [carrinho, setCarrinho] = useState([]);
  const [empresaAtual, setEmpresaAtual] = useState(null);

  // Adicionar item ao carrinho
  const adicionarAoCarrinho = (produto, mensagemCustomizacao = null) => {
    setCarrinho(prev => {
      // Criar uma chave única para o item (produto_id + mensagem de customização)
      const itemKey = `${produto.produto_id}_${mensagemCustomizacao || ''}`;
      
      // Verificar se já existe um item com a mesma chave
      const existingItem = prev.find(item => {
        const existingKey = `${item.produto_id}_${item.mensagemCustomizacao || ''}`;
        return existingKey === itemKey;
      });
      
      if (existingItem) {
        return prev.map(item => {
          const existingKey = `${item.produto_id}_${item.mensagemCustomizacao || ''}`;
          return existingKey === itemKey
            ? { ...item, quantidade: item.quantidade + 1 }
            : item;
        });
      } else {
        return [...prev, { 
          ...produto, 
          quantidade: 1,
          mensagemCustomizacao: mensagemCustomizacao || null,
          carrinhoItemId: Date.now() + Math.random() // ID único para o item no carrinho
        }];
      }
    });
  };

  // Remover item do carrinho (agora usa carrinhoItemId se disponível, senão usa produto_id)
  const removerDoCarrinho = (produtoId, carrinhoItemId = null) => {
    setCarrinho(prev => {
      if (carrinhoItemId) {
        return prev.filter(item => item.carrinhoItemId !== carrinhoItemId);
      }
      // Fallback: remover primeiro item com esse produto_id (comportamento antigo)
      const indexToRemove = prev.findIndex(item => item.produto_id === produtoId);
      if (indexToRemove !== -1) {
        return prev.filter((_, index) => index !== indexToRemove);
      }
      return prev;
    });
  };

  // Ajustar quantidade (agora usa carrinhoItemId se disponível)
  const ajustarQuantidade = (produtoId, novaQuantidade, carrinhoItemId = null) => {
    if (novaQuantidade < 1) {
      removerDoCarrinho(produtoId, carrinhoItemId);
      return;
    }
    setCarrinho(prev =>
      prev.map(item => {
        if (carrinhoItemId && item.carrinhoItemId === carrinhoItemId) {
          return { ...item, quantidade: novaQuantidade };
        }
        if (!carrinhoItemId && item.produto_id === produtoId) {
          return { ...item, quantidade: novaQuantidade };
        }
        return item;
      })
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
      calcularQuantidadeTotal,
      empresaAtual,
      setEmpresaAtual
    }}>
      {children}
    </ProdutoContext.Provider>
  );
};

export const useProduto = () => {
  return useContext(ProdutoContext);
};