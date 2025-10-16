// src/components/TaskCard.tsx

import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from "../../../components/common/BaseCard";
import Icon from 'react-native-vector-icons/Ionicons';
import { Task } from "../../../types/entities";

interface TaskCardProps {
    task: Task;
    onPress: () => void;
}

export const TaskCard = ({ task, onPress }: TaskCardProps) => {
    const { title, projectName, dueDate, status } = task;
    const isOverdue = new Date(dueDate) < new Date() && status !== 'DONE';

    const getStatusInfo = () => {
        if (isOverdue) {
            return {
                label: 'Atrasado',
                containerStyle: styles.statusOverdue,
                textStyle: styles.statusTextOverdue,
            };
        }
        switch (status) {
            case 'IN_PROGRESS':
                return {
                    label: 'Em Andamento',
                    containerStyle: styles.statusInProgress,
                    textStyle: styles.statusTextInProgress,
                };
            case 'DONE':
                return {
                    label: 'Concluído',
                    containerStyle: styles.statusDone,
                    textStyle: styles.statusTextDone,
                };
            case 'TO_DO':
            default:
                return {
                    label: 'A Fazer',
                    containerStyle: styles.statusToDo,
                    textStyle: styles.statusTextToDo,
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.projectName} numberOfLines={1}>{projectName}</Text>
                    <View style={[styles.statusBadge, statusInfo.containerStyle]}>
                        <Text style={statusInfo.textStyle}>{statusInfo.label}</Text>
                    </View>
                </View>
                
                <Text style={styles.title}>{title}</Text>
                
                <View style={styles.footer}>
                    <Icon name="calendar-outline" size={14} color={isOverdue ? '#ff4545' : '#A9A9A9'} />
                    <Text style={[styles.dueDate, isOverdue && styles.overdueText]}>
                        Prazo: {new Date(dueDate).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </View>
        </BaseCard>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    projectName: {
        color: '#A9A9A9',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dueDate: {
        color: '#A9A9A9',
        fontSize: 13,
        marginLeft: 6,
    },
    overdueText: {
        color: '#ff4545',
        fontWeight: 'bold',
    },
    statusToDo: { backgroundColor: 'rgba(255, 165, 0, 0.2)' },
    statusTextToDo: { color: '#FFA500', fontWeight: 'bold', fontSize: 10 },
    statusInProgress: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
    statusTextInProgress: { color: '#FFD700', fontWeight: 'bold', fontSize: 10 },
    statusDone: { backgroundColor: 'rgba(60, 179, 113, 0.2)' },
    statusTextDone: { color: '#3CB371', fontWeight: 'bold', fontSize: 10 },
    statusOverdue: { backgroundColor: 'rgba(255, 69, 69, 0.2)' },
    statusTextOverdue: { color: '#ff4545', fontWeight: 'bold', fontSize: 10 },
});