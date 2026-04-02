import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AddItemScreen from "../app/closet/add-item";

global.alert = jest.fn();
/* ---------------- mocks ---------------- */

//AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve("1")),
}));

//fetch (API)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ itemId: 1 }),
  })
);

//router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

//themed components (fix theme crash)
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

/* ---------------- PAGE MOCKS ---------------- */

//camera
jest.mock("../app/closet/camera-page.jsx", () => ({ setPage }) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={() => setPage(2)}>
      <Text>Next</Text>
    </TouchableOpacity>
  );
});

//category
jest.mock("../app/closet/category-page.jsx", () => ({
  setPage,
  setItemType,
}) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <>
      <TouchableOpacity onPress={() => setItemType("Top")}>
        <Text>Top</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPage(3)}>
        <Text>Next</Text>
      </TouchableOpacity>
    </>
  );
});

//color
jest.mock("../app/closet/color-page.jsx", () => ({
  setPage,
  setColor,
}) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <>
      <TouchableOpacity onPress={() => setColor("black")}>
        <Text>Black</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPage(4)}>
        <Text>Next</Text>
      </TouchableOpacity>
    </>
  );
});

//event
jest.mock("../app/closet/event-page.jsx", () => ({
  setPage,
  setFormality,
}) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <>
      <TouchableOpacity onPress={() => setFormality("casual")}>
        <Text>Casual</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPage(5)}>
        <Text>Next</Text>
      </TouchableOpacity>
    </>
  );
});

//material
jest.mock("../app/closet/material-page.jsx", () => ({
  setPage,
  setMaterial,
}) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <>
      <TouchableOpacity onPress={() => setMaterial("cotton")}>
        <Text>Cotton</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPage(6)}>
        <Text>Next</Text>
      </TouchableOpacity>
    </>
  );
});

//fit
jest.mock("../app/closet/fit-page.jsx", () => ({ setPage }) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={() => setPage(7)}>
      <Text>Next</Text>
    </TouchableOpacity>
  );
});

//season
jest.mock("../app/closet/season-page.jsx", () => ({ setPage }) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={() => setPage(8)}>
      <Text>Next</Text>
    </TouchableOpacity>
  );
});

//length
jest.mock("../app/closet/length-page.jsx", () => ({ setPage }) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={() => setPage(9)}>
      <Text>Next</Text>
    </TouchableOpacity>
  );
});

//bulk
jest.mock("../app/closet/bulk-page.jsx", () => ({ setPage }) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={() => setPage(10)}>
      <Text>Next</Text>
    </TouchableOpacity>
  );
});

//review
jest.mock("../app/closet/review-page", () => (props) => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");

  return (
    <TouchableOpacity onPress={props.handleSubmit}>
      <Text>Submit</Text>
    </TouchableOpacity>
  );
});

describe("Use Case: Add Item to Digital Wardrobe", () => {
  it("should complete full flow and submit item", async () => {
    const { getByText } = render(
      <NavigationContainer>
        <AddItemScreen />
      </NavigationContainer>
    );

    //flow through all steps
    fireEvent.press(getByText("Next")); //camera
    fireEvent.press(getByText("Top"));
    fireEvent.press(getByText("Next"));
    fireEvent.press(getByText("Black"));
    fireEvent.press(getByText("Next"));
    fireEvent.press(getByText("Casual"));
    fireEvent.press(getByText("Next"));
    fireEvent.press(getByText("Cotton"));
    fireEvent.press(getByText("Next"));

    fireEvent.press(getByText("Next")); //fit
    fireEvent.press(getByText("Next")); //season
    fireEvent.press(getByText("Next")); //length
    fireEvent.press(getByText("Next")); //bulk

    fireEvent.press(getByText("Submit"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    //API call verified
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/items"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    //nav verified
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/closet",
        params: { tab: "inventory" },
      });
    });
  });
});