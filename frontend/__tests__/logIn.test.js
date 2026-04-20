import * as SurveyContext from "../context/SurveyContext";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import Login from "../app/auth/logIn.jsx";

beforeEach(() => {
  jest.spyOn(SurveyContext, "useSurvey").mockReturnValue({
    resetAnswers: jest.fn(),
  });
});

//Router
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

//AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

//API
jest.mock("../scripts/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
  describeApiError: jest.fn((err) => ({
    status: err?.response?.status || 500,
    message: err?.response?.data?.message || "Error",
  })),
}));

import { apiClient } from "../scripts/apiClient";

//Toast
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

//Themed components
jest.mock("../components", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return {
    ThemedText: ({ children, ...props }) => <Text {...props}>{children}</Text>,
    ThemedView: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

// Theme
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useTheme: () => ({
    colors: {
      primary: "#949F71",
      lightBrown: "#E3D5CA",
      text: "#000",
      lightText: "#999",
      card: "#ccc",
    },
    fonts: {
      bold: "bold",
      light: "light",
      semiBold: "semibold",
    },
  }),
}));

/* ---------------- SETUP ---------------- */

const renderScreen = () =>
  render(
    <NavigationContainer>
      <Login />
    </NavigationContainer>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

/* ---------------- TESTS ---------------- */

describe("Login Screen", () => {
  test("renders inputs", () => {
    const { getByPlaceholderText } = renderScreen();

    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  test("shows error if fields empty", () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText("Sign In"));

    const Toast = require("react-native-toast-message").default;
    expect(Toast.show).toHaveBeenCalled();
  });

  test("successful login → navigates to tabs when preferences exist", async () => {
    apiClient.post.mockResolvedValue({
      data: {
        token: "token",
        userId: 1,
        username: "stella",
      },
    });

    // preferences exist
    apiClient.get
      .mockResolvedValueOnce({ data: { preferenceId: 1 } }) // preferences
      .mockResolvedValueOnce({ data: { firstName: "Stella" } }); // user fetch

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Username"), "stella");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  test("no preferences → navigates to survey", async () => {
    apiClient.post.mockResolvedValue({
      data: {
        token: "token",
        userId: 1,
        username: "stella",
      },
    });

    // preferences NOT found (404)
    apiClient.get
      .mockRejectedValueOnce({
        response: { status: 404 },
      })
      .mockResolvedValueOnce({ data: { firstName: "Stella" } });

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
    const Toast = require("react-native-toast-message").default;

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalled();
    });
  });
});