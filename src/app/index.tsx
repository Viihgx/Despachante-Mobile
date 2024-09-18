import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Modal, Button, Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';  
import { Menu, MenuItem } from 'react-native-material-menu';

interface Servico {
  tipo_servico: string;
  forma_pagamento: string;
  status_servico: string;
  data_solicitacao: string;
  file_pdfs: string[];
  nome_completo?: string;
  placa_do_veiculo?: string;
}

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [menuVisible, setMenuVisible] = useState(false); // Controla a visibilidade do menu
  const [modalVisible, setModalVisible] = useState(false); // Controla a visibilidade do modal
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null); // Armazena o serviço selecionado
  const [fadeAnim] = useState(new Animated.Value(0)); // Para animação do modal
  const API_URL = 'http://192.168.18.20:5000'; // Substitua pela URL do seu backend
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert('Erro', 'Usuário não autenticado');
          router.push('/login'); //tela login
          return;
        }

        const userResponse = await axios.get(`${API_URL}/api/user-data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserName(userResponse.data.name);

        const servicosResponse = await axios.get(`${API_URL}/api/meus-servicos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const servicosComPdfs = servicosResponse.data.servicos.map((servico: any) => {
          let file_pdfs = servico.file_pdfs;

          if (typeof file_pdfs === 'string') {
            file_pdfs = [file_pdfs];
          } else if (!Array.isArray(file_pdfs)) {
            file_pdfs = [];
          }

          return {
            ...servico,
            file_pdfs,
          };
        });

        setServicos(servicosComPdfs);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken'); // Remove o token
    router.push('/login'); // Redireciona para a tela de login
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleDownload = (url: string) => {
    Linking.openURL(url);
  };

  const openModal = (servico: Servico) => {
    setSelectedServico(servico);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedServico(null);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          anchor={
            <TouchableOpacity onPress={toggleMenu}>
              <MaterialIcons name="menu" size={28} color="black" />
            </TouchableOpacity>
          }
          onRequestClose={toggleMenu}
        >
          <MenuItem onPress={handleLogout}>Sair</MenuItem>
        </Menu>
      </View>

      <Text style={styles.title}>Olá, {userName}</Text>
      <Text style={styles.subtitle}>Seja bem-vindo de volta</Text>

      <View style={styles.solicitarServicoContainer}>
        <Text style={styles.servicosTitle}>Solicite um serviço:</Text>
        <TouchableOpacity style={styles.solicitarServicoButton} onPress={() => router.push('/escolherServico')}>
          <Text style={styles.solicitarServicoText}>Solicitar Serviço</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.servicosSection}>
        <Text style={styles.servicosTitle}>Meus Serviços:</Text>

        <ScrollView contentContainerStyle={styles.servicosContainer}>
          {servicos.length > 0 ? (
            servicos.map((servico, index) => (
              <TouchableOpacity key={index} onPress={() => openModal(servico)}>
                <View style={styles.servicoCard}>
                  <Text style={styles.servicoText}>Tipo de Serviço: {servico.tipo_servico}</Text>
                  <Text style={styles.servicoText}>Forma de Pagamento: {servico.forma_pagamento}</Text>
                  <Text style={styles.servicoText}>Status: {servico.status_servico}</Text>
                  <Text style={styles.servicoText}>
                    Data da Solicitação: {new Date(servico.data_solicitacao).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noServicosText}>Você ainda não solicitou nenhum serviço.</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal para exibir os detalhes do serviço */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          {selectedServico && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detalhes do Serviço</Text>
              <Text style={styles.modalText}>Tipo de Serviço: {selectedServico.tipo_servico}</Text>
              <Text style={styles.modalText}>Forma de Pagamento: {selectedServico.forma_pagamento}</Text>
              <Text style={styles.modalText}>Status: {selectedServico.status_servico}</Text>
              <Text style={styles.modalText}>
                Data da Solicitação: {new Date(selectedServico.data_solicitacao).toLocaleDateString()}
              </Text>
              <Text style={styles.modalText}>Nome Completo: {selectedServico.nome_completo}</Text>
              <Text style={styles.modalText}>Placa do Veículo: {selectedServico.placa_do_veiculo}</Text>

              {selectedServico.file_pdfs.length > 0 && (
                <View>
                  {selectedServico.file_pdfs.map((fileUrl, fileIndex) => (
                    <TouchableOpacity
                      key={fileIndex}
                      style={styles.downloadButton}
                      onPress={() => handleDownload(fileUrl)}
                    >
                      <Text style={styles.downloadText}>Baixar PDF {fileIndex + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Modal>

      <Link href="/login" style={styles.profileLink}>
        Ir para o Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 35,
    backgroundColor: '#f5f5f5',
  },
  menuContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'left',
    marginBottom: 20,
  },
  solicitarServicoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  solicitarServicoButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  solicitarServicoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  servicosSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
  },
  servicosTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
  },
  servicosContainer: {
    flexGrow: 1,
  },
  servicoCard: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  servicoText: {
    fontSize: 16,
    color: '#333',
  },
  noServicosText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  profileLink: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro translúcido
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
