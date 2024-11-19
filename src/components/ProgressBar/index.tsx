import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  etapaAtual: number;
  totalEtapas: number;
}

const ProgressBar = ({ etapaAtual, totalEtapas }: ProgressBarProps) => {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalEtapas }, (_, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[styles.circle, index < etapaAtual && styles.activeCircle]}>
            <Text style={[styles.circleText, index < etapaAtual && styles.activeCircleText]}>
              {index + 1}
            </Text>
          </View>
          {index < totalEtapas - 1 && (
            <View style={[styles.line, index < etapaAtual - 1 && styles.activeLine]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#f5b91e',
  },
  circleText: {
    color: '#111c55',
    fontWeight: 'bold',
  },
  activeCircleText: {
    color: '#ffffff',
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
  },
  activeLine: {
    backgroundColor: '#f5b91e',
  },
});

export default ProgressBar;
