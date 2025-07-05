import React from "react";

import { View, Text, StyleSheet } from 'react-native';

interface TaskCardProps {
    title: string;
    description: string;
    dueDate: string;
    status: 'todo' | 'inprogress' | 'done';
    owner: string;
    onPress: () => void;
}