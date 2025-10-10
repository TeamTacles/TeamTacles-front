// src/components/MainButton.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, TextStyle, ViewStyle, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // 1. Importar o Icon

interface MainButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconName?: string; // 2. Adicionar a nova propriedade para o nome do ícone
}

export const MainButton: React.FC<MainButtonProps> = ({ title, onPress, disabled, style, textStyle, iconName }) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled, style]}
            onPress={onPress}
            disabled={disabled}
        >
            {/* 3. Criar um container para alinhar o ícone e o texto */}
            <View style={styles.contentContainer}>
                {iconName && <Icon name={iconName} size={20} color="#FFFFFF" style={styles.icon} />}
                <Text style={[styles.text, textStyle]}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#EB5F1C', 
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center', // Adicionado para centralizar o conteúdo
        marginVertical: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9', 
        opacity: 0.7,
    },
    // 4. Novos estilos para o container e o ícone
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});