/**
 * File: src/pages/Settings/SettingsPage.tsx
 * Description: Application settings configuration page using Radix UI
 */

import { useState } from "react";
import {
  Box,
  Card,
  Text,
  Heading,
  Flex,
  Button,
  Switch,
  Select,
} from "@radix-ui/themes";
import {
  BellIcon,
  MoonIcon,
  GlobeIcon,
  ArchiveIcon,
  ArrowUpIcon,
  ClipboardIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

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
      icon: <BellIcon width="20" height="20" />,
      title: "Notifications",
      description: "Enable alerts for market events and updates",
      type: "switch",
    },
    {
      id: "darkMode",
      icon: <MoonIcon width="20" height="20" />,
      title: "Dark Mode",
      description: "Use dark theme across the application",
      type: "switch",
    },
    {
      id: "language",
      icon: <GlobeIcon width="20" height="20" />,
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
      icon: <ArchiveIcon width="20" height="20" />,
      title: "Auto Backup",
      description: "Automatically backup your data daily",
      type: "switch",
    },
    {
      id: "cloudSync",
      icon: <ArrowUpIcon width="20" height="20" />,
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
    setTimeout(() => setShowSaveSuccess(false), 3000);
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
          checked={settings[setting.id] as boolean}
          onCheckedChange={(checked) =>
            handleSettingChange(setting.id, checked)
          }
        />
      );
    }

    return (
      <Select.Root
        value={settings[setting.id] as string}
        onValueChange={(value) => handleSettingChange(setting.id, value)}
      >
        <Select.Trigger />
        <Select.Content>
          {setting.options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    );
  };

  const SettingRow = ({ setting }: { setting: Setting }) => (
    <Box>
      <Flex justify="between" align="center" py="3">
        <Flex gap="3" align="start">
          <Box style={{ color: "var(--accent-9)" }}>{setting.icon}</Box>
          <Box>
            <Text weight="bold">{setting.title}</Text>
            <Text size="2" color="gray">
              {setting.description}
            </Text>
          </Box>
        </Flex>
        {renderSettingControl(setting)}
      </Flex>
    </Box>
  );

  return (
    <Box style={{ padding: "24px" }}>
      {/* Header */}
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Heading size="5" weight="bold" mb="2">
          Settings
        </Heading>
        <Text color="gray" size="2">
          Customize your application preferences
        </Text>
      </Card>

      {/* Settings List */}
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Flex direction="column" gap="3">
          {settingsList.map((setting, index) => (
            <Box key={setting.id}>
              <SettingRow setting={setting} />
              {index < settingsList.length - 1 && (
                <Box style={{ height: "1px", background: "var(--gray-5)" }} />
              )}
            </Box>
          ))}
        </Flex>
      </Card>

      {/* Data Management */}
      <Card size="3">
        <Heading size="4" mb="4">
          Data Management
        </Heading>
        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" color="gray" mb="2">
              Export your data
            </Text>
            <Button variant="soft" onClick={handleDataExport}>
              <ClipboardIcon />
              Export Data
            </Button>
          </Box>
          <Box>
            <Text size="2" color="gray" mb="2">
              Delete all data
            </Text>
            <Button variant="soft" color="red" onClick={handleDataDelete}>
              <TrashIcon />
              Delete All Data
            </Button>
          </Box>
        </Flex>
      </Card>

      {/* Success Toast */}
      {showSaveSuccess && (
        <Box
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--green-3)",
            padding: "12px 24px",
            borderRadius: "6px",
            border: "1px solid var(--green-6)",
          }}
        >
          <Text color="green">Settings saved successfully</Text>
        </Box>
      )}
    </Box>
  );
};
