/**
 * File: src/pages/Analysis/AnalysisPage.tsx
 * Description: Analysis page component for watchlists and analysis using shadcn styling with Tailwind CSS and lucide-react icons
 */

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Plus, MoreVertical, Edit2, Trash } from "lucide-react";

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

  // Minimal custom dropdown for each ListCard
  const ListCard = ({
    list,
    type,
  }: {
    list: WatchlistItem | AnalysisList;
    type: "watchlist" | "analysis";
  }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
      <div className="bg-white rounded shadow p-4 mb-2 flex justify-between items-center">
        <div>
          <p className="font-bold">{list.name}</p>
          <p className="text-sm text-gray-500">{list.stocks.length} stocks</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <MoreVertical size={20} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow">
              <button
                onClick={() => {
                  // Implement edit functionality as needed
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  handleDeleteList(list.id, type);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
              >
                <Trash size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Minimal Modal component for new list creation
  const Modal = ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>
        <div className="bg-white rounded p-6 z-50 max-w-md w-full">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Analysis</h2>
        <p className="text-gray-600">
          Manage your watchlists and analysis lists
        </p>
      </div>

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Watchlists Section */}
        <div className="bg-white rounded shadow p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Watchlists</h3>
            <button
              onClick={() => {
                setListType("watchlist");
                setOpenNewListDialog(true);
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              <Plus size={16} />
              New Watchlist
            </button>
          </div>
          {watchlists.map((list) => (
            <ListCard key={list.id} list={list} type="watchlist" />
          ))}
        </div>

        {/* Analysis Lists Section */}
        <div className="bg-white rounded shadow p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Analysis Lists</h3>
            <button
              onClick={() => {
                setListType("analysis");
                setOpenNewListDialog(true);
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              <Plus size={16} />
              New Analysis List
            </button>
          </div>
          {analysisLists.map((list) => (
            <ListCard key={list.id} list={list} type="analysis" />
          ))}
        </div>
      </div>

      {/* New List Modal */}
      <Modal
        isOpen={openNewListDialog}
        onClose={() => setOpenNewListDialog(false)}
      >
        <h3 className="text-lg font-semibold mb-4">
          Create New {listType === "watchlist" ? "Watchlist" : "Analysis List"}
        </h3>
        <input
          type="text"
          placeholder="List Name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setOpenNewListDialog(false)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateList}
            disabled={!newListName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </Modal>
    </div>
  );
};
