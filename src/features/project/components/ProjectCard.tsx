import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from "../../../components/common/BaseCard";
import Icon from 'react-native-vector-icons/Ionicons';
import TimeAgo from "../../../components/TimeAgo";
// Importe a interface 'Project' diretamente do AppContext
import { Project } from "../../../types/entities"; 

type ProjectCardProps = {
    project: Project; // Use a interface correta
    onPress: () => void;
}

export const ProjectCard = ({ project, onPress }: ProjectCardProps) => {
    // Agora usando 'createdAt', que existe na interface 'Project'
    const { title, description, createdAt, teamMembers } = project;

    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description} numberOfLines={2}>{description}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.updateInfo}>
                        <Icon name="time-outline" size={14} color="#A9A9A9" />
                        {/* Passando 'createdAt' para o TimeAgo */}
                        <Text style={styles.updateText}>Atualizado <TimeAgo timestamp={createdAt} /></Text>
                    </View>
                    <View style={styles.teamContainer}>
                        {teamMembers.map((member: any, index: number) => (
                            <View key={index} style={[styles.avatar, { right: index * 15 }]}>
                                <Text style={styles.avatarText}>{member.initials}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </BaseCard>
    );
};

// Estilos (permanecem os mesmos)
const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 15, // Aumentei o padding para melhor espaçamento
    },
    textContainer: {
        marginBottom: 20,
    },
    title: {
        color: '#EB5F1C',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20, // Adicionado para melhor legibilidade
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    updateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    updateText: {
        color: '#A9A9A9',
        fontSize: 12,
        marginLeft: 5,
    },
    teamContainer: {
        flexDirection: 'row-reverse',
        paddingLeft: 30, 
        paddingRight: 10 
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2A2A2A',
        position: 'relative',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
});