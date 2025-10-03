import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface MainButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean; 
}

export const MainButton: React.FC<MainButtonProps> = ({ title, onPress, disabled }) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#EB5F1C', 
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9', 
        opacity: 0.7,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});