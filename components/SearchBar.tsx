import React from "react";

import { View, Text, StyleSheet } from 'react-native';

interface SearchBarProps {
    title: string
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onSearch: (term: string) => void;
}

