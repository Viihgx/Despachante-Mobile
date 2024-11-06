import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Modal, Animated, TextInput } from 'react-native';
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
  const [filteredServicos, setFilteredServicos] = useState<Servico[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const API_URL = 'http://10.0.2.2:5000';
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert('Erro', 'Usuário não autenticado');
          router.push('/login');
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

        // Ordena os serviços do mais recente para o mais antigo
        const servicosOrdenados = servicosComPdfs.sort((a: Servico, b: Servico) => {
          return new Date(b.data_solicitacao.split("/").reverse().join("-")).getTime() -
                 new Date(a.data_solicitacao.split("/").reverse().join("-")).getTime();
        });

        setServicos(servicosOrdenados);
        setFilteredServicos(servicosOrdenados);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
      }
    };

    fetchUserData();
  }, []);


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();

    const filtered = servicos.filter(servico =>
      servico.tipo_servico.toLowerCase().includes(lowercasedQuery) ||
      servico.status_servico.toLowerCase().includes(lowercasedQuery) ||
      new Date(servico.data_solicitacao).toLocaleDateString().includes(lowercasedQuery)
    );

    setFilteredServicos(filtered);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.push('/login');
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const solicitarServico = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        router.push('/login');
      } else {
        router.push({
          pathname: '/escolherServico',
          params: { token },
        });
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao verificar a autenticação.');
    }
  };

  const handleDownload = (url: string) => {
    const cleanedUrl = url.replace(/['"\[\]]/g, ''); // Remove aspas e colchetes
  
    Linking.canOpenURL(cleanedUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(cleanedUrl);
        } else {
          Alert.alert("Erro", "Nenhum aplicativo disponível para abrir este link.");
        }
      })
      .catch((err) => console.error("Erro ao tentar abrir o link:", err));
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

 // Função para formatar a data no formato dd/MM/yyyy
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Olá, {userName}</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta</Text>
        </View>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <MaterialIcons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Menu
          visible={menuVisible}
          anchor={<></>}
          onRequestClose={toggleMenu}
        >
          <MenuItem onPress={handleLogout}>Sair</MenuItem>
        </Menu>
      </View>

      <View style={styles.actionButtonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={solicitarServico}>
          <Text style={styles.actionButtonText}>Solicitar Serviço</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Meus Serviços</Text>

      {/* Barra de Pesquisa */}
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por tipo de serviço, status ou data"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <ScrollView contentContainerStyle={styles.servicosContainer} style={styles.scrollView}>
        {filteredServicos.length > 0 ? (
          filteredServicos.map((servico, index) => (
            <TouchableOpacity key={index} onPress={() => openModal(servico)}>
              <View style={styles.servicoCard}>
                <Text style={styles.servicoTitle}>{servico.tipo_servico}</Text>
                <Text style={styles.servicoText}>Pagamento: {servico.forma_pagamento}</Text>
                <Text style={styles.servicoText}>Status: {servico.status_servico}</Text>
                <Text style={styles.servicoText}>
                      Data da Solicitação: {formatDate(servico.data_solicitacao)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noServicosText}>Nenhum serviço encontrado.</Text>
        )}
      </ScrollView>
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
                      Data da Solicitação: {formatDate(servico.data_solicitacao)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noServicosText}>Você ainda não solicitou nenhum serviço.</Text>
          )}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          {selectedServico && (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalhes do Serviço</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
                  <MaterialIcons name="close" size={24} color="#111c55" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalText}>Tipo de Serviço: {selectedServico.tipo_servico}</Text>
              <Text style={styles.modalText}>Pagamento: {selectedServico.forma_pagamento}</Text>
              <Text style={styles.modalText}>Status: {selectedServico.status_servico}</Text>
              <Text style={styles.modalText}>
                Data da Solicitação: {formatDate(selectedServico.data_solicitacao)}
              </Text>

              <Text style={styles.modalText}>Baixar PDF:</Text>
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
            </View>
          )}
        </Animated.View>
      </Modal>


      <Link href="/user" style={styles.profileLink}>
        Ir para página de usuário
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#111c55',
    paddingVertical: 45,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f5b91e',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 5,
  },
  menuButton: {
    paddingLeft: 10,
  },
  actionButtonContainer: {
    alignItems: 'center',
    marginTop: -20,
  },
  actionButton: {
    backgroundColor: '#f5b91e',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2.1,
    borderColor: '#fff',
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111c55',
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  servicosContainer: {
    paddingBottom: 20,
  },
  servicoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  servicoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111c55',
    marginBottom: 5,
  },
  servicoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  noServicosText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    alignItems: 'flex-start', // Alinha o conteúdo à esquerda
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111c55',
  },
  closeIcon: {
    padding: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    textAlign: 'left', // Alinha o texto à esquerda
  },
  downloadButton: {
    backgroundColor: '#f5b91e',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
  },
  profileLink: {
    fontSize: 16,
    color: '#111c55',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 20,
  },
});

