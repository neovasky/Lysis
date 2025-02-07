/**
 * File: src/pages/Analysis/AnalysisPage.tsx
 * Description: Analysis page component for watchlists and analysis
 */

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
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
  // Suppress hooks usage warning while keeping the hook for future use
  useAuth();

  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [analysisLists, setAnalysisLists] = useState<AnalysisList[]>([]);
  const [openNewListDialog, setOpenNewListDialog] = useState(false);
  const [listType, setListType] = useState<"watchlist" | "analysis">(
    "watchlist"
  );
  const [newListName, setNewListName] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);

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
    setAnchorEl(null);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedList(id);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Analysis
        </Typography>
        <Typography color="text.secondary">
          Manage your watchlists and analysis lists
        </Typography>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Watchlists Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Watchlists</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setListType("watchlist");
                  setOpenNewListDialog(true);
                }}
                sx={{
                  borderColor: "rgba(144, 202, 249, 0.12)",
                  "&:hover": {
                    borderColor: "rgba(144, 202, 249, 0.24)",
                  },
                }}
              >
                New Watchlist
              </Button>
            </Stack>

            <List>
              {watchlists.map((list) => (
                <ListItem
                  key={list.id}
                  sx={{
                    backgroundColor: "rgba(144, 202, 249, 0.04)",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={list.name}
                    secondary={`${list.stocks.length} stocks`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => handleOpenMenu(e, list.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Analysis Lists Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Analysis Lists</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setListType("analysis");
                  setOpenNewListDialog(true);
                }}
                sx={{
                  borderColor: "rgba(144, 202, 249, 0.12)",
                  "&:hover": {
                    borderColor: "rgba(144, 202, 249, 0.24)",
                  },
                }}
              >
                New Analysis List
              </Button>
            </Stack>

            <List>
              {analysisLists.map((list) => (
                <ListItem
                  key={list.id}
                  sx={{
                    backgroundColor: "rgba(144, 202, 249, 0.04)",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={list.name}
                    secondary={`${list.stocks.length} stocks`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => handleOpenMenu(e, list.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* New List Dialog */}
      <Dialog
        open={openNewListDialog}
        onClose={() => setOpenNewListDialog(false)}
      >
        <DialogTitle>
          Create New {listType === "watchlist" ? "Watchlist" : "Analysis List"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewListDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateList} disabled={!newListName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* List Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleDeleteList(
              selectedList!,
              watchlists.find((w) => w.id === selectedList)
                ? "watchlist"
                : "analysis"
            )
          }
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};
