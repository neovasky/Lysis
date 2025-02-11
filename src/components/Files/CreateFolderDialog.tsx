import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex, Text, Button } from "@radix-ui/themes";
import { Cross2Icon, FileIcon } from "@radix-ui/react-icons";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => Promise<void>;
  isLoading?: boolean;
  currentPath?: string | null;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  currentPath,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Build the regex via RegExp constructor to avoid ESLint warnings.
  // The pattern matches any of these characters: < > : " / \ | ? *
  // or any control character between U+0000 and U+001F.
  const invalidCharsPattern = '[<>:"/\\\\|?*\\u0000-\\u001F]';
  const invalidChars = new RegExp(invalidCharsPattern, "u");

  const validateFolderName = (name: string): string | null => {
    if (!name.trim()) {
      return "Please enter a folder name";
    }

    if (invalidChars.test(name)) {
      return "Folder name contains invalid characters";
    }

    if (name.length > 255) {
      return "Folder name is too long";
    }

    if (name.startsWith(" ") || name.endsWith(" ") || name.endsWith(".")) {
      return "Folder name cannot start or end with spaces or end with periods";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateFolderName(folderName);
    if (validationError) {
      setError(validationError);
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
                  <Button
                    asChild
                    onClick={() => {
                      setFolderName("");
                      setError(null);
                    }}
                  >
                    <button className="DialogCloseButton">
                      <Cross2Icon />
                    </button>
                  </Button>
                </Dialog.Close>
              </Flex>

              {/* Current Path Display (optional) */}
              {currentPath && (
                <Text size="2" color="gray">
                  Location: {currentPath}
                </Text>
              )}

              {/* Input Field */}
              <Box>
                <Text
                  as="label"
                  size="2"
                  mb="2"
                  weight="medium"
                  style={{ display: "block", color: "#fff" }}
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
                  disabled={isLoading}
                  autoFocus
                />
              </Box>

              {/* Error Message */}
              {error && (
                <Text size="2" color="red" style={{ marginTop: "-8px" }}>
                  {error}
                </Text>
              )}

              {/* Action Button */}
              <Flex justify="end">
                <Button
                  type="submit"
                  variant="solid"
                  style={{
                    backgroundColor: "#007aff",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#005ec7")
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
