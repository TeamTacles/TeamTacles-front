// src/components/TaskReportRow.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitialsFromName } from '../../../utils/stringUtils';

interface Task {
  title: string;
  projectName: string;
  assignments: { username: string }[];
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
}

interface TaskReportRowProps {
  task: Task;
}

const statusConfig = {
    DONE: { label: 'Concluído', color: '#3CB371' },
    IN_PROGRESS: { label: 'Em andamento', color: '#FFD700' },
    TO_DO: { label: 'A Fazer', color: '#ff4545' },
};

export const TaskReportRow: React.FC<TaskReportRowProps> = ({ task }) => {
    const responsible = task.assignments[0]?.username || 'N/A';
    const initials = getInitialsFromName(responsible);
    const statusInfo = statusConfig[task.status] || { label: 'Desconhecido', color: '#A9A9A9' };

    return (
        <View style={styles.row}>
            <Text style={[styles.col, styles.colTask]} numberOfLines={1}>{task.title}</Text>
            <Text style={[styles.col, styles.colProject]} numberOfLines={1}>{task.projectName}</Text>
            
            <View style={[styles.col, styles.colResponsible]}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.responsibleName} numberOfLines={1}>{responsible}</Text>
            </View>

            <View style={[styles.col, styles.colStatus]}>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <Text style={[styles.statusText, { color: statusInfo.color }]} numberOfLines={1}>
                    {statusInfo.label}
                </Text>
            </View>

            <Text style={[styles.col, styles.colDueDate]} numberOfLines={1}>
                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14, // Reduzido
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C',
    },
    col: {
        color: '#E0E0E0',
        fontSize: 13, // Reduzido
        paddingHorizontal: 4,
    },
    colTask: {
        flex: 2.8, // Ajustado
        fontWeight: 'bold',
        fontSize: 7,
    },
    colProject: {
        flex: 2, // Ajustado
        fontSize: 7,
    },
    colResponsible: {
        flex: 2.5, // Ajustado
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 7,
    },
    colStatus: {
        flex: 2.2, // Ajustado
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 7,
    },
    colDueDate: {
        flex: 1.8, // Ajustado
        textAlign: 'right',
        fontSize: 7,
    },
    avatar: {
        width: 10, // Reduzido
        height: 10, // Reduzido
        borderRadius: 12,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 4, // Reduzido
    },
    responsibleName: {
        color: '#E0E0E0',
        fontSize: 7, // Reduzido
        flex: 1,
    },
    statusDot: {
        width: 8, // Reduzido
        height: 8, // Reduzido
        borderRadius: 4,
        marginRight: 5,
    },
    statusText: {
        fontSize: 7, // Reduzido
    },
});