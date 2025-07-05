import React from "react";

import { View, StyleSheet } from 'react-native';

interface FormCardProps {
    children: React.ReactNode;
}

export const FormCard = ({ children }: FormCardProps) => {
    return (
        <View style={styles.containerCard}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    containerCard: {
        margin: 'auto',
        paddingTop: 60,
        paddingBottom: 40,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 10,
        backgroundColor: '#232323',
        width: '90%',
        justifyContent: 'center',
    },
});

export default FormCard;