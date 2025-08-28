import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { searchUsers } from '../services/userService';

const ChatLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    if (searchQuery) {
      const timeout = setTimeout(async () => {
        try {
          const response = await searchUsers(searchQuery);
          setUsers(response.data);
        } catch (error) {
          console.error('Failed to search users:', error);
        }
      }, 500);
      setDebounceTimeout(timeout);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex' }}>
      <Grid container sx={{ height: '100%' }}>
        {/* User List / Search Area */}
        <Grid item xs={12} sm={4} md={3} sx={{
          borderRight: { sm: '1px solid #ddd' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Paper elevation={0} sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Users</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Paper>
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {users.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton>
                  <ListItemText primary={user.username} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Chat Window Area */}
        <Grid item xs={12} sm={8} md={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={0} sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6">Chat Window</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatLayout;
