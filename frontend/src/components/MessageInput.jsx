// frontend/src/components/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const MessageInput = ({ onSendMessage, onTyping, onFileSelect }) => {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (value && !isTypingRef.current) {
            isTypingRef.current = true;
            onTyping(true);
        } else if (!value && isTypingRef.current) {
            isTypingRef.current = false;
            onTyping(false);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (value) {
            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                onTyping(false);
            }, 1500);
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            if (isTypingRef.current) {
                isTypingRef.current = false;
                onTyping(false);
            }
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
        // Reset the input value to allow selecting the same file again
        e.target.value = null;
    };

    return (
        <Box component="form" onSubmit={handleSend} sx={{ p: 2, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center' }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={handleInputChange}
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
            />
            <IconButton onClick={handleAttachmentClick} sx={{ ml: 1 }}>
                <AttachFileIcon />
            </IconButton>
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
