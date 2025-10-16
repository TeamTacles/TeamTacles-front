import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FilterButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>; 
}

export const FilterButton: React.FC<FilterButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>Filtro</Text>
      <Icon name="filter-outline" size={20} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderColor: '#808080',
    borderWidth: 2,
    borderRadius: 15,
    height: 54, 
    paddingHorizontal: 12,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});