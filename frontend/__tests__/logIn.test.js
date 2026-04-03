import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Alert, Text, View } from "react-native";
import Login from "../app/auth/logIn.jsx";

//mock router (capture navigation)
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
  }),
}));

//mock API
jest.mock("../scripts/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { apiClient } from "../scripts/apiClient";

//mock themed components
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

//mock theme
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useTheme: () => ({
    colors: {
      primary: "#949F71",
      lightBrown: "#E3D5CA",
    },
    fonts: {
      bold: "bold",
      light: "light",
      semiBold: "semibold",
    },
  }),
}));

// ------------------ TESTS ------------------

describe("Login Screen", () => {
  const renderScreen = () =>
    render(
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  test("renders login inputs", () => {
    const { getByPlaceholderText } = renderScreen();

    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  test("user can type username and password", () => {
    const { getByPlaceholderText } = renderScreen();

    const usernameInput = getByPlaceholderText("Username");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(usernameInput, "stella");
    fireEvent.changeText(passwordInput, "password");

    expect(usernameInput.props.value).toBe("stella");
    expect(passwordInput.props.value).toBe("password");
  });

  test("shows error when fields are empty", () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText("Sign In"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Please enter username and password"
    );
  });

  test("successful login calls API and navigates", async () => {
    apiClient.post.mockResolvedValue({
      data: {
        userId: 1,
        username: "stella",
      },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Username"), "stella");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/users/login",
        {
          username: "stella",
          password: "password",
        }
      );

      expect(mockReplace).toHaveBeenCalled(); // navigates to home/tabs
    });
  });

  test("API failure shows error alert", async () => {
    apiClient.post.mockRejectedValue({
      response: {
        data: { message: "Invalid credentials" },
      },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Username"), "stella");
    fireEvent.changeText(getByPlaceholderText("Password"), "wrong");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Login failed: Invalid credentials"
      );
    });
  });
});