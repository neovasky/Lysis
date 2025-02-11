import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Card, Flex, Text, Button } from "@radix-ui/themes";
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
          <Card size="3">
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="5" weight="bold">
                    Create New Folder
                  </Text>
                  <Dialog.Close asChild>
                    <Button variant="ghost" color="gray">
                      <Cross2Icon />
                    </Button>
                  </Dialog.Close>
                </Flex>

                <Box>
                  <Text as="label" size="2" mb="2" weight="medium">
                    Folder Name
                  </Text>
                  <input
                    className="rt-TextFieldInput"
                    value={folderName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFolderName(e.target.value)
                    }
                    placeholder="Enter folder name"
                    autoFocus
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
                  <Dialog.Close asChild>
                    <Button variant="soft" color="gray">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button type="submit" disabled={!folderName.trim()}>
                    Create
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
