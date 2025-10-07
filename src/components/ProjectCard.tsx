import React from "react";
import { BaseCard } from "./BaseCard"; 
import Icon from 'react-native-vector-icons/Ionicons';
import TimeAgo from "./TimeAgo"; 
import { ProjectType } from "../types/ProjectType"; 
import { View, Text, StyleSheet } from 'react-native';

type ProjectCardProps = {
    project: ProjectType;
    onPress: () => void;
}

export const ProjectCard = ({ project, onPress }: ProjectCardProps) => {
    const { title, description, lastUpdated, teamMembers } = project;

    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.updateInfo}>
                        <Icon name="time-outline" size={14} color="#A9A9A9" />
                        <Text style={styles.updateText}>Atualizado <TimeAgo timestamp={lastUpdated} /></Text>
                    </View>
                    <View style={styles.teamContainer}>
                        {teamMembers.map((member, index) => (
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

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 10
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