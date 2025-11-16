import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../../../contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../../../assets/logo.png');
const slide2Image = require('../../../assets/POLVO_SLIDE_2.png'); 
const slide3Image = require('../../../assets/POLVO_SLIDE_3.png'); 
const slide4Image = require('../../../assets/POLVO_SLIDE_4.png');

const slides = [
  {
    key: '1',
    title: 'Bem-vindo ao TeamTacles!',
    text: 'Esqueça a bagunça. Organize seus projetos e tarefas com a inteligência de um polvo.',
    image: logo,
    backgroundColor: '#232323',
  },
  {
    key: '2',
    title: 'Transforme Projetos em Tarefas simples!',
    text: 'Crie seus projetos, defina prazos e atribua responsáveis. Tudo em um só lugar, de forma rápida e intuitiva.',
    image: slide2Image, 
    backgroundColor: '#232323',
  },
  {
    key: '3',
    title: 'Entenda seu Progresso de verdade!',
    text: 'Não apenas liste tarefas. Acompanhe progresso, tarefas atrasadas, desempenho da equipe e métricas essenciais com gráficos claros e exporte tudo!',
    image: slide3Image, 
    backgroundColor: '#232323',
  },

  {
    key: '4',
    title: 'Trabalhe junto sem perder o ritmo!',
    text: 'Monte equipes, gerencie membros e mantenha todo mundo alinhado do início ao fim.',
    image: slide4Image, 
    backgroundColor: '#232323',
  }
];

export const OnboardingSlidesScreen = () => {
  const { completeOnboarding } = useAppContext(); 

  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    const MAX_IMAGE_SIZE = 300; 
    const windowWidth = Dimensions.get('window').width;
    const isLogo = item.key === '1';
    const baseSize = isLogo ? windowWidth * 0.6 : windowWidth * 0.5;
    const finalSize = Math.min(baseSize, MAX_IMAGE_SIZE);
    
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Image 
          source={item.image} 
          style={[
            isLogo ? styles.logoImage : styles.slideImage,
            { width: finalSize, height: finalSize }
          ]} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const renderButton = (name: string) => (
    <View style={styles.buttonCircle}>
      <Icon name={name} color="rgba(255, 255, 255, .9)" size={24} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppIntroSlider
        renderItem={renderItem}
        data={slides}
        onDone={completeOnboarding} 
        onSkip={completeOnboarding} 
        renderNextButton={() => renderButton('arrow-forward-outline')}
        renderDoneButton={() => renderButton('checkmark-outline')}
        renderSkipButton={() => renderButton('close-outline')}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        showSkipButton
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#232323' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoImage: {
    marginBottom: 10,
  },
  slideImage: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EB5F1C',
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonCircle: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(235, 95, 28, 0.8)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, .3)',
  },
  activeDot: {
    backgroundColor: '#EB5F1C',
  },
});