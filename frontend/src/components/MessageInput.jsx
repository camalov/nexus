import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const MessageInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', display: 'flex' }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleSend}
                sx={{ ml: 1 }}
            >
                Send
            </Button>
        </Box>
    );
};

export default MessageInput;
