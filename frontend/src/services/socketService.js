// frontend/src/services/socketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import authService from './authService';

class SocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connect(onConnectedCallback) {
        const user = authService.getCurrentUser();
        // Yalnız qoşulma yoxdursa, yeni qoşulma yaradırıq
        if (user && user.token && !this.stompClient) {
            const socketFactory = () => new SockJS(`http://localhost:3000/ws`);
            this.stompClient = new Client({
                webSocketFactory: socketFactory,
                connectHeaders: {
                    'X-Authorization': `Bearer ${user.token}`,
                },
                onConnect: () => {
                    console.log('WebSocket Connected');
                    if(onConnectedCallback) onConnectedCallback();
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
            });
            this.stompClient.activate();
        }
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.stompClient = null;
            this.subscriptions.clear();
            console.log('WebSocket Disconnected');
        }
    }

    subscribe(destination, callback) {
        if (this.stompClient && this.stompClient.connected) {
            // Əgər bu ünvana artıq abunəlik varsa, ləğv edirik
            if (this.subscriptions.has(destination)) {
                this.subscriptions.get(destination).unsubscribe();
            }
            const subscription = this.stompClient.subscribe(destination, (message) => {
                callback(JSON.parse(message.body));
            });
            this.subscriptions.set(destination, subscription);
        }
    }

    sendMessage(destination, body) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
                destination: destination,
                body: JSON.stringify(body),
            });
        }
    }
}

// Bütün tətbiqdə istifadə üçün tək bir nüsxə (instance) export edirik
const socketService = new SocketService();
export default socketService;