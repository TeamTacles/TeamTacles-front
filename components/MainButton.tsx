import React from "react";

import { View, Text, StyleSheet } from 'react-native';

interface MainBottonProps {
    title: string;
    onPress: () => void;
}

export const MainButton = ({ title, onPress }: MainBottonProps) => {
    return (
        <View style={styles.buttonContainer}>
            <Text style={styles.buttonText} onPress={onPress}>
                {title}
            </Text>
        </View>
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
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
});