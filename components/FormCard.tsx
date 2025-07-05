import React from "react";

import { View, StyleSheet, Image } from 'react-native';
const logo = require('../assets/logo.png');

interface FormCardProps {
    children: React.ReactNode;
}

function FormCard({ children }: FormCardProps) {
    return (
        <View style={styles.containerCard}>
            <Image source={logo} style={styles.logo} />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    containerCard: {
        margin: 8,
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#232323',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        maxWidth: '80%',
        alignItems: 'center',
    },
    logo: {
        width: 130,
        height: 100,
        marginBottom: 10,
    },
});

export default FormCard;