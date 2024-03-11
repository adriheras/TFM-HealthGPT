import React from 'react';
import { View, SafeAreaView, StyleSheet, Animated, ScrollView } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import CustomAppbar from '../components/CustomAppbar';
import HomeExerciseCard from '../components/home/HomeExerciseCard';
import HomeNutritionCard from '../components/home/HomeNutritionCard';
import HomeHealthCard from '../components/home/HomeHealthCard';

const HomeScreen = () => {
  const [value, setValue] = React.useState('week');
  const animation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  }, [value]);

  return (
    <View style={{ flex: 1 }}>      
    <CustomAppbar title="Inicio" />
      <SafeAreaView style={{ flex: 1 }}>       
       <View style={styles.segmentedButtonsContainer}>
          <SegmentedButtons
            value={value}
            onValueChange={setValue}
            buttons={[
              { value: 'week', label: 'Esta semana' },
              {
                value: 'month',
                label: 'Este mes',
              },
              {
                value: 'year',
                label: 'Este año',
              },
            ]}
          />
        </View>
        <ScrollView>
          <Animated.View style={{ ...styles.cardContainer, opacity: animation }}>
            <HomeExerciseCard selectedValue={value} />
          </Animated.View>
          <Animated.View style={{ ...styles.cardContainer, opacity: animation }}>
            <HomeNutritionCard selectedValue={value} />
          </Animated.View>
          <Animated.View style={{ ...styles.cardContainer, opacity: animation }}>
            <HomeHealthCard selectedValue={value} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentedButtonsContainer: {
    margin: 10,
  },
  cardContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
});

export default HomeScreen;