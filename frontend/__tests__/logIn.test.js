jest.mock("context/SurveyContext", () => ({
  useSurvey: () => ({
    resetAnswers: jest.fn(),
  }),
}), { virtual: true });

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import Login from "../app/auth/logIn.jsx";


// router
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
  }),
}));

// API
jest.mock("../scripts/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
  describeApiError: jest.fn((error) => ({
    status: error?.response?.status || error?.status || 500,
    message: error?.response?.data?.message || "Error",
  })),
}));

import { apiClient } from "../scripts/apiClient";

// Toast
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

import Toast from "react-native-toast-message";

// themed components
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

// theme
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

describe("Login Screen", () => {
  const renderScreen = () =>
    render(
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    );

  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(Toast.show).toHaveBeenCalled();
  });

  test("successful login navigates to tabs when preferences exist", async () => {
    apiClient.post.mockResolvedValue({
      data: {
        token: "fake-token",
        userId: 1,
        username: "stella",
      },
    });

    // preferences exist
    apiClient.get.mockResolvedValueOnce({
      data: { preferenceId: 1 },
    });

    // user fetch
    apiClient.get.mockResolvedValueOnce({
      data: { profileImageUrl: "" },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Username"), "stella");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  test("navigates to survey when no preferences", async () => {
    apiClient.post.mockResolvedValue({
      data: {
        token: "fake-token",
        userId: 1,
        username: "stella",
      },
    });

    // preferences NOT found → 404
    apiClient.get.mockRejectedValueOnce({
      response: {
        status: 404,
      },
  });

    // user fetch
    apiClient.get.mockResolvedValueOnce({
      data: { profileImageUrl: "" },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Username"), "stella");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/screens/survey/preferences1"
      );
    });
  });

  test("API failure shows error toast", async () => {
    apiClient.post.mockRejectedValue({
      response: {
        status: 401,
        data: { message: "Invalid credentials" },
      },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Username"), "stella");
    fireEvent.changeText(getByPlaceholderText("Password"), "wrong");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalled();
    });
  });

  test("stores JWT token in AsyncStorage after successful login", async () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");

    apiClient.post.mockResolvedValue({
      data: {
        token: "test-token-123",
        userId: 1,
        username: "stella",
      },
    });

    // preferences exist (so flow continues normally)
    apiClient.get.mockResolvedValueOnce({
      data: { preferenceId: 1 },
    });

    // user fetch
    apiClient.get.mockResolvedValueOnce({
      data: { profileImageUrl: "" },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Username"), "stella");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "token",
        "test-token-123"
      );
    });
  });
});


