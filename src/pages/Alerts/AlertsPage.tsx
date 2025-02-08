/**
 * File: src/pages/Alerts/AlertsPage.tsx
 * Description: Alerts page component using Radix UI Themes
 */

import { Container, Card, Heading, Text } from "@radix-ui/themes";
import { styled } from "@stitches/react";

// Styled wrapper for page padding
const PageWrapper = styled("div", {
  padding: "24px",
});

export const AlertsPage = () => {
  return (
    <PageWrapper>
      <Container>
        <Card
          size="2"
          style={{
            backgroundColor: "var(--gray-2)",
            marginBottom: "24px",
          }}
        >
          <Heading as="h1" size="6" weight="bold" mb="2">
            Alerts
          </Heading>
          <Text color="gray" size="3">
            This feature is coming soon.
          </Text>
        </Card>
      </Container>
    </PageWrapper>
  );
};
