import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from "../../../components/common/BaseCard";
import Icon from 'react-native-vector-icons/Ionicons';
import { ProjectTask } from '../../project/services/projectService';
import { getInitialsFromName } from '../../../utils/stringUtils';

interface ProjectTaskCardProps {
    task: ProjectTask;
    onPress: () => void;
}

const getLifecycleStatusConfig = (status: string) => {
    switch (status) {
        case 'DONE':
            return { label: 'Concluído', style: styles.statusDone, textStyle: styles.statusTextDone };
        case 'IN_PROGRESS':
            return { label: 'Em Andamento', style: styles.statusInProgress, textStyle: styles.statusTextInProgress };
        case 'TO_DO':
        default:
            return { label: 'A Fazer', style: styles.statusToDo, textStyle: styles.statusTextToDo };
    }
};

export const ProjectTaskCard = ({ task, onPress }: ProjectTaskCardProps) => {
    const { title, description, dueDate, status, originalStatus, assignments } = task;

    const isOverdue = status === 'OVERDUE';
    
    const lifecycleConfig = getLifecycleStatusConfig(originalStatus || 'TO_DO');

    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    
                    <View style={styles.badgesContainer}>
                        
                        <View style={[styles.statusBadge, lifecycleConfig.style]}>
                            <Text style={lifecycleConfig.textStyle}>{lifecycleConfig.label}</Text>
                        </View>

                        {isOverdue && (
                            <View style={[styles.statusBadge, styles.statusOverdue]}>
                                <Text style={styles.statusTextOverdue}>Atrasado</Text>
                            </View>
                        )}
                    </View>
                </View>
                
                <Text style={styles.description} numberOfLines={2}>{description}</Text>

                <View style={styles.footer}>
                    <View style={styles.dueDateContainer}>
                        <Icon name="calendar-outline" size={14} color={isOverdue ? '#ff4545' : '#A9A9A9'} />
                        <Text style={[styles.footerText, isOverdue && styles.overdueText]}>
                            {new Date(dueDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <View style={styles.assigneesContainer}>
                        {assignments.slice(0, 3).map((assignment) => (
                            <View key={assignment.userId} style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {getInitialsFromName(assignment.username || 'Usuário')}
                                </Text>
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
    
    header: { 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        marginBottom: 8 
    },
    title: { 
        color: '#EB5F1C', 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 6 
    },
    
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', 
        gap: 8, 
    },

    description: { color: '#E0E0E0', fontSize: 14, marginBottom: 15, lineHeight: 20 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dueDateContainer: { flexDirection: 'row', alignItems: 'center' },
    footerText: { color: '#A9A9A9', fontSize: 13, marginLeft: 6 },
    overdueText: { color: '#ff4545', fontWeight: 'bold' },
    assigneesContainer: { flexDirection: 'row-reverse' },
    avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3C3C3C', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', marginLeft: -10 },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
    
    statusBadge: { 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 12,
        marginRight: 4 
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