import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Register from "../app/auth/register"; // adjust path
import { Alert } from "react-native";

// Mock router
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock theme
jest.mock("@react-navigation/native", () => ({
  useTheme: () => ({
    colors: { text: "#000", card: "#ccc" },
  }),
}));

// Mock API
jest.mock("../scripts/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { apiClient } from "../scripts/apiClient";

describe("Register Screen Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
  });

  test("shows error if fields are empty", () => {
    const { getByText } = render(<Register />);

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      expect.stringContaining("All fields are required")
    );
  });

  test("invalid email shows error", () => {
    const { getByPlaceholderText, getByText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Tella");
    fireEvent.changeText(getByPlaceholderText("Email"), "bad-email");
    fireEvent.changeText(getByPlaceholderText("Username"), "tella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password");

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Please enter a valid email address"
    );
  });

  test("password mismatch shows error", () => {
    const { getByPlaceholderText, getByText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Ella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "pass1");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "pass2");

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Passwords do not match"
    );
  });

  test("successful signup calls API and navigates", async () => {
    apiClient.post.mockResolvedValue({
      data: { message: "success" },
    });

    const { getByPlaceholderText, getByText } = render(<Register />);

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

      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Account Created Successfully!"
      );

      expect(mockReplace).toHaveBeenCalledWith("/auth/logIn");
    });
  });

  test("API failure shows error alert", async () => {
    apiClient.post.mockRejectedValue({
      response: { data: { message: "Username exists" } },
    });

    const { getByPlaceholderText, getByText } = render(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        expect.stringContaining("Sign Up Failed")
      );
    });
  });
});