/**
 * File: src/pages/Analysis/AnalysisPage.tsx
 * Description: Analysis page component for watchlists and analysis
 */

import { useState } from "react";
import {
  Box,
  Card,
  Text,
  Flex,
  Button,
  Dialog,
  DropdownMenu,
  Heading,
} from "@radix-ui/themes";
import {
  PlusIcon,
  DotsVerticalIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useAuth } from "../../hooks/useAuth";

interface WatchlistItem {
  id: string;
  name: string;
  stocks: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface AnalysisList {
  id: string;
  name: string;
  stocks: string[];
  notes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export const AnalysisPage = () => {
  useAuth();

  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [analysisLists, setAnalysisLists] = useState<AnalysisList[]>([]);
  const [openNewListDialog, setOpenNewListDialog] = useState(false);
  const [listType, setListType] = useState<"watchlist" | "analysis">(
    "watchlist"
  );
  const [newListName, setNewListName] = useState("");

  const handleCreateList = () => {
    const newList = {
      id: Date.now().toString(),
      name: newListName,
      stocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(listType === "analysis" && { notes: {} }),
    };

    if (listType === "watchlist") {
      setWatchlists((prev) => [...prev, newList as WatchlistItem]);
    } else {
      setAnalysisLists((prev) => [...prev, newList as AnalysisList]);
    }

    setNewListName("");
    setOpenNewListDialog(false);
  };

  const handleDeleteList = (id: string, type: "watchlist" | "analysis") => {
    if (type === "watchlist") {
      setWatchlists((prev) => prev.filter((list) => list.id !== id));
    } else {
      setAnalysisLists((prev) => prev.filter((list) => list.id !== id));
    }
  };

  const ListCard = ({
    list,
    type,
  }: {
    list: WatchlistItem | AnalysisList;
    type: "watchlist" | "analysis";
  }) => (
    <Card variant="surface" style={{ marginBottom: "8px" }}>
      <Flex justify="between" align="center">
        <Box>
          <Text weight="bold">{list.name}</Text>
          <Text size="1" color="gray">
            {list.stocks.length} stocks
          </Text>
        </Box>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" size="1">
              <DotsVerticalIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>
              <Flex gap="2" align="center">
                <Pencil1Icon />
                Edit
              </Flex>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onClick={() => handleDeleteList(list.id, type)}
            >
              <Flex gap="2" align="center">
                <TrashIcon />
                Delete
              </Flex>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Card>
  );

  return (
    <Box style={{ padding: "24px" }}>
      {/* Header */}
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Heading size="5" weight="bold" mb="2">
          Analysis
        </Heading>
        <Text color="gray" size="2">
          Manage your watchlists and analysis lists
        </Text>
      </Card>

      {/* Main Content */}
      <Flex gap="4">
        {/* Watchlists Section */}
        <Card size="3" style={{ flex: 1 }}>
          <Flex justify="between" align="center" mb="4">
            <Heading size="4">Watchlists</Heading>
            <Button
              onClick={() => {
                setListType("watchlist");
                setOpenNewListDialog(true);
              }}
            >
              <PlusIcon />
              New Watchlist
            </Button>
          </Flex>

          {watchlists.map((list) => (
            <ListCard key={list.id} list={list} type="watchlist" />
          ))}
        </Card>

        {/* Analysis Lists Section */}
        <Card size="3" style={{ flex: 1 }}>
          <Flex justify="between" align="center" mb="4">
            <Heading size="4">Analysis Lists</Heading>
            <Button
              onClick={() => {
                setListType("analysis");
                setOpenNewListDialog(true);
              }}
            >
              <PlusIcon />
              New Analysis List
            </Button>
          </Flex>

          {analysisLists.map((list) => (
            <ListCard key={list.id} list={list} type="analysis" />
          ))}
        </Card>
      </Flex>

      {/* New List Dialog */}
      <Dialog.Root open={openNewListDialog} onOpenChange={setOpenNewListDialog}>
        <Dialog.Content>
          <Dialog.Title>
            Create New{" "}
            {listType === "watchlist" ? "Watchlist" : "Analysis List"}
          </Dialog.Title>

          <Box my="4">
            <input
              className="rt-TextFieldInput"
              placeholder="List Name"
              value={newListName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewListName(e.target.value)
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--gray-5)",
                borderRadius: "6px",
                backgroundColor: "var(--color-panel)",
                color: "var(--gray-12)",
              }}
            />
          </Box>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button onClick={handleCreateList} disabled={!newListName.trim()}>
                Create
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};
