import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Register from "../app/auth/register";
import { NavigationContainer } from "@react-navigation/native";

// ------------------ MOCKS ------------------

// API
jest.mock("../scripts/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { apiClient } from "../scripts/apiClient";

// router
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// AsyncStorage
const AsyncStorage = require("@react-native-async-storage/async-storage");

// Toast
jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

import Toast from "react-native-toast-message";

// theme
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useTheme: () => ({
    colors: {
      text: "#000",
      card: "#ccc",
      lightText: "#aaa",
    },
  }),
}));

// ------------------ RENDER ------------------

const renderWithProviders = (ui) =>
  render(
    <NavigationContainer>
      {ui}
    </NavigationContainer>
  );

// ------------------ TESTS ------------------

describe("Register Screen (JWT)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  //main jwt test
  test("successful registration stores token and user data, then navigates", async () => {
    apiClient.get.mockResolvedValueOnce({}); // username available

    apiClient.post.mockResolvedValue({
      data: {
        token: "new-user-token",
        userId: 1,
        username: "stella123",
        profileImageUrl: "",
      },
    });

    const { getByPlaceholderText, getByText } =
      renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password1@");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password1@");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });

    //token stoarge
    expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
      expect.arrayContaining([
        ["token", "new-user-token"],
        ["userId", "1"],
        ["username", "stella123"],
        ["profileImageUrl", ""],
      ])
    );

    //nav
    expect(mockReplace).toHaveBeenCalledWith({
    pathname: "/screens/survey/preferences1",
    params: { isNewUser: "true" },
  });

    //success toast
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
      })
    );
  });

  //error cases (unchanged but updated to Toast)

  test("shows error if fields are missing", () => {
    const { getByText } = renderWithProviders(<Register />);

    fireEvent.press(getByText("Sign Up"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Missing Fields",
      })
    );
  });

  test("shows error for invalid email", () => {
    const { getByPlaceholderText, getByText } =
      renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "invalid");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password1@");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password1@");

    fireEvent.press(getByText("Sign Up"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Invalid Email",
      })
    );
  });

  test("shows error if passwords do not match", () => {
    const { getByPlaceholderText, getByText } =
      renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "stella123");
    fireEvent.changeText(getByPlaceholderText("Password"), "password1@");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "wrong");

    fireEvent.press(getByText("Sign Up"));

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        text1: "Password Mismatch",
      })
    );
  });

  test("shows error if username is taken", async () => {
    apiClient.get.mockRejectedValueOnce({
      response: { status: 409 },
    });

    const { getByPlaceholderText, getByText } =
      renderWithProviders(<Register />);

    fireEvent.changeText(getByPlaceholderText("First Name"), "Stella");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Username"), "takenUser");
    fireEvent.changeText(getByPlaceholderText("Password"), "password1@");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "password1@");

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