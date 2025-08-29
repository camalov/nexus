// frontend/src/components/MessageInput.jsx
import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const MessageInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSend = (e) => {
        // Səhifənin yenilənməsinin qarşısını alırıq
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        // Düzgün form davranışı üçün Box komponentini form olaraq təyin edirik
        <Box component="form" onSubmit={handleSend} sx={{ p: 2, backgroundColor: '#f5f5f5', display: 'flex' }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                    // Enter basıldıqda mesajın göndərilməsini təmin edirik (Shift+Enter yeni sətirə keçir)
                    if (e.key === 'Enter' && !e.shiftKey) {
                        handleSend(e);
                    }
                }}
            />
            <Button
                type="submit" // Düymənin formanı submit etməsini təmin edirik
                variant="contained"
                color="primary"
                sx={{ ml: 1 }}
            >
                Send
            </Button>
        </Box>
    );
};

export default MessageInput;