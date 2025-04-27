import React, { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const WebSocketNotification = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('jwtToken');
        let decodedUserId = null;

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                decodedUserId = decodedToken.userId;
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }

        if (!token || !decodedUserId) {
            console.log('No token or userId found');
            return;
        }

        const socket = new SockJS('http://localhost:8080/ws', null, {

            transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        });
        console.log('WebSocket connected', socket);
        const client = new Client({
            
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000, // Retry every 5 seconds

            onConnect: () => {
                client.subscribe(`/topic/userStatus/${decodedUserId}`, (message) => {
                    if (message.body) {
                        Swal.fire({
                            icon: 'warning',
                            title: message.body,
                            text: 'Tài khoản của bạn đã bị khóa. Bạn sẽ tự động đăng xuất.',
                        });
                        Cookies.remove('jwtToken');
                        navigate('/login');
                    }
                });
            },
            onStompError: (frame) => {
                console.error('WebSocketNotification STOMP error:', frame);
            },
            onWebSocketError: (error) => {
                console.error('WebSocketNotification WebSocket error:', error);
            },
        });

        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [navigate]);

    return null;
};

export default WebSocketNotification;