/**
 * File: src/pages/Files/FilesPage.tsx
 * Description: Files page component using Radix UI
 */

import { Box, Card, Text, Heading, Grid, Flex, Button } from "@radix-ui/themes";
import { UploadIcon, FileIcon } from "@radix-ui/react-icons";

export const FilesPage = () => {
  return (
    <Box>
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Flex justify="between" align="center">
          <Box>
            <Heading size="6" weight="bold" mb="2">
              Files
            </Heading>
            <Text color="gray" size="2">
              Manage your research documents and files
            </Text>
          </Box>
          <Button size="3" variant="surface">
            <UploadIcon width="16" height="16" />
            <Text>Upload File</Text>
          </Button>
        </Flex>
      </Card>

      <Grid columns="3" gap="4">
        <Card size="2">
          <Flex align="center" gap="2" mb="3">
            <FileIcon
              width="20"
              height="20"
              style={{ color: "var(--accent-9)" }}
            />
            <Heading size="3">Research Reports</Heading>
          </Flex>
          <Text color="gray" size="2">
            3 files
          </Text>
        </Card>

        <Card size="2">
          <Flex align="center" gap="2" mb="3">
            <FileIcon
              width="20"
              height="20"
              style={{ color: "var(--accent-9)" }}
            />
            <Heading size="3">Financial Statements</Heading>
          </Flex>
          <Text color="gray" size="2">
            5 files
          </Text>
        </Card>

        <Card size="2">
          <Flex align="center" gap="2" mb="3">
            <FileIcon
              width="20"
              height="20"
              style={{ color: "var(--accent-9)" }}
            />
            <Heading size="3">Market Analysis</Heading>
          </Flex>
          <Text color="gray" size="2">
            2 files
          </Text>
        </Card>
      </Grid>
    </Box>
  );
};
