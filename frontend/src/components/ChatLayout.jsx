import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const ChatLayout = () => {
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
          <Paper elevation={0} sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6">Users</Typography>
          </Paper>
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
