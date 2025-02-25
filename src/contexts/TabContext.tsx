/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from "react";
import { FileMetadata } from "@/store/slices/fileSlice";

// Define the tab interface
export interface Tab {
  id: string;
  title: string;
  type: "file" | "main";
  fileData?: {
    metadata: FileMetadata;
    content?: string | Uint8Array; // Can be a data URL or PDF buffer
  };
  isActive: boolean;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Omit<Tab, "isActive">) => void;
  closeTab: (tabId: string) => void;
  activateTab: (tabId: string) => void;
  getTabById: (tabId: string) => Tab | undefined;
  updateTabContent: (tabId: string, content: string | Uint8Array) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTabContext must be used within a TabProvider");
  }
  return context;
};

interface TabProviderProps {
  children: ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  // Initialize with a main app tab that cannot be closed
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "main-app",
      title: "Lysis",
      type: "main",
      isActive: true,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>("main-app");

  const addTab = (tab: Omit<Tab, "isActive">) => {
    const existingTabIndex = tabs.findIndex(
      (t) =>
        t.type === "file" &&
        t.fileData?.metadata.path === tab.fileData?.metadata.path
    );

    if (existingTabIndex !== -1) {
      // Tab already exists, just activate it
      const updatedTabs = tabs.map((t) => ({
        ...t,
        isActive: t.id === tabs[existingTabIndex].id,
      }));
      setTabs(updatedTabs);
      setActiveTabId(tabs[existingTabIndex].id);
      return;
    }

    // Update all tabs to inactive and add the new tab as active
    const updatedTabs = tabs.map((t) => ({ ...t, isActive: false }));
    const newTab = { ...tab, isActive: true };
    setTabs([...updatedTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    // Don't allow closing the main app tab
    if (tabId === "main-app") return;

    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    const isActiveTab = tabs[tabIndex].isActive;
    const newTabs = tabs.filter((t) => t.id !== tabId);

    if (isActiveTab && newTabs.length > 0) {
      // If the closed tab was active, activate the previous tab or the main tab
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      newTabs[newActiveIndex].isActive = true;
      setActiveTabId(newTabs[newActiveIndex].id);
    }

    setTabs(newTabs);
  };

  const activateTab = (tabId: string) => {
    const updatedTabs = tabs.map((tab) => ({
      ...tab,
      isActive: tab.id === tabId,
    }));
    setTabs(updatedTabs);
    setActiveTabId(tabId);
  };

  const getTabById = (tabId: string) => {
    return tabs.find((tab) => tab.id === tabId);
  };

  const updateTabContent = (tabId: string, content: string | Uint8Array) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId && tab.fileData
          ? {
              ...tab,
              fileData: {
                ...tab.fileData,
                content,
              },
            }
          : tab
      )
    );
  };

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        closeTab,
        activateTab,
        getTabById,
        updateTabContent,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
