import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, ButtonGroup, Link } from '@mui/material';
import adminService from '../services/adminService';

const MediaManagement = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(null); // null for all, 'IMAGE', or 'FILE'

    useEffect(() => {
        const fetchMedia = async () => {
            setLoading(true);
            try {
                const response = await adminService.getMediaMessages(filter);
                setMedia(response.data);
            } catch (err) {
                setError('Failed to fetch media files.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, [filter]);

    const handleDelete = async (messageId) => {
        if (window.confirm('Are you sure you want to permanently delete this file? This action cannot be undone.')) {
            try {
                await adminService.hardDeleteMedia(messageId);
                // Remove the deleted item from the list without a refetch
                setMedia(prevMedia => prevMedia.filter(item => item.id !== messageId));
            } catch (err) {
                setError(`Failed to delete media file with ID: ${messageId}`);
                console.error(err);
            }
        }
    };

    const renderPreview = (msg) => {
        const baseUrl = window.location.origin.replace(':3000', ':8080') + '/nexus/api';
        const fullPath = msg.content.startsWith('/') ? `${baseUrl}${msg.content}` : msg.content;

        if (msg.type === 'IMAGE') {
            return <img src={fullPath} alt="thumbnail" style={{ width: '100px', height: 'auto' }} />;
        }
        return <Link href={fullPath} target="_blank" rel="noopener noreferrer">View File</Link>;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

    return (
        <Box sx={{ mt: 2 }}>
            <ButtonGroup variant="outlined" aria-label="media filter button group" sx={{ mb: 2 }}>
                <Button onClick={() => setFilter(null)} variant={!filter ? 'contained' : 'outlined'}>All</Button>
                <Button onClick={() => setFilter('IMAGE')} variant={filter === 'IMAGE' ? 'contained' : 'outlined'}>Images</Button>
                <Button onClick={() => setFilter('FILE')} variant={filter === 'FILE' ? 'contained' : 'outlined'}>Files</Button>
            </ButtonGroup>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="media files table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Preview</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Sender</TableCell>
                            <TableCell>Recipient</TableCell>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {media.map((msg) => (
                            <TableRow key={msg.id}>
                                <TableCell>{msg.id}</TableCell>
                                <TableCell>{renderPreview(msg)}</TableCell>
                                <TableCell>{msg.type}</TableCell>
                                <TableCell>{msg.senderUsername}</TableCell>
                                <TableCell>{msg.recipientUsername}</TableCell>
                                <TableCell>{new Date(msg.timestamp).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDelete(msg.id)}
                                    >
                                        Permanently Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MediaManagement;
