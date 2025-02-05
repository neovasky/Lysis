/**
 * File: src/pages/Settings/SettingsPage.tsx
 * Description: Application settings configuration page
 */

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Alert,
  Snackbar,
  Button,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  CloudSync as CloudSyncIcon,
  Backup as BackupIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";

interface SettingsState {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  autoBackup: boolean;
  cloudSync: boolean;
}

type SettingType = "switch" | "select";

interface BaseSetting {
  id: keyof SettingsState;
  icon: JSX.Element;
  title: string;
  description: string;
  type: SettingType;
}

interface SwitchSetting extends BaseSetting {
  type: "switch";
}

interface SelectSetting extends BaseSetting {
  type: "select";
  options: { value: string; label: string }[];
}

type Setting = SwitchSetting | SelectSetting;

export const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    darkMode: true,
    language: "en",
    autoBackup: true,
    cloudSync: true,
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const settingsList: Setting[] = [
    {
      id: "notifications",
      icon: <NotificationsIcon />,
      title: "Notifications",
      description: "Enable alerts for market events and updates",
      type: "switch",
    },
    {
      id: "darkMode",
      icon: <DarkModeIcon />,
      title: "Dark Mode",
      description: "Use dark theme across the application",
      type: "switch",
    },
    {
      id: "language",
      icon: <LanguageIcon />,
      title: "Language",
      description: "Select your preferred language",
      type: "select",
      options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
      ],
    },
    {
      id: "autoBackup",
      icon: <BackupIcon />,
      title: "Auto Backup",
      description: "Automatically backup your data daily",
      type: "switch",
    },
    {
      id: "cloudSync",
      icon: <CloudSyncIcon />,
      title: "Cloud Sync",
      description: "Keep your data synchronized across devices",
      type: "switch",
    },
  ];

  const handleSettingChange = (
    setting: keyof SettingsState,
    value: boolean | string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
    setShowSaveSuccess(true);
  };

  const handleDataExport = () => {
    // Implementation for data export
    console.log("Exporting data...");
  };

  const handleDataDelete = () => {
    // Implementation for data deletion
    console.log("Deleting data...");
  };

  const renderSettingControl = (setting: Setting) => {
    if (setting.type === "switch") {
      return (
        <Switch
          edge="end"
          checked={settings[setting.id] as boolean}
          onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
        />
      );
    }

    return (
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={settings[setting.id] as string}
          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          sx={{ backgroundColor: "rgba(144, 202, 249, 0.04)" }}
        >
          {setting.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Settings
        </Typography>
        <Typography color="text.secondary">
          Customize your application preferences
        </Typography>
      </Paper>

      {/* Settings List */}
      <Paper sx={{ mb: 3 }}>
        <List>
          {settingsList.map((setting, index) => (
            <Box key={setting.id}>
              <ListItem sx={{ py: 2 }}>
                <ListItemIcon>{setting.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={500}>
                      {setting.title}
                    </Typography>
                  }
                  secondary={setting.description}
                />
                {renderSettingControl(setting)}
              </ListItem>
              {index < settingsList.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Data Management */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Management
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Export your data
            </Typography>
            <Button
              variant="outlined"
              startIcon={<StorageIcon />}
              onClick={handleDataExport}
              sx={{
                borderColor: "rgba(144, 202, 249, 0.12)",
                "&:hover": {
                  borderColor: "rgba(144, 202, 249, 0.24)",
                },
              }}
            >
              Export Data
            </Button>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Delete all data
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleDataDelete}
            >
              Delete All Data
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Success Notification */}
      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSaveSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Settings saved successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};
