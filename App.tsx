import { useEffect, useState } from 'react';
import { Text, View, Pressable, Alert, Button, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

import { styles } from './styles';

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingFileURI, setRecordingFileURI] = useState<string | null>(null);

  async function handleRecordingStart() {
    const { granted } = await Audio.requestPermissionsAsync();

    if (granted) {
      try {
        const { recording } = await Audio.Recording.createAsync();
        setRecording(recording);
      } catch (error) {
        console.log(error);
        Alert.alert(
          'Erro ao gravar áudio',
          'Não foi possível iniciar a gravação do áudio. Tente novamente'
        );
      }
    }
  }

  async function handleRecordingStop() {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const fileUri = recording.getURI();
        console.log(fileUri);
        setRecordingFileURI(fileUri);
        setRecording(null);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Erro ao parar gravação',
        'Não foi possível finalizar a gravação do áudio. Tente novamente'
      );
    }
  }

  async function handleAudioPlay() {
    if (recordingFileURI) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: recordingFileURI },
          { shouldPlay: true }
        );

        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (error) {
        console.log(error);
        Alert.alert(
          'Erro ao reproduzir áudio',
          'Não foi possível reproduzir o áudio. Tente novamente'
        );
      }
    }
  }

  useEffect(() => {
    Audio.requestPermissionsAsync().then(({ granted }) => {
      if (granted) {
        Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: true,
        });
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, recording && styles.recording]}
        onPressIn={() => {
          handleRecordingStart();
        }}
        onPressOut={() => {
          handleRecordingStop();
        }}
      >
        <MaterialIcons name="mic" size={44} color="#212121" />
      </Pressable>

      {recording && <Text style={styles.label}>Gravando</Text>}

      {recordingFileURI && (
        <Button title="Reproduzir" onPress={handleAudioPlay} />
      )}
    </View>
  );
}
