import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { Ubuntu_700Bold } from '@expo-google-fonts/ubuntu';

import Routes from './src/routes';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts =  async () => {
    await Font.loadAsync({
      Roboto_400Regular, 
      Roboto_500Medium,
      Ubuntu_700Bold,
    });
    setFontsLoaded(true);
  }

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent/>
      <Routes />
    </>
  );
}
