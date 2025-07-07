import React, { useState, useEffect } from 'react';
import { Text } from "react-native";

// formatar o tempo utilzado em projeto e task
const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 10) return 'agora mesmo';
    if (seconds < 60) return `há ${seconds} segundos`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;

    const days = Math.floor(hours / 24);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
};


// O componente que se atualiza
const TimeAgo = ({ timestamp }: { timestamp: number }) => {
    const [timeAgoText, setTimeAgoText] = useState(() => formatTimeAgo(timestamp));

    useEffect(() => {
        // atualiza o texto a cada 30 segundos
        const intervalId = setInterval(() => {
            setTimeAgoText(formatTimeAgo(timestamp));
        }, 30000); // 30000 ms = 30 segundos
        return () => clearInterval(intervalId);
    }, [timestamp]); 

    return (
        <Text>{timeAgoText}</Text>
    );
};

export default TimeAgo;