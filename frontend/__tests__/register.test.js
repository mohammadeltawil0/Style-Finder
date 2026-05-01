import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import Register from "../app/auth/register.jsx";

/* ---------------- MOCKS ---------------- */

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("../scripts/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { apiClient } from "../scripts/apiClient";

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

const Toast = require("react-native-toast-message").default;

// silence Ionicons
jest.mock("@expo/vector-icons/Ionicons", () => "Icon");

// themed components
jest.mock("../components", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return {
    ThemedText: ({ children, ...props }) => <Text {...props}>{children}</Text>,
    ThemedView: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

// theme
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useTheme: () => ({
    colors: {
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
      <Register />
    </NavigationContainer>
  );

//valid base input (passes ALL validation)
const fillValidForm = (getByPlaceholderText) => {
  fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
  fireEvent.changeText(getByPlaceholderText("Email"), "stella@gmail.com");
  fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
  fireEvent.changeText(getByPlaceholderText("Password"), "Password1@");
  fireEvent.changeText(
    getByPlaceholderText("Confirm Password"),
    "Password1@"
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

/* ---------------- TESTS ---------------- */

describe("Register Screen (JWT)", () => {
  test("successful registration → API + navigation", async () => {
    apiClient.get.mockResolvedValue({});
    apiClient.post.mockResolvedValue({
      data: {
        token: "token",
        userId: 1,
        username: "stella123",
        profileImageUrl: "",
      },
    });
    const { getByPlaceholderText, getByText } = renderScreen();

    fillValidForm(getByPlaceholderText);
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/screens/survey/preferences1",
      params: { isNewUser: "true" },
    });
  });

  test("missing fields → error", () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText("Sign Up"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Missing Fields",
      })
    );
  });

  test("invalid email → error", () => {
    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "bademail"); 
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "Password1@");
    fireEvent.changeText(
      getByPlaceholderText("Confirm Password"),
      "Password1@"
    );

    fireEvent.press(getByText("Sign Up"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Invalid Email",
      })
    );
  });

  test("password mismatch → error", () => {
    const { getByPlaceholderText, getByText } = renderScreen();

    fillValidForm(getByPlaceholderText);

    fireEvent.changeText(
      getByPlaceholderText("Confirm Password"),
      "DIFFERENT"
    );

    fireEvent.press(getByText("Sign Up"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Password Mismatch",
      })
    );
  });

  test("weak password → error", () => {
    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "stella@gmail.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "weak"); // ❌
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "weak");

    fireEvent.press(getByText("Sign Up"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Weak Password",
      })
    );
  });

  test("username taken → error", async () => {
    apiClient.get.mockRejectedValueOnce({
      response: { status: 409 },
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fillValidForm(getByPlaceholderText);

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: "Username Taken",
        })
      );
    });
  });
});