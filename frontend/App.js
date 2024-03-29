import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PaperProvider, ActivityIndicator} from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import BottomTabNavigator from './components/BottomTabNavigator';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AuthScreen from './screens/AuthScreen';
import { AuthProvider, AuthContext } from './components/profile/AuthContext';
import theme from './styles/theme';
import Profile from './screens/ProfileScreen';

const Stack = createStackNavigator();


function MainApp() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);


if (isLoading) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
    );
}

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={BottomTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={Profile}
              options={{
                headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <MainApp />
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
});