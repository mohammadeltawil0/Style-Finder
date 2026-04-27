import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import Login from "../app/auth/logIn.jsx";

/* ---------------- MOCKS ---------------- */

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
}));

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

// Survey context
import * as SurveyContext from "../context/SurveyContext";

// Toast
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

const Toast = require("react-native-toast-message").default;

// Themed components
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
      text: "#000",
      lightText: "#999",
      card: "#ccc",
      lightBrown: "#E3D5CA",
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

const fillLogin = (getByPlaceholderText, password = "Password1@") => {
  fireEvent.changeText(getByPlaceholderText("Username"), "stella");
  fireEvent.changeText(getByPlaceholderText("Password"), password);
};

beforeEach(() => {
  jest.clearAllMocks();

  jest.spyOn(SurveyContext, "useSurvey").mockReturnValue({
    resetAnswers: jest.fn(),
  });
});

/* ---------------- TESTS ---------------- */

describe("Login Screen", () => {
  test("missing fields → error", () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText("Sign In"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Missing Fields",
      })
    );
  });

  test("successful login → user landing (has preferences)", async () => {
    apiClient.post.mockResolvedValue({
      data: { token: "token", userId: 1, username: "stella", role: "USER" },
    });

    apiClient.get
      .mockResolvedValueOnce({ data: { preferenceId: 1 } }) // preferences
      .mockResolvedValueOnce({ data: { firstName: "Stella" } }); // user profile

    const { getByPlaceholderText, getByText } = renderScreen();

    fillLogin(getByPlaceholderText);

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/screens/userLandingpage");
    });
  });

  test("no preferences → survey navigation", async () => {
    apiClient.post.mockResolvedValue({
      data: { token: "token", userId: 1, username: "stella", role: "USER" },
    });

    apiClient.get
      .mockRejectedValueOnce({ response: { status: 404 } }) // no preferences
      .mockResolvedValueOnce({ data: { firstName: "Stella" } });

    const { getByPlaceholderText, getByText } = renderScreen();

    fillLogin(getByPlaceholderText);

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/screens/survey/preferences1"
      );
    });
  });

  test("admin user → admin landing", async () => {
    apiClient.post.mockResolvedValue({
      data: {
        token: "token",
        userId: 1,
        username: "stella",
        role: "ADMIN",
      },
    });

    apiClient.get
      .mockResolvedValueOnce({ data: { preferenceId: 1 } })
      .mockResolvedValueOnce({ data: { firstName: "Stella" } });

    const { getByPlaceholderText, getByText } = renderScreen();

    fillLogin(getByPlaceholderText);

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/settings/adminFolder/adminLanding"
      );
    });
  });

  test("login failure → toast error", async () => {
    apiClient.post.mockRejectedValue({
      response: { status: 401, data: { message: "Invalid credentials" } },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fillLogin(getByPlaceholderText, "wrong");

    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: "Login Failed",
        })
      );
    });
  });
});