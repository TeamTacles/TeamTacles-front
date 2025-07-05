import React from "react";

import { View, Text, StyleSheet } from 'react-native';

interface MenuProps {
    activeItem: 'projects' | 'tasks' | 'team' | 'settings' | null;
}