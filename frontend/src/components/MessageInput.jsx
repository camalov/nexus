// frontend/src/components/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send'; // Using SendIcon for a better look

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
        e.target.value = null;
    };

    return (
        <Box component="form" onSubmit={handleSend} sx={{ p: 1, display: 'flex', alignItems: 'center', backgroundColor: '#1e2732' }}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
            />
            <IconButton onClick={handleAttachmentClick} sx={{ color: '#a0a0a0' }}>
                <AttachFileIcon />
            </IconButton>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Write a message..."
                value={message}
                onChange={handleInputChange}
                size="small"
                sx={{
                    mx: 1,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        backgroundColor: '#0e1621',
                        color: '#fff',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: 'transparent' },
                        '&.Mui-focused fieldset': { borderColor: 'transparent' },
                    },
                    '& .MuiOutlinedInput-input::placeholder': { color: '#a0a0a0' },
                }}
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                    borderRadius: '50%',
                    minWidth: '48px',
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#5278a3',
                    '&:hover': {
                        backgroundColor: '#416082',
                    },
                }}
            >
                <SendIcon />
            </Button>
        </Box>
    );
};

export default MessageInput;
