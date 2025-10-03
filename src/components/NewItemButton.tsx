import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface NewItemButtonProps {
    onPress: () => void;
}

export const NewItemButton = ({ onPress }: NewItemButtonProps) => {
    return (
        <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
            <Text style={styles.buttonText}>
                +
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 60,
        height: 60,
        borderRadius: 30, 
        backgroundColor: '#EB5F1C', 
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 34, 
        fontSize: 40,
    },
});