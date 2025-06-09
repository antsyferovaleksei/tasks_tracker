import React from 'react';
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    handleClose();
  };

  const getCurrentLanguageFlag = () => {
    return i18n.language === 'ua' ? '🇺🇦' : '🇺🇸';
  };

  return (
    <>
      <Tooltip title={t('language.switchLanguage')}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 1 }}
          color="inherit"
        >
          <LanguageIcon />
          <Typography variant="caption" sx={{ ml: 0.5, fontSize: '16px' }}>
            {getCurrentLanguageFlag()}
          </Typography>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('ua')}
          selected={i18n.language === 'ua'}
        >
          <ListItemIcon>
            <Typography sx={{ fontSize: '20px' }}>🇺🇦</Typography>
          </ListItemIcon>
          <Typography>{t('language.ukrainian')}</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={i18n.language === 'en'}
        >
          <ListItemIcon>
            <Typography sx={{ fontSize: '20px' }}>🇺🇸</Typography>
          </ListItemIcon>
          <Typography>{t('language.english')}</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageToggle; 