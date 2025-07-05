import React from "react";

import { View, Text, StyleSheet } from 'react-native';

interface ProjectCardProps {
    title: string;
    description: string;
    lastUpdated: string;
    teamMembers: string[];
    onPress: () => void;
}