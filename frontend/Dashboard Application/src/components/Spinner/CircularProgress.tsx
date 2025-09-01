import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const CircularProgressComponent: React.FC = () => {
    return (
        <>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress size={24} sx={{ color: 'white' }} />
        </Box>
        </>
    )
}

export default CircularProgressComponent;