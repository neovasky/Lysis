/**
 * File: src/pages/Notes/NotesPage.tsx
 * Description: Research notes page component using Radix UI
 */

import { Card, Text, Heading, Box } from "@radix-ui/themes";

export const NotesPage = () => {
  return (
    <Box>
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Heading size="6" weight="bold" mb="2">
          Research Notes
        </Heading>
        <Text color="gray" size="2">
          This feature is coming soon.
        </Text>
      </Card>
    </Box>
  );
};
