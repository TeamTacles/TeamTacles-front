import React from "react";
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BaseCard } from "../../../components/common/BaseCard";
import Icon from 'react-native-vector-icons/Ionicons';
import { Project, Member } from "../../../types/entities"; 

type ProjectCardProps = {
    project: Project;
    onPress: () => void;
}

export const ProjectCard = ({ project, onPress }: ProjectCardProps) => {
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

                
                    <View style={styles.teamContainer}>
                         {teamMembers.length > 3 && (
                            <View style={[styles.avatar, styles.moreAvatar, { marginLeft: 0 }]}>
                                <Text style={styles.avatarText}>+{teamMembers.length - 3}</Text>
                            </View>
                         )}
                        {teamMembers.slice(0, 3).map((member: Member, index: number) => (
                            <View key={`${member.name}-${index}`} style={[styles.avatar, { marginLeft: -10 }]}>
                                <Text style={styles.avatarText}>{member.initials}</Text>
                            </View>
                        ))}
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
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10, 
    },
    footerText: {
        color: '#A9A9A9',
        fontSize: 12,
        marginLeft: 5,
    },
    teamContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        zIndex: 1,
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