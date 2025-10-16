import React from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface BaseCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export const BaseCard = ({ children, style, ...rest }: BaseCardProps) => {
  return (
    <TouchableOpacity style={[styles.cardContainer, style]} {...rest}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    width: '100%',
    marginBottom: 15,

    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
});
