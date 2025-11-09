import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 
import { Text } from "react-native";

const TimeAgo = ({ timestamp }: { timestamp: number }) => {
    
    const getTimeAgoText = () => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
    }

    const [timeAgoText, setTimeAgoText] = useState(getTimeAgoText);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeAgoText(getTimeAgoText());
        }, 30000); // Atualiza a cada 30 segundos

        return () => clearInterval(intervalId);
    }, [timestamp]);

    return <Text>{timeAgoText}</Text>;
};

export default TimeAgo;