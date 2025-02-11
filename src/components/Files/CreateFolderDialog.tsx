import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex, Text, Button } from "@radix-ui/themes";
import { Cross2Icon, FileIcon } from "@radix-ui/react-icons";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setError("Please enter a folder name");
      return;
    }

    try {
      setError(null);
      await onConfirm(folderName.trim());
      setFolderName("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              {/* Header */}
              <Flex justify="between" align="center">
                <Flex className="DialogTitle">
                  <FileIcon width="24" height="24" />
                  <Text> Create New Folder</Text>
                </Flex>
                <Dialog.Close asChild>
                  <Button asChild>
                    <button className="DialogCloseButton">
                      <Cross2Icon />
                    </button>
                  </Button>
                </Dialog.Close>
              </Flex>

              {/* Input Field */}
              <Box>
                <Text
                  as="label"
                  size="2"
                  mb="2"
                  weight="medium"
                  style={{ color: "#fff" }}
                >
                  Folder Name
                </Text>
                <input
                  className="FolderInput"
                  placeholder="Enter folder name"
                  value={folderName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFolderName(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                />
              </Box>

              {/* Error Message */}
              {error && (
                <Text size="2" color="red" style={{ marginTop: "-8px" }}>
                  {error}
                </Text>
              )}

              {/* Action Button (Cancel button removed) */}
              <Flex justify="end">
                <Button
                  type="submit"
                  variant="solid"
                  style={{
                    backgroundColor: "#007aff",
                    color: "#fff",
                    padding: "8px 16px", // Reduced vertical padding for a balanced look
                    borderRadius: "6px", // Slightly rounded edges
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#005EC7")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#007aff")
                  }
                  disabled={isLoading || !folderName.trim()}
                >
                  {isLoading ? "Creating..." : "Create Folder"}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
