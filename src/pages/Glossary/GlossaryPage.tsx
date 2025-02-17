/**
 * File: src/pages/Glossary/GlossaryPage.tsx
 * Description: Main glossary page component using shadcn styling with Tailwind CSS and lucide-react icons
 */
import { useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Bookmark,
  BookOpen,
} from "lucide-react";
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

  // Define available filters using lucide-react icons
  const availableFilters: Filter[] = [
    {
      id: "bookmarked",
      label: "Bookmarked",
      icon: <Bookmark className="w-4 h-4" />,
    },
    {
      id: "ratios",
      label: "Financial Ratios",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "market",
      label: "Market Analysis",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "fundamentals",
      label: "Fundamentals",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "accounting",
      label: "Accounting",
      icon: <BookOpen className="w-4 h-4" />,
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
    const matchesSearch =
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilters.size === 0) return matchesSearch;

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
      if (!linkedTerms) return <span>{text}</span>;

      let result = text;
      linkedTerms.forEach(({ term, definition }) => {
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        result = result.replace(
          regex,
          `<span class="linked-term text-accent-500 cursor-pointer" title="${definition}">${term}</span>`
        );
      });

      return (
        <span
          dangerouslySetInnerHTML={{ __html: result }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("linked-term")) {
              const clickedTerm = target.textContent;
              if (clickedTerm) handleRelatedTermClick(clickedTerm);
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
    <div className="flex gap-4 h-[calc(100vh-100px)]">
      {/* Terms List Section */}
      <div className="bg-white shadow rounded flex flex-col w-[320px]">
        <div className="p-4 flex flex-col gap-4">
          {/* Search Field */}
          <div className="flex items-center border border-gray-300 rounded p-2">
            <Search className="w-5 h-5 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none bg-transparent text-gray-800"
            />
          </div>

          {/* Filters Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Filters {activeFilters.size > 0 ? `(${activeFilters.size})` : ""}
            </button>
            {activeFilters.size > 0 && (
              <button
                onClick={() => {
                  setActiveFilters(new Set());
                  setShowFilters(false);
                }}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters Collapse */}
          {showFilters && (
            <div className="bg-white border border-gray-300 rounded p-4 mt-2">
              <p className="text-sm text-gray-800 mb-4">Select filters</p>
              <div className="flex flex-wrap gap-2">
                {availableFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded border border-gray-300 text-sm ${
                      activeFilters.has(filter.id)
                        ? "bg-accent-500 text-white"
                        : "bg-transparent text-gray-700"
                    }`}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTerms.map((term) => (
            <div
              key={term.id}
              className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => handleTermSelect(term)}
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold">{term.term}</h3>
                <p className="text-sm text-gray-600">{term.shortDefinition}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(term.id);
                }}
                className="p-1"
              >
                <Bookmark
                  className={`w-5 h-5 ${
                    bookmarkedTerms.has(term.id)
                      ? "text-accent-500"
                      : "text-gray-500"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Term Details Section */}
      <div className="flex-1 overflow-x-auto p-4">
        {openTerms.length > 0 ? (
          <div className="bg-white shadow rounded p-6 min-w-[400px] max-w-[600px] relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    activeTermIndex > 0 &&
                    setActiveTermIndex(activeTermIndex - 1)
                  }
                  disabled={activeTermIndex === 0}
                  className="p-2 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">
                  {openTerms[activeTermIndex].term}
                </h2>
                <button
                  onClick={() =>
                    activeTermIndex < openTerms.length - 1 &&
                    setActiveTermIndex(activeTermIndex + 1)
                  }
                  disabled={activeTermIndex === openTerms.length - 1}
                  className="p-2 rounded disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button onClick={handleCloseTerm} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Definition Section */}
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-2 text-gray-800">
                Definition
              </h3>
              <div className="text-sm text-gray-700">
                {renderLinkedDefinition(
                  openTerms[activeTermIndex].fullDefinition,
                  openTerms[activeTermIndex].linkedTerms
                )}
              </div>
            </div>

            {/* Formula Section */}
            {openTerms[activeTermIndex].formula && (
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-2 text-gray-800">
                  Formula
                </h3>
                <div className="bg-gray-100 border border-gray-300 rounded p-4 font-mono text-sm text-gray-800 whitespace-pre">
                  {openTerms[activeTermIndex].formula}
                </div>
                <p className="mt-2 text-sm text-gray-800">
                  {openTerms[activeTermIndex].formulaExplanation}
                </p>
              </div>
            )}

            {/* Related Terms Section */}
            {openTerms[activeTermIndex].relatedTerms && (
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-2 text-gray-800">
                  Related Terms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {openTerms[activeTermIndex].relatedTerms.map(
                    (relatedTerm) => (
                      <div
                        key={relatedTerm}
                        onClick={() => handleRelatedTermClick(relatedTerm)}
                        className="cursor-pointer px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <p className="text-sm text-gray-800">{relatedTerm}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Welcome Screen Content
          <div className="bg-white shadow rounded p-8 flex flex-col gap-8 h-full">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Financial Glossary</h2>
              <p className="text-gray-700">
                Explore essential financial terms and concepts. Each entry
                includes detailed definitions, formulas, and related terms to
                help you understand market dynamics better.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Your Bookmarked Terms</h3>
              <div className="flex flex-wrap gap-3">
                {terms
                  .filter((term) => bookmarkedTerms.has(term.id))
                  .map((term) => (
                    <div
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      className="cursor-pointer px-4 py-2 bg-blue-100 border border-gray-300 rounded"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {term.term}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Getting Started</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-gray-300 rounded">
                  <Search className="w-5 h-5 text-accent-500" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-800">
                      Search Terms
                    </p>
                    <p className="text-sm text-gray-800">
                      Use the search bar to find specific terms or browse
                      through the list
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-gray-300 rounded">
                  <Bookmark className="w-5 h-5 text-accent-500" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-800">
                      Bookmark for Quick Access
                    </p>
                    <p className="text-sm text-gray-800">
                      Save important terms for quick reference using the
                      bookmark icon
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-gray-300 rounded">
                  <BookOpen className="w-5 h-5 text-accent-500" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-800">
                      Explore Related Terms
                    </p>
                    <p className="text-sm text-gray-800">
                      Click on highlighted terms in definitions to discover
                      connected concepts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
