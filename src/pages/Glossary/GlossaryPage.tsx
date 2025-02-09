/**
 * File: src/pages/Glossary/GlossaryPage.tsx
 * Description: Main glossary page component (converted from MUI to Radix UI)
 */

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  Text,
  Heading,
  Flex,
  Button,
  IconButton,
  ScrollArea,
} from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
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
  const [openTerms, setOpenTerms] = useState<GlossaryTerm[]>([]);
  const [activeTermIndex, setActiveTermIndex] = useState<number>(0);

  // Define available filters with Radix icons (using ReaderIcon as a placeholder)
  const availableFilters: Filter[] = [
    {
      id: "bookmarked",
      label: "Bookmarked",
      icon: <BookmarkIcon style={{ fontSize: "16px" }} />,
    },
    {
      id: "ratios",
      label: "Financial Ratios",
      icon: <ReaderIcon style={{ fontSize: "16px" }} />,
    },
    {
      id: "market",
      label: "Market Analysis",
      icon: <ReaderIcon style={{ fontSize: "16px" }} />,
    },
    {
      id: "fundamentals",
      label: "Fundamentals",
      icon: <ReaderIcon style={{ fontSize: "16px" }} />,
    },
    {
      id: "accounting",
      label: "Accounting",
      icon: <ReaderIcon style={{ fontSize: "16px" }} />,
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

    if (activeFilters.size === 0) {
      return matchesSearch;
    }

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

  const handleRelatedTermClick = useCallback((termName: string) => {
    const relatedTerm = terms.find(
      (t) => t.term.toLowerCase() === termName.toLowerCase()
    );
    if (relatedTerm) {
      setOpenTerms((prev) => [...prev, relatedTerm]);
      setActiveTermIndex((prev) => prev + 1);
    }
  }, []);

  const renderLinkedDefinition = useCallback(
    (text: string, linkedTerms?: { term: string; definition: string }[]) => {
      if (!linkedTerms) return <Text>{text}</Text>;

      let result = text;
      linkedTerms.forEach(({ term, definition }) => {
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        result = result.replace(
          regex,
          `<span class="linked-term" title="${definition}" style="color: var(--accent-9); cursor: pointer;">${term}</span>`
        );
      });

      return (
        <Text
          as="span"
          dangerouslySetInnerHTML={{ __html: result }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("linked-term")) {
              const term = target.textContent;
              if (term) handleRelatedTermClick(term);
            }
          }}
        />
      );
    },
    [handleRelatedTermClick]
  );

  const handleTermSelect = (term: GlossaryTerm) => {
    setOpenTerms([term]);
    setActiveTermIndex(0);
  };

  useEffect(() => {
    if (selectedTerm) {
      handleTermSelect(selectedTerm);
      setSelectedTerm(null);
    }
  }, [selectedTerm]);

  const handleCloseTerm = () => {
    setOpenTerms((prev) => {
      const newTerms = [...prev];
      newTerms.splice(activeTermIndex, 1);
      let newIndex = activeTermIndex;
      if (newIndex >= newTerms.length) {
        newIndex = newTerms.length - 1;
      }
      setActiveTermIndex(newIndex);
      return newTerms;
    });
  };

  return (
    <Flex style={{ gap: "16px", height: "calc(100vh - 100px)" }}>
      {/* Terms List Section */}
      <Card
        style={{
          width: "320px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Flex style={{ padding: "16px", flexDirection: "column", gap: "16px" }}>
          {/* Search Field */}
          <Flex
            style={{
              alignItems: "center",
              border: "1px solid var(--gray-5)",
              borderRadius: "4px",
              padding: "8px",
            }}
          >
            <MagnifyingGlassIcon
              style={{ marginRight: "8px", color: "var(--gray-12)" }}
            />
            <input
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: "var(--gray-12)",
              }}
            />
          </Flex>

          {/* Filters Buttons */}
          <Flex style={{ gap: "8px" }}>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              style={{ height: "36px" }}
            >
              <ReaderIcon style={{ marginRight: "4px" }} />
              Filters {activeFilters.size > 0 ? `(${activeFilters.size})` : ""}
            </Button>
            {activeFilters.size > 0 && (
              <Button
                onClick={() => {
                  setActiveFilters(new Set());
                  setShowFilters(false);
                }}
                style={{ height: "36px" }}
              >
                Clear
              </Button>
            )}
          </Flex>

          {/* Filters Collapse */}
          {showFilters && (
            <Card
              variant="classic"
              style={{
                marginTop: "8px",
                padding: "16px",
                backgroundColor: "rgba(144,202,249,0.04)",
                border: "1px solid var(--gray-5)",
              }}
            >
              <Flex style={{ flexDirection: "column", gap: "16px" }}>
                <Text size="2" style={{ color: "var(--gray-12)" }}>
                  Select filters
                </Text>
                <Flex style={{ flexWrap: "wrap", gap: "8px" }}>
                  {availableFilters.map((filter) => (
                    <Button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      variant={
                        activeFilters.has(filter.id) ? "solid" : "outline"
                      }
                      style={{
                        borderColor: "var(--gray-5)",
                        backgroundColor: activeFilters.has(filter.id)
                          ? "var(--accent-9)"
                          : undefined,
                      }}
                    >
                      {filter.icon}
                      {filter.label}
                    </Button>
                  ))}
                </Flex>
              </Flex>
            </Card>
          )}
        </Flex>

        {/* Terms List */}
        <ScrollArea style={{ flex: 1 }}>
          {filteredTerms.map((term) => (
            <Flex
              key={term.id}
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                borderBottom: "1px solid var(--gray-5)",
              }}
            >
              <div
                onClick={() => handleTermSelect(term)}
                style={{ cursor: "pointer", flex: 1 }}
              >
                <Heading size="5">{term.term}</Heading>
                <Text size="2" style={{ color: "var(--gray-12)" }}>
                  {term.shortDefinition}
                </Text>
              </div>
              <IconButton
                onClick={() => toggleBookmark(term.id)}
                style={{ marginRight: "8px" }}
              >
                {bookmarkedTerms.has(term.id) ? (
                  <BookmarkIcon style={{ color: "var(--accent-9)" }} />
                ) : (
                  <BookmarkIcon />
                )}
              </IconButton>
            </Flex>
          ))}
        </ScrollArea>
      </Card>

      {/* Term Details Section */}
      <Flex
        style={{ flex: 1, gap: "16px", overflowX: "auto", padding: "16px" }}
      >
        {openTerms.length > 0 ? (
          <Card
            style={{
              flex: 1,
              padding: "24px",
              minWidth: "400px",
              maxWidth: "600px",
              overflow: "auto",
              position: "relative",
            }}
          >
            <Flex
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <Flex
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <IconButton
                  onClick={() => {
                    if (activeTermIndex > 0)
                      setActiveTermIndex(activeTermIndex - 1);
                  }}
                  disabled={activeTermIndex === 0}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Heading size="4">{openTerms[activeTermIndex].term}</Heading>
                <IconButton
                  onClick={() => {
                    if (activeTermIndex < openTerms.length - 1)
                      setActiveTermIndex(activeTermIndex + 1);
                  }}
                  disabled={activeTermIndex === openTerms.length - 1}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Flex>
              <IconButton onClick={handleCloseTerm}>
                <Cross2Icon />
              </IconButton>
            </Flex>

            {/* Definition Section */}
            <Box style={{ marginBottom: "16px" }}>
              <Heading
                size="3"
                style={{ marginBottom: "8px", color: "var(--gray-12)" }}
              >
                Definition
              </Heading>
              {renderLinkedDefinition(
                openTerms[activeTermIndex].fullDefinition,
                openTerms[activeTermIndex].linkedTerms
              )}
            </Box>

            {/* Formula Section */}
            {openTerms[activeTermIndex].formula && (
              <Box style={{ marginBottom: "16px" }}>
                <Heading
                  size="3"
                  style={{ marginBottom: "8px", color: "var(--gray-12)" }}
                >
                  Formula
                </Heading>
                <Card
                  variant="surface"
                  style={{
                    padding: "16px",
                    backgroundColor: "rgba(144,202,249,0.04)",
                    border: "1px solid var(--gray-5)",
                  }}
                >
                  <Text
                    as="p"
                    style={{
                      fontFamily: "monospace",
                      fontSize: "1.1rem",
                      whiteSpace: "pre",
                      color: "var(--gray-12)",
                    }}
                  >
                    {openTerms[activeTermIndex].formula}
                  </Text>
                </Card>
                <Text style={{ marginTop: "8px", color: "var(--gray-12)" }}>
                  {openTerms[activeTermIndex].formulaExplanation}
                </Text>
              </Box>
            )}

            {/* Related Terms Section */}
            {openTerms[activeTermIndex].relatedTerms && (
              <Box style={{ marginBottom: "16px" }}>
                <Heading
                  size="3"
                  style={{ marginBottom: "8px", color: "var(--gray-12)" }}
                >
                  Related Terms
                </Heading>
                <Flex style={{ flexWrap: "wrap", gap: "8px" }}>
                  {openTerms[activeTermIndex].relatedTerms.map(
                    (relatedTerm) => (
                      <Card
                        key={relatedTerm}
                        variant="classic"
                        onClick={() => handleRelatedTermClick(relatedTerm)}
                        style={{
                          padding: "4px 8px",
                          cursor: "pointer",
                          border: "1px solid var(--gray-5)",
                        }}
                      >
                        <Text size="2" style={{ color: "var(--gray-12)" }}>
                          {relatedTerm}
                        </Text>
                      </Card>
                    )
                  )}
                </Flex>
              </Box>
            )}
          </Card>
        ) : (
          // Welcome Screen Content
          <Card style={{ flex: 1, padding: "24px", overflow: "auto" }}>
            <Flex
              style={{
                flexDirection: "column",
                gap: "32px",
                height: "100%",
                padding: "32px",
              }}
            >
              <Flex style={{ flexDirection: "column", gap: "16px" }}>
                <Heading size="4">Financial Glossary</Heading>
                <Text style={{ color: "var(--gray-12)" }}>
                  Explore essential financial terms and concepts. Each entry
                  includes detailed definitions, formulas, and related terms to
                  help you understand market dynamics better.
                </Text>
              </Flex>

              <Flex style={{ flexDirection: "column", gap: "16px" }}>
                <Heading size="3">Your Bookmarked Terms</Heading>
                <Flex style={{ flexWrap: "wrap", gap: "12px" }}>
                  {terms
                    .filter((term) => bookmarkedTerms.has(term.id))
                    .map((term) => (
                      <Card
                        key={term.id}
                        variant="classic"
                        onClick={() => setSelectedTerm(term)}
                        style={{
                          padding: "8px 16px",
                          cursor: "pointer",
                          backgroundColor: "rgba(144,202,249,0.04)",
                          border: "1px solid var(--gray-5)",
                        }}
                      >
                        <Text size="2" style={{ color: "var(--gray-12)" }}>
                          {term.term}
                        </Text>
                      </Card>
                    ))}
                </Flex>
              </Flex>

              <Flex style={{ flexDirection: "column", gap: "16px" }}>
                <Heading size="3">Getting Started</Heading>
                <Flex style={{ flexDirection: "column", gap: "16px" }}>
                  <Card
                    variant="classic"
                    style={{
                      padding: "16px",
                      backgroundColor: "rgba(144,202,249,0.04)",
                      border: "1px solid var(--gray-5)",
                    }}
                  >
                    <Flex style={{ alignItems: "center", gap: "16px" }}>
                      <MagnifyingGlassIcon
                        style={{ color: "var(--accent-9)" }}
                      />
                      <Flex style={{ flexDirection: "column" }}>
                        <Text
                          size="2"
                          style={{ fontWeight: 500, color: "var(--gray-12)" }}
                        >
                          Search Terms
                        </Text>
                        <Text size="2" style={{ color: "var(--gray-12)" }}>
                          Use the search bar to find specific terms or browse
                          through the list
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>

                  <Card
                    variant="classic"
                    style={{
                      padding: "16px",
                      backgroundColor: "rgba(144,202,249,0.04)",
                      border: "1px solid var(--gray-5)",
                    }}
                  >
                    <Flex style={{ alignItems: "center", gap: "16px" }}>
                      <BookmarkIcon style={{ color: "var(--accent-9)" }} />
                      <Flex style={{ flexDirection: "column" }}>
                        <Text
                          size="2"
                          style={{ fontWeight: 500, color: "var(--gray-12)" }}
                        >
                          Bookmark for Quick Access
                        </Text>
                        <Text size="2" style={{ color: "var(--gray-12)" }}>
                          Save important terms for quick reference using the
                          bookmark icon
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>

                  <Card
                    variant="classic"
                    style={{
                      padding: "16px",
                      backgroundColor: "rgba(144,202,249,0.04)",
                      border: "1px solid var(--gray-5)",
                    }}
                  >
                    <Flex style={{ alignItems: "center", gap: "16px" }}>
                      <ReaderIcon style={{ color: "var(--accent-9)" }} />
                      <Flex style={{ flexDirection: "column" }}>
                        <Text
                          size="2"
                          style={{ fontWeight: 500, color: "var(--gray-12)" }}
                        >
                          Explore Related Terms
                        </Text>
                        <Text size="2" style={{ color: "var(--gray-12)" }}>
                          Click on highlighted terms in definitions to discover
                          connected concepts
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        )}
      </Flex>
    </Flex>
  );
};
