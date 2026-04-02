import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Register from "../app/auth/register";
import { NavigationContainer } from "@react-navigation/native";

//mock API
import { apiClient } from "../scripts/apiClient";
jest.mock("../scripts/apiClient");

//mock router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

//mock useTheme--fixed crash
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useTheme: () => ({
    colors: {
      text: "#000",
      card: "#ccc",
    },
  }),
}));

//mock alert
import { Alert } from "react-native";
jest.spyOn(Alert, "alert");

const renderWithProviders = (ui) => {
  return render(
    <NavigationContainer>
      {ui}
    </NavigationContainer>
  );
};

describe("Register Screen - Unit Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("successful registration", async () => {
    apiClient.post.mockResolvedValue({
      data: { message: "success" },
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/users/register",
        expect.objectContaining({
          firstName: "Stella",
          email: "test@test.com",
          username: "stella123",
          password: "password",
        })
      );
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Success",
      "Account Created Successfully!"
    );
  });

  test("shows error if fields are missing", () => {
    const { getByText } = renderWithProviders(<Register />);

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      expect.stringContaining("All fields are required")
    );
  });

  test("shows error for invalid email", () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "invalid-email");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password");

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Please enter a valid email address"
    );
  });

  test("shows error if passwords do not match", () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password1");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password2");

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Passwords do not match"
    );
  });

  test("shows backend error (username exists)", async () => {
    apiClient.post.mockRejectedValue({
      response: {
        data: { message: "Username exists" },
      },
    });

    const { getByPlaceholderText, getByText } = renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Sign Up Failed: Username exists"
      );
    });
  });
});