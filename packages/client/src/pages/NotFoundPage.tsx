import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
        gap={3}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '6rem', md: '8rem' },
            fontWeight: 'bold',
            color: 'primary.main',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page not found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" mb={4}>
          Вибачте, але сторінка, яку ви шукаєте, не існує або була переміщена.
        </Typography>
        
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            На головну
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Назад
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 