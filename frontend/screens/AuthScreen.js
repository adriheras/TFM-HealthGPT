import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { AuthContext } from '../components/profile/AuthContext';
import CustomAppbar from '../components/CustomAppbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = () => {
    const [password, setPassword] = useState('');
    const [username, setUsernameState] = useState('');
    const { setIsAuthenticated, setUsername, setToken } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            const response = await fetch('https://API_GATEWAY_URL/authentication/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ocurrió un error al iniciar sesión.');
            }

            // Guardar el token y el nombre de usuario en el contexto
            setToken(data.token);
            setUsername(username);

            // Guardar el token en AsyncStorage
            await AsyncStorage.setItem('userToken', data.token);

            // Marcar al usuario como autenticado después de un inicio de sesión exitoso
            setIsAuthenticated(true);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleRegister = async () => {
        try {
            const response = await fetch('https://API_GATEWAY_URL/authentication/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error al registrarse.');
            }

            Alert.alert('Éxito', 'Usuario registrado con éxito.');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View>
            <CustomAppbar title="Login" showProfileAction={false} />
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    label="Nombre de usuario"
                    value={username}
                    onChangeText={setUsernameState}
                />
                <TextInput
                    style={styles.input}
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Button style={styles.button} mode="contained" onPress={handleLogin}>
                    Iniciar sesión
                </Button>
                <Button style={styles.button} mode="contained-tonal" onPress={handleRegister}>
                    Registrarse
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
    },
});

export default AuthScreen;