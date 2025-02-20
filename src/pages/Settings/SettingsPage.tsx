// File: src/components/SettingsPage.tsx
import { useState } from "react";
import {
  Bell,
  Globe,
  Archive,
  ArrowUp,
  Clipboard,
  Trash,
  Palette,
} from "lucide-react";
import { ThemeCustomizer } from "@/components/ThemeSwitcher/ThemeCustomizer";
import { useTheme } from "@/theme/hooks/useTheme";
import type { ThemeAccent } from "@/theme/types";

interface SettingsState {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  autoBackup: boolean;
  cloudSync: boolean;
  // accent is managed by theme context
}

type SettingType = "switch" | "select";

interface BaseSetting {
  id: keyof SettingsState | "accent"; // extend to include accent
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

// Update AVAILABLE_ACCENTS to include all accent names from your globalStyles.css
const AVAILABLE_ACCENTS: readonly ThemeAccent[] = [
  "classic",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    darkMode: true,
    language: "en",
    autoBackup: true,
    cloudSync: true,
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Pull the current accent and setter from the theme context
  const { accent, setAccent, mode, setMode } = useTheme();

  const settingsList: Setting[] = [
    {
      id: "notifications",
      icon: <Bell className="w-5 h-5 text-accent" />,
      title: "Notifications",
      description: "Enable alerts for market events and updates",
      type: "switch",
    },
    {
      id: "language",
      icon: <Globe className="w-5 h-5 text-accent" />,
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
      icon: <Archive className="w-5 h-5 text-accent" />,
      title: "Auto Backup",
      description: "Automatically backup your data daily",
      type: "switch",
    },
    {
      id: "cloudSync",
      icon: <ArrowUp className="w-5 h-5 text-accent" />,
      title: "Cloud Sync",
      description: "Keep your data synchronized across devices",
      type: "switch",
    },
    {
      id: "accent",
      icon: <Palette className="w-5 h-5 text-accent" />,
      title: "Accent Color",
      description: "Select your preferred accent color",
      type: "select",
      options: AVAILABLE_ACCENTS.map((color) => ({
        value: color,
        label: color.charAt(0).toUpperCase() + color.slice(1),
      })),
    },
  ];

  // Use a single signature for handleSettingChange.
  const handleSettingChange = (
    setting: keyof SettingsState | "accent",
    value: boolean | string
  ): void => {
    if (setting === "accent") {
      // We assume value is one of the allowed ThemeAccent strings.
      setAccent(value as ThemeAccent);
    } else if (setting === "darkMode" && typeof value === "boolean") {
      setMode(value ? "dark" : "light");
      setSettings((prev) => ({ ...prev, [setting]: value }));
    } else {
      setSettings((prev) => ({ ...prev, [setting]: value }));
    }
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Custom switch control using Tailwind
  const SwitchControl = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <span
        className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      ></span>
    </label>
  );

  // Custom select control using Tailwind
  const SelectControl = ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border border-gray-300 rounded bg-background text-foreground"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const renderSettingControl = (setting: Setting) => {
    if (setting.type === "switch") {
      return (
        <SwitchControl
          checked={
            setting.id === "darkMode"
              ? mode === "dark"
              : (settings[setting.id as keyof SettingsState] as boolean)
          }
          onChange={(checked) => handleSettingChange(setting.id, checked)}
        />
      );
    }
    return (
      <SelectControl
        value={
          setting.id === "accent"
            ? accent
            : (settings[setting.id as keyof SettingsState] as string)
        }
        onChange={(value) => handleSettingChange(setting.id, value)}
        options={setting.options}
      />
    );
  };

  const SettingRow = ({ setting }: { setting: Setting }) => (
    <div className="py-3 border-b border-gray-300">
      <div className="flex justify-between items-center">
        <div className="flex items-start gap-3">
          <div>{setting.icon}</div>
          <div>
            <p className="font-bold text-foreground">{setting.title}</p>
            <p className="text-sm text-gray-600">{setting.description}</p>
          </div>
        </div>
        <div>{renderSettingControl(setting)}</div>
      </div>
    </div>
  );

  const handleDataExport = () => {
    console.log("Exporting data...");
  };

  const handleDataDelete = () => {
    console.log("Deleting data...");
  };

  return (
    <div className="p-6 bg-color-pageBackground text-color-text-primary">
      {/* Header */}
      <div className="bg-color-pageBackground shadow rounded p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-sm text-gray-600">
          Customize your application preferences
        </p>
      </div>

      {/* Settings List */}
      <div className="bg-color-pageBackground shadow rounded p-6 mb-6">
        <div className="flex flex-col gap-3">
          {settingsList.map((setting) => (
            <SettingRow key={setting.id} setting={setting} />
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-color-pageBackground shadow rounded p-6">
        <h3 className="text-xl font-bold mb-4">Data Management</h3>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Export your data</p>
            <button
              onClick={handleDataExport}
              className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Clipboard className="w-4 h-4" />
              Export Data
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Delete all data</p>
            <button
              onClick={handleDataDelete}
              className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              <Trash className="w-4 h-4" />
              Delete All Data
            </button>
          </div>
        </div>
      </div>

      {/* Theme Customizer (alternative UI) */}
      <div className="mt-6">
        <ThemeCustomizer />
      </div>

      {/* Success Toast */}
      {showSaveSuccess && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-200 border border-green-400 px-6 py-3 rounded">
          <p className="text-green-700 text-sm">Settings saved successfully</p>
        </div>
      )}
    </div>
  );
};
