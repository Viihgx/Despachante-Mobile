import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return '#f5b91e'; // Amarelo para Pendente
      case 'concluido':
        return '#28a745'; // Verde para Concluído
      case 'em andamento':
        return '#17a2b8'; // Azul claro para Em Andamento
      case 'cancelado':
        return 'red'; // Azul para Cancelado
      default:
        return '#ccc'; // Cor padrão para status desconhecido
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{status}</Text>
      <View style={[styles.statusCircle, { backgroundColor: getStatusColor() }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  statusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default StatusIndicator;
