import React, { useState } from 'react';
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
} from '@mui/material';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'light',
    emailReminders: true,
    pushNotifications: false,
    reminderFrequency: 'DAILY',
    daysBeforeDeadline: 1,
    weekendReminders: false,
  });

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        Налаштування
      </Typography>

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Тема інтерфейсу
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Тема</InputLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <MenuItem value="light">Світла</MenuItem>
                  <MenuItem value="dark">Темна</MenuItem>
                  <MenuItem value="system">Системна</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Сповіщення
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailReminders}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailReminders: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Email сповіщення"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pushNotifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Push сповіщення"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.weekendReminders}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          weekendReminders: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Сповіщення у вихідні"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reminder Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Нагадування
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Частота нагадувань</InputLabel>
                    <Select
                      value={settings.reminderFrequency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reminderFrequency: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="DAILY">Щодня</MenuItem>
                      <MenuItem value="WEEKLY">Щотижня</MenuItem>
                      <MenuItem value="CUSTOM">Налаштувати</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Днів до дедлайну"
                    type="number"
                    value={settings.daysBeforeDeadline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        daysBeforeDeadline: parseInt(e.target.value) || 1,
                      })
                    }
                    fullWidth
                    inputProps={{ min: 1, max: 30 }}
                  />
                </Grid>
              </Grid>
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
            <Button variant="outlined">
              Скасувати
            </Button>
            <Button variant="contained" onClick={handleSaveSettings}>
              Зберегти налаштування
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 