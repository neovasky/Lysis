import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex, Text, Button } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import "./styles.css";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onConfirm(folderName.trim());
      setFolderName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Flex
            direction="column"
            gap="4"
            p="6"
            style={{ backgroundColor: "var(--color-panel-solid)" }}
          >
            <Flex justify="between" align="center" mb="2">
              <Flex direction="column" gap="1">
                <Text size="5" weight="bold">
                  Create New Folder
                </Text>
                <Text size="2" color="gray">
                  Enter a name for your new folder
                </Text>
              </Flex>
              <Dialog.Close asChild>
                <Button variant="ghost" color="gray">
                  <Cross2Icon />
                </Button>
              </Dialog.Close>
            </Flex>

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" mb="2" weight="medium">
                    Folder Name
                  </Text>
                  <input
                    className="FolderInput"
                    value={folderName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFolderName(e.target.value)
                    }
                    placeholder="Enter folder name"
                    autoFocus
                  />
                </Box>

                <Flex gap="3" justify="end" mt="4">
                  <Dialog.Close asChild>
                    <Button variant="soft" color="gray">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button type="submit" disabled={!folderName.trim()}>
                    Create Folder
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
