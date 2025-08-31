import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';

const MessageInput = ({ onSendMessage, onTyping, onFileSelect }) => {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (value && !isTypingRef.current) {
            isTypingRef.current = true;
            onTyping(true);
        }

        if (!value && isTypingRef.current) {
            stopTyping(); // Immediately send stop typing signal if input is empty
            return;
        }

        if (value) {
            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                onTyping(false);
            }, 2000); // 2 seconds of inactivity
        }
    };

    useEffect(() => {
        // Cleanup timeout on component unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Ensure typing indicator is turned off
            if(isTypingRef.current) {
                onTyping(false);
            }
        };
    }, [onTyping]);

    const stopTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onTyping(false);
        }
    }

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
            stopTyping();
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
        e.target.value = null; // Reset file input
    };

    return (
        <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', alignItems: 'center', p: '10px 16px' }}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <IconButton sx={{ color: '#a0a0a0' }}>
                <SentimentSatisfiedOutlinedIcon />
            </IconButton>

            <TextField
                fullWidth
                variant="standard"
                placeholder="Message"
                value={message}
                onChange={handleInputChange}
                autoComplete="off"
                sx={{ mx: 1 }}
                InputProps={{
                    disableUnderline: true,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleAttachmentClick} sx={{ color: '#a0a0a0' }}>
                                <AttachFileIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: {
                        bgcolor: '#242f3d',
                        borderRadius: '20px',
                        p: '8px 15px',
                        color: '#fff',
                        fontSize: '0.95rem'
                    }
                }}
            />

            <IconButton type="submit" sx={{
                bgcolor: '#5278a3',
                color: '#fff',
                '&:hover': { bgcolor: '#416082' }
            }}>
                {message.trim() ? <SendIcon /> : <MicIcon />}
            </IconButton>
        </Box>
    );
};

export default MessageInput;
