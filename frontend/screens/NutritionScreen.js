import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Animated } from 'react-native';
import { FAB } from 'react-native-paper';
import axios from 'axios';
import CustomAppbar from '../components/CustomAppbar';
import DatePicker from '../components/DatePicker';
import CardsNutricion from '../components/nutrition/NutritionCards';
import AddNutricionForm from '../components/nutrition/AddNutricionForm';
import { AuthContext } from '../components/profile/AuthContext';

function NutricionScreen() {
  const { token } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [apiData, setApiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: showForm ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(listOpacity, {
      toValue: showForm ? 0 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [showForm]);

  useEffect(() => {
    axios.get('https://API_GATEWAY_URL/nutrition/foods', {
      headers: {
        'Authorization': `${token}` // Incluye el token en los headers
      }
    })
      .then(response => {
        setApiData(response.data);
      })
      .catch(error => {
        console.error('Error al hacer la solicitud:', error.message);
      });
  }, [token]);

  useEffect(() => {
    const newFilteredData = apiData.filter(item => {
      const itemDate = new Date(item.fecha);
      return itemDate.toDateString() === selectedDate.toDateString();
    });
    setFilteredData(newFilteredData);
  }, [apiData, selectedDate]);

  const handleNutricionAdded = (newNutricion) => {
    setApiData([...apiData, newNutricion]);
    setShowForm(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomAppbar title="Nutrición" />
      {showForm ? (
        <Animated.View style={{ flex: 1, opacity: formOpacity }}>
          <AddNutricionForm onNutricionAdded={handleNutricionAdded} />
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: listOpacity }}>
          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <CardsNutricion data={filteredData} />
        </Animated.View>
      )}
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        variant='primary'
        icon={showForm ? 'minus' : 'plus'}
        onPress={() => setShowForm(!showForm)}
      />
    </View>
  );
}

export default NutricionScreen;