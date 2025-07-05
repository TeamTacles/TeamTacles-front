import React from "react";

import { View, Text, StyleSheet } from 'react-native';

interface InputFieldProps {
    label: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
}