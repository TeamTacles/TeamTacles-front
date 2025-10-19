// src/features/project/components/ProjectCard.tsx
import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { BaseCard } from "../../../components/common/BaseCard";
import Icon from 'react-native-vector-icons/Ionicons';
// Remover a importação do TimeAgo, pois não será mais usado aqui
// import TimeAgo from "../../../components/TimeAgo";
import { Project, Member } from "../../../types/entities"; // Importar Member

type ProjectCardProps = {
    project: Project;
    onPress: () => void;
}

export const ProjectCard = ({ project, onPress }: ProjectCardProps) => {
    // Remover createdAt da desestruturação se não for mais usado em outro lugar
    const { title, description, teamMembers, taskCount } = project;

    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description} numberOfLines={2}>{description}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.infoItem}>
                        <Icon name="reader-outline" size={14} color="#A9A9A9" />
                        <Text style={styles.footerText}>{taskCount} Tarefa{taskCount !== 1 ? 's' : ''}</Text>
                    </View>

                    {/* --- INÍCIO DA ALTERAÇÃO: Remover a seção "Atualizado..." --- */}
                    {/* <View style={styles.infoItem}>
                        <Icon name="time-outline" size={14} color="#A9A9A9" />
                        <Text style={styles.footerText}>Atualizado <TimeAgo timestamp={createdAt} /></Text>
                    </View> */}
                    {/* --- FIM DA ALTERAÇÃO --- */}

                    <View style={styles.teamContainer}>
                        {teamMembers.slice(0, 3).map((member: Member, index: number) => (
                            <View key={`${member.name}-${index}`} style={[styles.avatar, { right: index * 15 }]}>
                                <Text style={styles.avatarText}>{member.initials}</Text>
                            </View>
                        ))}
                         {teamMembers.length > 3 && (
                            <View style={[styles.avatar, styles.moreAvatar, { right: 3 * 15 }]}>
                                <Text style={styles.avatarText}>+{teamMembers.length - 3}</Text>
                            </View>
                         )}
                    </View>
                </View>
            </View>
        </BaseCard>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 15,
    },
    textContainer: {
        marginBottom: 20, // Aumentar margem para compensar remoção do 'Atualizado'
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
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Manter space-between
        alignItems: 'center',
        // Remover marginTop se não for necessário após remover 'Atualizado'
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        // Adicionar um marginRight para separar 'Tarefas' dos avatares, se necessário
        marginRight: 10, // Exemplo
    },
    footerText: {
        color: '#A9A9A9',
        fontSize: 12,
        marginLeft: 5,
    },
    teamContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        // Não precisa mais de paddingLeft se o space-between funcionar bem
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
     moreAvatar: {
        backgroundColor: '#3C3C3C',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
});