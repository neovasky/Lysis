/**
 * File: src/components/TopBar/TopBar.tsx
 * Description: Top application bar with notifications
 */

import { Flex, Box, Text, IconButton } from "@radix-ui/themes";
import { NotificationsMenu } from "../NotificationsMenu/NotificationsMenu";
// Replace Radix's ViewVerticalIcon with lucide-react's LayoutGrid
import { LayoutGrid } from "lucide-react";

interface TopBarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: (isOpen: boolean) => void;
}

export const TopBar = ({ isSidebarOpen, onSidebarToggle }: TopBarProps) => {
  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        height: "64px",
        backgroundColor: "var(--color-panelSolid)",
        borderBottom: "1px solid var(--color-borderCard)",
        zIndex: 1200,
      }}
    >
      <Flex align="center" justify="between" px="4" style={{ height: "100%" }}>
        <Flex align="center" gap="4">
          <IconButton
            size="2"
            variant="ghost"
            onClick={() => onSidebarToggle(!isSidebarOpen)}
          >
            <LayoutGrid size={20} />
          </IconButton>
          <Text
            size="5"
            weight="bold"
            style={{
              background:
                "linear-gradient(45deg, var(--accent-9) 30%, var(--accent-8) 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Lysis
          </Text>
        </Flex>

        <Flex align="center" gap="2">
          <NotificationsMenu />
        </Flex>
      </Flex>
    </Box>
  );
};
