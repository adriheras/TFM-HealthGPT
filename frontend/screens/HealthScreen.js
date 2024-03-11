import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Animated } from 'react-native';
import CustomAppbar from '../components/CustomAppbar';
import HealthGrid from '../components/health/HealthGrid';
import { FAB, SegmentedButtons} from 'react-native-paper';
import axios from 'axios';
import AddHealthForm from '../components/health/AddHealthForm';
import { AuthContext } from '../components/profile/AuthContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns'; import DatePicker from '../components/DatePicker';


const HealthScreen = () => {
  const { token } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [value, setValue] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    axios.get('https://API_GATEWAY_URL/health', {
      headers: {
        'Authorization': `${token}`
      }
    })
      .then(response => {
        setApiData(response.data);
      })
      .catch(error => {
        console.error('Error al hacer la solicitud:', error.message);
      });
  }, []);

  useEffect(() => {
    let newFilteredData;
    switch (value) {
      case 'week':
        newFilteredData = apiData.filter(item => {
          const itemDate = new Date(item.fecha);
          const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
          const endOfWeekDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
          return isWithinInterval(itemDate, { start: startOfWeekDate, end: endOfWeekDate });
        });
        break;
      case 'month':
        newFilteredData = apiData.filter(item => {
          const itemDate = new Date(item.fecha);
          const startOfMonthDate = startOfMonth(selectedDate);
          const endOfMonthDate = endOfMonth(selectedDate);
          return isWithinInterval(itemDate, { start: startOfMonthDate, end: endOfMonthDate });
        });
        break;
      case 'year':
        newFilteredData = apiData.filter(item => {
          const itemDate = new Date(item.fecha);
          const startOfYearDate = startOfYear(selectedDate);
          const endOfYearDate = endOfYear(selectedDate);
          return isWithinInterval(itemDate, { start: startOfYearDate, end: endOfYearDate });
        });
        break;
      default:
        newFilteredData = apiData;
    }
    console.log('newFilteredData:', newFilteredData);
    setFilteredData(newFilteredData);
  }, [apiData, value, selectedDate]);

  const handleHealthAdded = (newHealth) => {
    setApiData([...apiData, newHealth]);
    setShowForm(false);
  };

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

  return (
    <View style={{ flex: 1 }}>
      <CustomAppbar title="Salud" />
      {showForm ? (
        <Animated.View style={{ flex: 1, opacity: formOpacity }}>
          <AddHealthForm onHealthAdded={handleHealthAdded} />
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: listOpacity }}>
          <View style={{ margin: 10 }}>
            <SegmentedButtons
              value={value}
              onValueChange={setValue}
              buttons={[
                { value: 'week', label: 'Semana' },
                { value: 'month', label: 'Mes' },
                { value: 'year', label: 'Año' },
              ]}
            />
          </View>
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <HealthGrid data={filteredData} selectedValue={value} selectedDate={selectedDate} />
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

export default HealthScreen;