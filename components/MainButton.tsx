import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MainButtonProps {
    title: string;
    onPress: () => void;
}

export const MainButton = ({ title, onPress }: MainButtonProps) => {
    return (
        <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
            <Text style={styles.buttonText}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: '#BC6135',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
        marginTop: 40,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
});