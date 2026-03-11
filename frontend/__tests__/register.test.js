import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Alert } from "react-native";
import Register from "../app/auth/register.jsx";

// Mock expo-router (since your component uses useRouter)
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe("Register Screen", () => {

  const renderScreen = () =>
    render(
      <NavigationContainer>
        <Register />
      </NavigationContainer>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all input fields", () => {
    const { getByPlaceholderText } = renderScreen();

    expect(getByPlaceholderText("First Name")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("shows error if passwords do not match", () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("Password"), "1234");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "5678");

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Passwords do not match"
    );
  });

  it("shows confirmation alert when valid", () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("First Name"), "Ava");
    fireEvent.changeText(getByPlaceholderText("Email"), "ava@gmail.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "ava123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password");

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Confirm Sign Up",
      expect.any(String),
      expect.any(Array)
    );
  });

  it("clears fields after confirming signup", async () => {
    // Auto-trigger Confirm button inside Alert
    jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
      const confirmButton = buttons?.find(b => b.text === "Confirm");
      confirmButton?.onPress?.();
    });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText("First Name"), "Ava");
    fireEvent.changeText(getByPlaceholderText("Email"), "ava@gmail.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "ava123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(getByPlaceholderText("First Name").props.value).toBe("");
      expect(getByPlaceholderText("Email").props.value).toBe("");
      expect(getByPlaceholderText("Username").props.value).toBe("");
      expect(getByPlaceholderText("Password").props.value).toBe("");
      expect(getByPlaceholderText("Confirm Password").props.value).toBe("");
    });
  });

});