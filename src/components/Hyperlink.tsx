import React from "react";

import { View, Text, StyleSheet } from 'react-native';

interface HyperlinkProps {
    label: string;
    onPress: () => void;
}

export const Hyperlink = ({ label, onPress }: HyperlinkProps) => {
    return (
        <View style={styles.hyperlinkContainer}>
            <Text style={styles.hyperlinkText} onPress={onPress}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    hyperlinkContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    hyperlinkText: {
        color: '#A9D6C6',
        fontSize: 16,
    },
});