import React, { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const WebSocketNotification = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws', // URL WebSocket server
            connectHeaders: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Gửi token khi kết nối
            },
            onConnect: () => {
                // Lắng nghe thông báo trạng thái người dùng từ backend
                client.subscribe('/topic/userStatus/' + localStorage.getItem('UserId'), (message) => {
                    if (message.body) {
                        Swal.fire({
                            icon: 'warning',
                            title: message.body,
                            text: 'Tài khoản của bạn đã bị khóa. Bạn sẽ tự động đăng xuất.',
                        });

                        // Đăng xuất người dùng
                        localStorage.clear();
                        sessionStorage.clear();
                        Cookies.clear();
                        navigate('/login');
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            },
        });

        // Kết nối WebSocket
        client.activate();

        // Cleanup khi component unmount
        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [navigate]);

    return <div></div>;
};

export default WebSocketNotification;
