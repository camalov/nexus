// frontend/src/components/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button } from '@mui/material';

const MessageInput = ({ onSendMessage, onTyping }) => {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef(null);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        onTyping(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
        }, 1000); // Send "stopped typing" event after 1 second of inactivity
    };

    // Add this useEffect to handle component unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSend = (e) => {
        e.preventDefault(); // Prevent page reload
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <Box component="form" onSubmit={handleSend} sx={{ p: 2, backgroundColor: '#f5f5f5', display: 'flex' }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={handleInputChange} // Use the new handler
            />
            <Button
                type="submit"
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
