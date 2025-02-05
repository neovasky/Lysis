/**
 * File: src/pages/Glossary/GlossaryPage.tsx
 * Description: Main glossary page component
 */

import { useState, useCallback } from "react";
import {
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Stack,
  Button,
  Chip,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalculateIcon from "@mui/icons-material/Calculate";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { terms } from "./data/terms";
import { GlossaryTerm, Filter } from "./types";

export const GlossaryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [bookmarkedTerms, setBookmarkedTerms] = useState<Set<string>>(
    new Set()
  );
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const availableFilters: Filter[] = [
    {
      id: "bookmarked",
      label: "Bookmarked",
      icon: <BookmarkIcon fontSize="small" />,
    },
    {
      id: "ratios",
      label: "Financial Ratios",
      icon: <CalculateIcon fontSize="small" />,
    },
    {
      id: "market",
      label: "Market Analysis",
      icon: <ShowChartIcon fontSize="small" />,
    },
    {
      id: "fundamentals",
      label: "Fundamentals",
      icon: <TrendingUpIcon fontSize="small" />,
    },
    {
      id: "accounting",
      label: "Accounting",
      icon: <AccountBalanceIcon fontSize="small" />,
    },
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      return newFilters;
    });
  };

  const filteredTerms = terms.filter((term) => {
    // Search filter
    const matchesSearch =
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase());

    // If no filters are active, show all terms that match search
    if (activeFilters.size === 0) {
      return matchesSearch;
    }

    // Check if term matches any active filters
    const matchesBookmark = activeFilters.has("bookmarked")
      ? bookmarkedTerms.has(term.id)
      : false;
    const matchesRatios = activeFilters.has("ratios")
      ? term.categories?.includes("ratios")
      : false;
    const matchesMarket = activeFilters.has("market")
      ? term.categories?.includes("market")
      : false;
    const matchesFundamentals = activeFilters.has("fundamentals")
      ? term.categories?.includes("fundamentals")
      : false;
    const matchesAccounting = activeFilters.has("accounting")
      ? term.categories?.includes("accounting")
      : false;

    return (
      matchesSearch &&
      (matchesBookmark ||
        matchesRatios ||
        matchesMarket ||
        matchesFundamentals ||
        matchesAccounting)
    );
  });

  const toggleBookmark = (termId: string) => {
    setBookmarkedTerms((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(termId)) {
        newBookmarks.delete(termId);
      } else {
        newBookmarks.add(termId);
      }
      return newBookmarks;
    });
  };

  const renderLinkedDefinition = useCallback(
    (text: string, linkedTerms?: { term: string; definition: string }[]) => {
      if (!linkedTerms) return text;

      let result = text;
      linkedTerms.forEach(({ term, definition }) => {
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        result = result.replace(
          regex,
          `<span class="linked-term" title="${definition}" style="color: #90caf9; cursor: pointer;">${term}</span>`
        );
      });

      return (
        <Typography
          dangerouslySetInnerHTML={{ __html: result }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("linked-term")) {
              console.log("Term clicked:", target.textContent);
            }
          }}
        />
      );
    },
    []
  );

  return (
    <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 100px)" }}>
      {/* Terms List Section */}
      <Paper
        sx={{
          width: 320,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            variant="outlined"
            size="small"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
              sx={{
                borderColor: "rgba(144, 202, 249, 0.12)",
                "&:hover": {
                  borderColor: "rgba(144, 202, 249, 0.24)",
                },
                height: 36,
              }}
            >
              Filters {activeFilters.size > 0 && `(${activeFilters.size})`}
            </Button>
            {activeFilters.size > 0 && (
              <Button
                size="small"
                startIcon={<ClearAllIcon />}
                onClick={() => {
                  setActiveFilters(new Set());
                  setShowFilters(false);
                }}
                sx={{ height: 36 }}
              >
                Clear
              </Button>
            )}
          </Box>
          <Collapse in={showFilters}>
            <Paper
              variant="outlined"
              sx={{
                mt: 1,
                p: 2,
                backgroundColor: "rgba(144, 202, 249, 0.04)",
                border: "1px solid rgba(144, 202, 249, 0.12)",
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Select filters
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {availableFilters.map((filter) => (
                    <Chip
                      key={filter.id}
                      label={filter.label}
                      icon={filter.icon}
                      onClick={() => toggleFilter(filter.id)}
                      variant={
                        activeFilters.has(filter.id) ? "filled" : "outlined"
                      }
                      color={
                        activeFilters.has(filter.id) ? "primary" : "default"
                      }
                      sx={{
                        borderColor: "rgba(144, 202, 249, 0.12)",
                        "&:hover": {
                          backgroundColor: activeFilters.has(filter.id)
                            ? undefined
                            : "rgba(144, 202, 249, 0.08)",
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Collapse>
        </Box>
        <Divider />
        <List sx={{ overflow: "auto", flex: 1 }}>
          {filteredTerms.map((term) => (
            <ListItem
              key={term.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => toggleBookmark(term.id)}
                  sx={{ mr: 1 }}
                >
                  {bookmarkedTerms.has(term.id) ? (
                    <BookmarkIcon color="primary" />
                  ) : (
                    <BookmarkBorderIcon />
                  )}
                </IconButton>
              }
            >
              <ListItemButton onClick={() => setSelectedTerm(term)}>
                <ListItemText
                  primary={term.term}
                  secondary={term.shortDefinition}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Term Details Section */}
      <Paper sx={{ flex: 1, p: 3, overflow: "auto", position: "relative" }}>
        {selectedTerm ? (
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {selectedTerm.term}
              </Typography>
              <IconButton onClick={() => setSelectedTerm(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Definition
              </Typography>
              {renderLinkedDefinition(
                selectedTerm.fullDefinition,
                selectedTerm.linkedTerms
              )}
            </Box>

            {selectedTerm.formula && (
              <Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Formula
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(144, 202, 249, 0.04)",
                    border: "1px solid rgba(144, 202, 249, 0.12)",
                  }}
                >
                  <Typography fontFamily="monospace" fontSize="1.1rem">
                    {selectedTerm.formula}
                  </Typography>
                </Paper>
                <Typography sx={{ mt: 1 }} color="text.secondary">
                  {selectedTerm.formulaExplanation}
                </Typography>
              </Box>
            )}

            {selectedTerm.relatedTerms && (
              <Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Related Terms
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedTerm.relatedTerms.map((term) => (
                    <Paper
                      key={term}
                      variant="outlined"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(144, 202, 249, 0.08)",
                        },
                      }}
                    >
                      <Typography variant="body2">{term}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              p: 4,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Financial Glossary
              </Typography>
              <Typography color="text.secondary">
                Explore essential financial terms and concepts. Each entry
                includes detailed definitions, formulas, and related terms to
                help you understand market dynamics better.
              </Typography>
            </Box>

            {bookmarkedTerms.size > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Your Bookmarked Terms
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {terms
                    .filter((term) => bookmarkedTerms.has(term.id))
                    .map((term) => (
                      <Paper
                        key={term.id}
                        onClick={() => setSelectedTerm(term)}
                        sx={{
                          px: 2,
                          py: 1,
                          cursor: "pointer",
                          backgroundColor: "rgba(144, 202, 249, 0.04)",
                          border: "1px solid rgba(144, 202, 249, 0.12)",
                          "&:hover": {
                            backgroundColor: "rgba(144, 202, 249, 0.08)",
                          },
                        }}
                      >
                        <Typography variant="body2">{term.term}</Typography>
                      </Paper>
                    ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Getting Started
              </Typography>
              <Stack spacing={2}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(144, 202, 249, 0.04)",
                    border: "1px solid rgba(144, 202, 249, 0.12)",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <SearchIcon color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Search Terms
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use the search bar to find specific terms or browse
                        through the list
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(144, 202, 249, 0.04)",
                    border: "1px solid rgba(144, 202, 249, 0.12)",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <BookmarkIcon color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Bookmark for Quick Access
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Save important terms for quick reference using the
                        bookmark icon
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(144, 202, 249, 0.04)",
                    border: "1px solid rgba(144, 202, 249, 0.12)",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <MenuBookIcon color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Explore Related Terms
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click on highlighted terms in definitions to discover
                        connected concepts
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
