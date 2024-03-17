import React from 'react';
import { View, Dimensions } from 'react-native';
import { Card, Text, Icon } from 'react-native-paper';

const typeColors = {
    walk: '#cf1111',
    run: '#0c960c',
    bike: '#0000FF',
    swim: '#ada200',
    dumbbell: '#d419b8',
    soccer: '#17b0a8',
    basketball: '#9e5f1c',
    tennis: '#5b04d4',
};

const ExerciseCard = ({ exercise }) => {
    const { _id, type, duration, distance, calories, createdAt } = exercise;
    const screenWidth = Dimensions.get('window').width;

      // Convert createdAt to a Date object and get the time string
    const timeString = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
        <Card style={{width: screenWidth - 20 }}>
          <Card.Content>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon
                  source={type}
                  size={40}
                  color={typeColors[type]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                    source="clock-outline"
                    size={20}
                  />
                  <Text>{` ${timeString}`}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    source="map-marker-distance"
                    size={20}
                  />
                  <Text>{` ${distance} km`}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    source="fire"
                    size={20}
                  />
                  <Text>{` ${calories} kcal`}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                    source="timer-outline"
                    size={20}
                  />
                  <Text>{` ${duration} minutos`}</Text>
                  
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      );
};

export default ExerciseCard;