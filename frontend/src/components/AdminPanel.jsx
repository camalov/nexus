import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import adminService from '../services/adminService';
import MediaManagement from './MediaManagement'; // Import the new component

// A simple component to render the user list
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await adminService.getAllUsers();
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users. You might not have the required permissions.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Roles</TableCell>
                        <TableCell>Last Login IP</TableCell>
                        <TableCell>Device Details</TableCell>
                        <TableCell>Last Login Timestamp</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.roles.join(', ')}</TableCell>
                            <TableCell>{user.lastLoginIp || 'N/A'}</TableCell>
                            <TableCell>{user.deviceDetails || 'N/A'}</TableCell>
                            <TableCell>{user.lastLoginTimestamp ? new Date(user.lastLoginTimestamp).toLocaleString() : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const AdminPanel = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Admin Panel
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="admin panel tabs">
                    <Tab label="User Management" />
                    <Tab label="Media Management" />
                </Tabs>
            </Box>
            {currentTab === 0 && <UserManagement />}
            {currentTab === 1 && <MediaManagement />}
        </Box>
    );
};

export default AdminPanel;
