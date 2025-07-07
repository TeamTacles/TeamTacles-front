import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface EmptyStateProps {
  imageSource: ImageSourcePropType;
  title: string;
  subtitle: string;
}

export const EmptyState = ({ imageSource, title, subtitle }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#A9A9A9',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});