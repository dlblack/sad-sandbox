import React from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export default function AppProviders({ children }) {
  return (
    <MantineProvider
      theme={{
        primaryColor: "teal",
        defaultRadius: "md",
        headings: { fontWeight: "600" }
      }}
      withCssVariables
      defaultColorScheme="auto"
    >
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
