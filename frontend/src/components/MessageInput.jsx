// frontend/src/components/MessageInput.jsx
import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const MessageInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSend = (e) => {
        e.preventDefault(); // Prevent page reload
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        // FIX: Removed form behavior from the Box component
        <Box component="form" onSubmit={handleSend} sx={{ p: 2, backgroundColor: '#f5f5f5', display: 'flex' }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        handleSend(e);
                    }
                }}
            />
            <Button
                type="submit" // Can now be a submit button for the form
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
