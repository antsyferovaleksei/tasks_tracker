import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useUserSettings } from '../hooks';
import { useAppSettingsStore } from '../store';

export default function SettingsPage() {
  const { settings: savedSettings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { theme: globalTheme, setTheme: setGlobalTheme } = useAppSettingsStore();
  
  const [settings, setSettings] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Оновлюємо локальний стан коли завантажуються збережені налаштування та глобальна тема
  useEffect(() => {
    if (savedSettings && !isLoading) {
      setSettings({
        ...savedSettings,
        theme: globalTheme, // Використовуємо глобальну тему
      });
    }
  }, [savedSettings, isLoading, globalTheme]);

  // Перевірка чи є зміни
  useEffect(() => {
    if (savedSettings) {
      const originalSettings = {
        ...savedSettings,
        theme: globalTheme,
      };
      const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(changed);
    }
  }, [settings, savedSettings, globalTheme]);

  const handleSaveSettings = () => {
    // Спочатку оновлюємо глобальну тему
    setGlobalTheme(settings.theme);
    
    // Потім зберігаємо решту налаштувань
    const settingsToSave = { ...settings };
    updateSettings(settingsToSave);
  };

  const handleCancelSettings = () => {
    if (savedSettings) {
      setSettings({ 
        ...savedSettings,
        theme: globalTheme, // Повертаємо до поточної глобальної теми
      });
      setHasChanges(false);
      toast('Зміни скасовано');
    }
  };

  if (isLoading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        Налаштування
      </Typography>

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Тема інтерфейсу
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Тема</InputLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'system' })}
                >
                  <MenuItem value="light">Світла</MenuItem>
                  <MenuItem value="dark">Темна</MenuItem>
                  <MenuItem value="system">Системна</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>





        {/* Account Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Акаунт
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ім'я"
                    defaultValue="Користувач"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    defaultValue="user@example.com"
                    fullWidth
                    disabled
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" mb={2}>
                Зміна пароля
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Поточний пароль"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Новий пароль"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Підтвердити пароль"
                    type="password"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              variant="outlined" 
              onClick={handleCancelSettings}
              disabled={!hasChanges || isUpdating}
            >
              Скасувати
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveSettings}
              disabled={!hasChanges || isUpdating}
              startIcon={isUpdating ? <CircularProgress size={16} /> : null}
            >
              {isUpdating ? 'Збереження...' : 'Зберегти налаштування'}
            </Button>
          </Box>
          {hasChanges && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
              У вас є незбережені зміни
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
} 