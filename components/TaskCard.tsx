import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from "./BaseCard"; 
import Icon from 'react-native-vector-icons/Ionicons';

interface TaskCardProps {
    title: string;
    projectName: string;
    dueDate: string;
    onPress: () => void;
}

export const TaskCard = ({ title, projectName, dueDate, onPress }: TaskCardProps) => {
    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.projectName}>Projeto: {projectName}</Text>
                </View>
                <View style={styles.footer}>
                    <Icon name="calendar-outline" size={14} color="#A9A9A9" />
                    <Text style={styles.dueDate}>Prazo: {dueDate}</Text>
                </View>
            </View>
        </BaseCard>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: 15,
    },
    textContainer: {
        marginBottom: 15,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    projectName: {
        color: '#EB5F1C',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dueDate: {
        color: '#A9A9A9',
        fontSize: 12,
        marginLeft: 5,
    },
});