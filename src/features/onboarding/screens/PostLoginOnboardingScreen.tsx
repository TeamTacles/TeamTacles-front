import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, ScrollView } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../../../contexts/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const videoCreateProject = require('../../../assets/onboarding_pos_1.gif'); 
const videoCreateTeam = require('../../../assets/onboarding_pos_2.gif'); 
const videoCreateTask = require('../../../assets/onboarding_pos_3.gif'); 
const videoChangeStatus = require('../../../assets/onboarding_pos_4.gif'); 
const videoReport = require('../../../assets/onboarding_pos_5.gif'); 

const slides = [
 {
  key: '1',
  title: 'Crie seu Primeiro Projeto 🏗️',
  text: 'Acesse a aba "Projetos" e clique no botão "+" para iniciar. Defina o título, a descrição e convide sua equipe para mergulhar junto! O TeamTacles te ajuda a organizar tudo.',
  media: videoCreateProject, 
  mediaType: 'image', 
  backgroundColor: '#232323',
 },
 {
  key: '2',
  title: 'Forme suas Equipes 🤝',
  text: 'Na aba "Equipes", use o "+" para criar um novo time. Você pode convidar membros por e-mail ou gerar um link de convite para compartilhamento rápido.',
  media: videoCreateTeam, 
  mediaType: 'image', 
  backgroundColor: '#232323',
 },
 {
  key: '3',
  title: 'Adicione uma Tarefa 📝',
  text: 'Dentro de um projeto, use o botão "+" para criar uma nova tarefa. Defina o título, a descrição e o prazo. Na próxima etapa, atribua os membros responsáveis!',
  media: videoCreateTask, 
  mediaType: 'image', 
  backgroundColor: '#232323',
 },
 {
  key: '4',
  title: 'Altere o Status facilmente🚦',
  text: 'Em "Tarefas" ou nos detalhes do projeto, basta um toque para atualizar o status (A Fazer, Em Andamento, Concluído) da tarefa e manter o progresso sempre em dia.',
  media: videoChangeStatus, 
  mediaType: 'image', 
  backgroundColor: '#232323',
 },
 {
  key: '5',
  title: 'Analise Seus Resultados 📊',
  text: 'Em qualquer projeto, acesse "Relatórios" para ver o desempenho da equipe e a distribuição de tarefas em gráficos. Use os filtros para refinar e exporte em PDF!',
  media: videoReport,
  mediaType: 'image', 
  backgroundColor: '#232323',
 }
];

export const PostLoginOnboardingScreen = () => {
 const { completePostLoginOnboarding } = useAppContext(); 

 const renderItem = ({ item }: { item: typeof slides[0] }) => {

  const APP_ORANGE_COLOR = '#EB5F1C'; 
  const MEDIA_WIDTH_PERCENTAGE = 80;
  const MEDIA_ASPECT_RATIO = 0.75; 

  return (
   <ScrollView contentContainerStyle={[styles.slide, { backgroundColor: item.backgroundColor }]}>
    
    <View style={styles.textContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>

    <View style={styles.mediaWrapper}>
      <View style={[
       styles.mediaContainer, 
       { 
        width: `${MEDIA_WIDTH_PERCENTAGE}%`, 
        aspectRatio: MEDIA_ASPECT_RATIO, 
        borderColor: APP_ORANGE_COLOR, 
        borderWidth: 2, 
        borderRadius: 12, 
        overflow: 'hidden',
        backgroundColor: '#3C3C3C', 
       }
      ]}>
       
       <Image 
        source={item.media} 
        style={styles.mediaElement}
        resizeMode="contain" 
       />

      </View>
    </View>
   </ScrollView>
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
    onDone={completePostLoginOnboarding} 
    onSkip={completePostLoginOnboarding} 
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
  flexGrow: 1, 
  alignItems: 'center', 
  paddingHorizontal: 30,
  paddingVertical: 50, 
 },
 textContainer: {
  marginBottom: 40, 
  width: '100%',
  alignItems: 'center',
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
 mediaWrapper: {
  width: '100%',
  alignItems: 'center',
  marginBottom: 20,
 },
 mediaContainer: {
  alignItems: 'center',
  justifyContent: 'center',
 },
 mediaElement: {
  width: '100%',
  height: '100%',
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