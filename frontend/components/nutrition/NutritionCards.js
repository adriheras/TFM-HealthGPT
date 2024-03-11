import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const CardsNutricion = ({ data }) => {
  const sumaCalorias = data.reduce((totalCalorias, item) => totalCalorias + item.calorias, 0);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Title>Total de calorías: {sumaCalorias.toFixed(2)} kcal</Title>
      </View>
      <ScrollView>
        {data.map((item, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Card style={{ marginHorizontal: 10 }}>
              <Card.Content style={{ flexDirection: 'row' }}>
                <View style={{ marginRight: 16 }}>
                  <Card.Cover source={{ uri: item.imagenUrl || 'URL_POR_DEFECTO' }} style={{ width: 160, height: 110 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Title>{item.nombre}</Title>
                  <Paragraph>Calorías: {item.calorias} kcal</Paragraph>
                  <Paragraph>Cantidad: {item.cantidad} g</Paragraph>
                  <Paragraph>
                    Hora: {String(new Date(item.fecha).getHours()).padStart(2, '0')}:{String(new Date(item.fecha).getMinutes()).padStart(2, '0')}
                  </Paragraph>
                </View>
              </Card.Content>
            </Card>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CardsNutricion;