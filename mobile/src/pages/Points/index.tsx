import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import api from '../../services/api';
import * as Location from 'expo-location';

import styles from './styles';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  name: string;
  image: string;
  image_url: string; 
  latitude: number;
  longitude: number;
}

interface Params {
  uf: string;
  city: string;
}

const Points = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { uf, city } = route.params as Params;

  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

  useEffect(() => {
    const loadPosition = async () => {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ooops...', 'Precisamos de permissão para obter a localização');
        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      setInitialPosition([latitude, longitude]);
    }

    loadPosition();
  }, []);

  useEffect(() => {
    api.get('/items')
      .then(response => {
        setItems(response.data);
      })
      .catch();
  }, []);

  useEffect(() => {
    api.get('/points', {
      params: {
        city,
        uf,
        items: selectedItems,
      }
    }).then(response => {
      setPoints(response.data);
    })
      .catch(error => console.log(error));
  }, [selectedItems]);
  
  const handleNavigateBack = useCallback(() => {
    navigation.goBack();
  }, []) 

  const handleNavigateToDetail = (id: number) => {
    navigation.navigate('Detail', { point_id: id });   
  };

  const handleSelectItem = (id: number) => {
    const checkItem = selectedItems.includes(id);

    if (checkItem) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([ ...selectedItems, id ]);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          { initialPosition[0] !== 0 && ( 
            <MapView 
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }} 
              style={styles.map} 
            >
              {points.map(point => (
                <Marker 
                  key={String(point.id)}
                  onPress={() => handleNavigateToDetail(point.id)}
                  style={styles.mapMarker}
                  coordinate={{  
                    latitude: point.latitude,
                    longitude: point.longitude, 
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 20 }}>
          {items.map(item => (
            <TouchableOpacity 
              key={String(item.id)} 
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {}  
              ]} 
              onPress={() => handleSelectItem(item.id)}
              activeOpacity={0.6} 
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>  
      </View>  
    </>
  );
};

export default Points;
