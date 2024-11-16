// components/navbar.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router'; // Atualização para obter a rota atual
import { MaterialIcons } from '@expo/vector-icons';

export default function Navbar() {
  const router = useRouter();
  const currentPath = usePathname(); // Obtém o caminho atual para detectar a página ativa

  const isHomeActive = currentPath === '/';
  const isUserActive = currentPath === '/user';

  return (
    <View style={styles.navbarContainer}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/')}
      >
        <MaterialIcons
          name="home"
          size={28}
          color={isHomeActive ? '#111c55' : '#A9A9A9'} 
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/user')}
      >
        <MaterialIcons
          name="person"
          size={28}
          color={isUserActive ? '#111c55' : '#A9A9A9'} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  navButton: {
    paddingHorizontal: 20,
  },
});
