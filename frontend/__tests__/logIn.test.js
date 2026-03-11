import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Alert, Text, View } from "react-native";
import Login from "../app/auth/logIn.jsx";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Properly mock Themed components (must return RN components)
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

// Mock useTheme but keep NavigationContainer working
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

//tests
describe("Login Screen", () => {
    const renderScreen = () =>
        render(
        <NavigationContainer><Login /></NavigationContainer>
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

    test("user can type username", () => {
        const { getByPlaceholderText } = renderScreen();

        const usernameInput = getByPlaceholderText("Username");
        fireEvent.changeText(usernameInput, "ava");

        expect(usernameInput.props.value).toBe("ava");
    });

    test("user can type password", () => {
        const { getByPlaceholderText } = renderScreen();

        const passwordInput = getByPlaceholderText("Password");
        fireEvent.changeText(passwordInput, "password");

        expect(passwordInput.props.value).toBe("password");
    });

    test("login button exists", () => {
        const { getByText } = renderScreen();
        expect(getByText("Sign In")).toBeTruthy();
    });

    test("shows error when fields are empty", () => {
        const { getByText } = renderScreen();

        fireEvent.press(getByText("Sign In"));

        expect(Alert.alert).toHaveBeenCalledWith("Please enter username and password");
    });

    test("login button can be pressed when fields filled", () => {
        const { getByPlaceholderText, getByText } = renderScreen();

        fireEvent.changeText(getByPlaceholderText("Username"), "ava");
        fireEvent.changeText(getByPlaceholderText("Password"), "password");

        fireEvent.press(getByText("Sign In"));

        expect(Alert.alert).not.toHaveBeenCalled();
    });
});