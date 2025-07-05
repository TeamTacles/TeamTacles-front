import React from "react";

import { View, Text, TextInput, StyleSheet } from 'react-native';

interface InputFieldProps {
    label: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
}

export const InputsField = ({ label, placeholder, value, onChangeText }: InputFieldProps) => {
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 20,
        maxWidth: '100%',
    },
    label: {
        fontSize: 16,
        color: '#ffffff',   
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    input: {
        height: 40,
        borderColor: '#BC6135',
        borderWidth: 1,
        borderRadius: 8,
        color: '#ffffff',
        padding: 10,
        width: '100%',
        backgroundColor: '#fff'
    },
});