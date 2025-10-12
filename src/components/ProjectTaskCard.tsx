// src/components/ProjectTaskCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from "./BaseCard"; 
import Icon from 'react-native-vector-icons/Ionicons';
import { ProjectTask } from '../services/projectService'; // Usamos o tipo mais detalhado

interface ProjectTaskCardProps {
    task: ProjectTask;
    onPress: () => void;
}

export const ProjectTaskCard = ({ task, onPress }: ProjectTaskCardProps) => {
    const { title, description, dueDate, status, assignments } = task;

    const isOverdue = new Date(dueDate) < new Date() && status !== 'DONE';

    const getStatusInfo = () => {
        if (isOverdue) {
            return { label: 'Atrasado', containerStyle: styles.statusOverdue, textStyle: styles.statusTextOverdue };
        }
        switch (status) {
            case 'IN_PROGRESS':
                return { label: 'Em Andamento', containerStyle: styles.statusInProgress, textStyle: styles.statusTextInProgress };
            case 'DONE':
                return { label: 'Concluído', containerStyle: styles.statusDone, textStyle: styles.statusTextDone };
            default:
                return { label: 'A Fazer', containerStyle: styles.statusToDo, textStyle: styles.statusTextToDo };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <View style={[styles.statusBadge, statusInfo.containerStyle]}>
                        <Text style={statusInfo.textStyle}>{statusInfo.label}</Text>
                    </View>
                </View>
                
                <Text style={styles.description} numberOfLines={2}>{description}</Text>

                <View style={styles.footer}>
                    <View style={styles.dueDateContainer}>
                        <Icon name="calendar-outline" size={14} color={isOverdue ? '#ff4545' : '#A9A9A9'} />
                        <Text style={[styles.footerText, isOverdue && styles.overdueText]}>
                            {new Date(dueDate).toLocaleDateString('pt-BR')}
                        </Text>
                    </View>
                    <View style={styles.assigneesContainer}>
                        {assignments.slice(0, 3).map((assignment) => (
                            <View key={assignment.userId} style={styles.avatar}>
                                <Text style={styles.avatarText}>{assignment.username.substring(0, 2).toUpperCase()}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </BaseCard>
    );
};

const styles = StyleSheet.create({
    contentContainer: { padding: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    title: { color: '#EB5F1C', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
    description: { color: '#E0E0E0', fontSize: 14, marginBottom: 15, lineHeight: 20 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dueDateContainer: { flexDirection: 'row', alignItems: 'center' },
    footerText: { color: '#A9A9A9', fontSize: 13, marginLeft: 6 },
    overdueText: { color: '#ff4545', fontWeight: 'bold' },
    assigneesContainer: { flexDirection: 'row-reverse' },
    avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3C3C3C', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', marginLeft: -10 },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusToDo: { backgroundColor: 'rgba(255, 165, 0, 0.2)' },
    statusTextToDo: { color: '#FFA500', fontWeight: 'bold', fontSize: 10 },
    statusInProgress: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
    statusTextInProgress: { color: '#FFD700', fontWeight: 'bold', fontSize: 10 },
    statusDone: { backgroundColor: 'rgba(60, 179, 113, 0.2)' },
    statusTextDone: { color: '#3CB371', fontWeight: 'bold', fontSize: 10 },
    statusOverdue: { backgroundColor: 'rgba(255, 69, 69, 0.2)' },
    statusTextOverdue: { color: '#ff4545', fontWeight: 'bold', fontSize: 10 },
});