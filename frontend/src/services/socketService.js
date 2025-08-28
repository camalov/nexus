import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import authService from './authService';

let stompClient = null;
let subscription = null;

const connect = (username, onMessageReceived) => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
        const socketFactory = () => new SockJS('/nexus/ws');
        stompClient = new Client({
            webSocketFactory: socketFactory,
            connectHeaders: {
                'X-Authorization': `Bearer ${user.token}`,
            },
            onConnect: () => {
                subscription = stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
                    onMessageReceived(JSON.parse(message.body));
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });
        stompClient.activate();
    }
};

const disconnect = () => {
    if (subscription) {
        subscription.unsubscribe();
    }
    if (stompClient) {
        stompClient.deactivate();
    }
};

const sendMessage = (message) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(message),
        });
    }
};

const socketService = {
    connect,
    disconnect,
    sendMessage,
};

export default socketService;
