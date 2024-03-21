import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Nuevo estado para controlar la carga

    useEffect(() => {
        const checkToken = async () => {
            const userToken = await AsyncStorage.getItem('userToken');
            if (userToken) {
                try {
                    const response = await axios.post('https://API_GATEWAY_URL/authentication/validate-token', {}, {
                        headers: { Authorization: `${userToken}` }
                    });
                    if (response.data.isValid) {
                        setToken(userToken);
                        setIsAuthenticated(true);
                    } else {
                        // Token is not valid, remove it
                        await AsyncStorage.removeItem('userToken');
                    }
                } catch (error) {
                    console.error('Failed to verify token:', error);
                }
            }
            setIsLoading(false); // Finalizó la carga, establecer isLoading en false
        };
        checkToken();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, username, setUsername, token, setToken, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};