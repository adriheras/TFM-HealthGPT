import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { AuthContext } from '../components/profile/AuthContext';
import CustomAppbar from '../components/CustomAppbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = () => {
    const [password, setPassword] = useState('');
    const [username, setUsernameState] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { setIsAuthenticated, setUsername, setToken } = useContext(AuthContext);
    const [errors, setErrors] = useState({
        username: false,
        password: false,
      });

    const handleLogin = async () => {
        if (username === '' || password === '') {
            setErrors({
                username: username === '',
                password: password === '',
            });
            Alert.alert('Error', 'Por favor, rellene todos los campos.');
            return;
        }
        setSuccessMessage('');
        setIsLoading(true);
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
        setIsLoading(false);
    };

    const handleRegister = async () => {
        if (username === '' || password === '') {
            setErrors({
                username: username === '',
                password: password === '',
            });
            Alert.alert('Error', 'Por favor, rellene todos los campos.');
            return;
        }
        setIsLoading(true);
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
            setUsernameState(''); // Clear the username
            setPassword(''); // Clear the password

            setSuccessMessage('Usuario registrado con éxito.'); // Set the success message

        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setIsLoading(false);

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
                    error={errors.username}
                />
                <HelperText type="error" visible={errors.username}>
                    Debe introducir un nombre de usuario
                </HelperText>
                <TextInput
                    style={styles.input}
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                />
                <HelperText type="error" visible={errors.password}>
                    Debe introducir una contraseña
                </HelperText>
                {isLoading ? (
                    <ActivityIndicator size="large" color="rgb(16, 109, 32)"/>
                ) : (
                    <>
                        <Button style={styles.button} mode="contained" onPress={handleLogin}>
                            Iniciar sesión
                        </Button>
                        <Button style={styles.button} mode="contained-tonal" onPress={handleRegister}>
                            Registrarse
                        </Button>
                    </>
                )}
                <Text style={styles.successMessage}>{successMessage}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    input: {
        marginBottom: 4,
    },
    button: {
        marginTop: 16,
    },
    successMessage: {
        color: 'green',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default AuthScreen;