import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitialsFromName } from '../../../utils/stringUtils';

interface TaskAssignment {
    userId: number;
    username: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
    dueDate: string; // ISO 8601 string
    assignments: TaskAssignment[];
}

interface TaskReportRowProps {
    task: Task;
}

const statusConfig = {
    DONE: { label: 'Concluído', color: '#3CB371' },
    IN_PROGRESS: { label: 'Em andamento', color: '#FFD700' },
    TO_DO: { label: 'A Fazer', color: '#FFA500' },
    OVERDUE: { label: 'Atrasado', color: '#ff4545' },
};

export const TaskReportRow: React.FC<TaskReportRowProps> = ({ task }) => {
    // Pega o primeiro responsável ou mostra "N/A"
    const responsible = task.assignments && task.assignments.length > 0
        ? task.assignments[0].username
        : 'N/A';
    
    const initials = responsible !== 'N/A' ? getInitialsFromName(responsible) : '?';
    const statusInfo = statusConfig[task.status] || { label: 'Desconhecido', color: '#A9A9A9' };

    // Formata a data
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return 'Data inválida';
        }
    };

    return (
        <View style={styles.row}>
            <Text style={[styles.col, styles.colTask]} numberOfLines={2}>
                {task.title}
            </Text>

            <View style={[styles.col, styles.colResponsible]}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.responsibleName} numberOfLines={1}>
                    {responsible}
                </Text>
            </View>

            <View style={[styles.col, styles.colStatus]}>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <Text style={[styles.statusText, { color: statusInfo.color }]} numberOfLines={1}>
                    {statusInfo.label}
                </Text>
            </View>

            <Text style={[styles.col, styles.colDueDate]} numberOfLines={1}>
                {formatDate(task.dueDate)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C',
        minHeight: 50,
    },
    col: {
        color: '#E0E0E0',
        fontSize: 13,
        paddingHorizontal: 4,
    },
    colTask: {
        flex: 3,
        fontWeight: 'bold',
        fontSize: 12,
    },
    colResponsible: {
        flex: 2.5,
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 11,
    },
    colStatus: {
        flex: 2.2,
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 11,
    },
    colDueDate: {
        flex: 1.8,
        textAlign: 'right',
        fontSize: 11,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    responsibleName: {
        color: '#E0E0E0',
        fontSize: 11,
        flex: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
});