/* eslint-disable react-refresh/only-export-components */
// File: src/components/Sidebar/sidebar-layout.tsx
import React, { createContext, useContext, useState } from "react";
import { PanelLeft } from "lucide-react";

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const toggle = () => setIsOpen((prev: boolean) => !prev);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};

// This component is not needed anymore since we're using flexbox layout
// Keeping it commented in case you need to reference it later
/*
export const SidebarInset: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isOpen } = useSidebar();
  const width = isOpen ? 240 : 72;
  return (
    <div
      style={{ marginLeft: width, transition: "margin-left 300ms ease-in-out" }}
      className="flex flex-col flex-1"
    >
      {children}
    </div>
  );
};
*/

export const SidebarTrigger: React.FC<
  React.ComponentPropsWithoutRef<"button">
> = (props) => {
  const { toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      {...props}
      className={`z-50 transition-colors duration-300 ease-in-out ${
        props.className || ""
      }`}
    >
      <PanelLeft size={24} style={{ color: "white" }} />
    </button>
  );
};
