/**
 * File: src/pages/Calendar/CalendarPage.tsx
 * Description: Calendar page component using Radix UI
 */

import { Card, Text, Heading, Box } from "@radix-ui/themes";

export const CalendarPage = () => {
  return (
    <Box>
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Heading size="6" weight="bold" mb="2">
          Calendar
        </Heading>
        <Text color="gray" size="2">
          This feature is coming soon.
        </Text>
      </Card>
    </Box>
  );
};
