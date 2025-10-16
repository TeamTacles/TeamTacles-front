import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface NotificationPopupRef {
  show: (options: { type: 'success' | 'error'; message: string }) => void;
}

const NotificationPopup = forwardRef<NotificationPopupRef, {}>((props, ref) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error'>('success');
    const animatedValue = useState(new Animated.Value(-100))[0]; 

    useImperativeHandle(ref, () => ({
        show: ({ type, message }) => {
            setMessage(message);
            setType(type);
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 40, 
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2500), 
                Animated.timing(animatedValue, {
                    toValue: -100, 
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        },
    }));

    const backgroundColor = type === 'success' ? '#2E7D32' : '#C62828';
    const iconName = type === 'success' ? 'checkmark-circle' : 'alert-circle';

    return (
        <Animated.View style={[styles.container, { backgroundColor, transform: [{ translateY: animatedValue }] }]}>
            <Icon name={iconName} size={24} color="#fff" />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        elevation: 999999,
        zIndex: 999999,
    },
    message: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
    },
});

export default NotificationPopup;