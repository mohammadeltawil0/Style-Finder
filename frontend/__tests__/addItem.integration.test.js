import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AddItemScreen from "../app/closet/add-item";

/* ---------------- GLOBAL MOCKS ---------------- */

// AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve("1")),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// API (AXIOS)
jest.mock("../scripts/apiClient", () => ({
  apiClient: {
    post: jest.fn(() => Promise.resolve({ data: { itemId: 1 } })),
  },
}));

import { apiClient } from "../scripts/apiClient";

// Themed components
jest.mock("../components", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return {
    ThemedText: ({ children, ...props }) => (
      <Text {...props}>{children}</Text>
    ),
    ThemedView: ({ children, ...props }) => (
      <View {...props}>{children}</View>
    ),
  };
});

/* ---------------- PAGE MOCKS (FLOW SIMULATION) ---------------- */

const createStep = (label, action) => (props) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={() => action(props)}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
};

jest.mock("../app/closet/camera-page.jsx", () =>
  createStep("Next", (p) => p.setPage(2))
);

jest.mock("../app/closet/category-page.jsx", () => (props) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <>
      <TouchableOpacity onPress={() => props.setItemType("TOP")}>
        <Text>Top</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => props.setPage(3)}>
        <Text>Next</Text>
      </TouchableOpacity>
    </>
  );
});

jest.mock("../app/closet/color-page.jsx", () =>
  createStep("Black", (p) => {
    p.setColor("black");
    p.setPage(4);
  })
);

jest.mock("../app/closet/event-page.jsx", () =>
  createStep("Casual", (p) => {
    p.setFormality("casual");
    p.setPage(5);
  })
);

jest.mock("../app/closet/material-page.jsx", () =>
  createStep("Cotton", (p) => {
    p.setMaterial("cotton");
    p.setPage(6);
  })
);

jest.mock("../app/closet/fit-page.jsx", () =>
  createStep("Next", (p) => p.setPage(7))
);

jest.mock("../app/closet/season-page.jsx", () =>
  createStep("Next", (p) => p.setPage(8))
);

jest.mock("../app/closet/length-page.jsx", () =>
  createStep("Next", (p) => p.setPage(9))
);

jest.mock("../app/closet/bulk-page.jsx", () =>
  createStep("Next", (p) => p.setPage(10))
);

jest.mock("../app/closet/review-page", () => (props) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={props.handleSubmit}>
      <Text>Submit</Text>
    </TouchableOpacity>
  );
});

/* ---------------- TEST SETUP ---------------- */

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0, 
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderScreen = () =>
  render(
    <QueryClientProvider client={createTestClient()}>
      <NavigationContainer>
        <AddItemScreen />
      </NavigationContainer>
    </QueryClientProvider>
  );

/* ---------------- TEST ---------------- */

describe("Add Item to Closet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should complete full flow and submit item", async () => {
    const { getByText } = renderScreen();

    // Flow through steps (with waits for stability)
    await waitFor(() => fireEvent.press(getByText("Next"))); // camera
    await waitFor(() => fireEvent.press(getByText("Top")));
    await waitFor(() => fireEvent.press(getByText("Next")));
    await waitFor(() => fireEvent.press(getByText("Black")));
    await waitFor(() => fireEvent.press(getByText("Casual")));
    await waitFor(() => fireEvent.press(getByText("Cotton")));

    await waitFor(() => fireEvent.press(getByText("Next"))); // fit
    await waitFor(() => fireEvent.press(getByText("Next"))); // season
    await waitFor(() => fireEvent.press(getByText("Next"))); // length
    await waitFor(() => fireEvent.press(getByText("Next"))); // bulk

    await waitFor(() => fireEvent.press(getByText("Submit")));

    // ✅ API called
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });

    // ✅ Navigation triggered
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/(tabs)/closet",
      params: { tab: "items" },
    });
  });
});

