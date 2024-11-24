import React, { createContext, useContext, useState } from 'react';

// Tipo para os dados do fluxo
export interface FlowData {
    service?: string;
    nomeCompleto?: string;
    placaCarro?: string;
    nomeVeiculo?: string;
    pdfUri?: string;
    pdfName?: string;
    cpf?: string; // Adicionado
    metodoPagamento?: string; // Adicionado
    token?: string; 
  }
  

// Tipo para o contexto
type FlowContextType = {
  data: FlowData;
  setData: (updates: Partial<FlowData>) => void;
  clearData: () => void;
};

// Criação do contexto
const FlowContext = createContext<FlowContextType | undefined>(undefined);

// Provedor do contexto
export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setDataState] = useState<FlowData>({});

  const setData = (updates: Partial<FlowData>) => {
    setDataState((prev) => ({ ...prev, ...updates }));
  };

  const clearData = () => {
    setDataState({});
  };

  return (
    <FlowContext.Provider value={{ data, setData, clearData }}>
      {children}
    </FlowContext.Provider>
  );
};

// Hook para usar o contexto
export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
};
