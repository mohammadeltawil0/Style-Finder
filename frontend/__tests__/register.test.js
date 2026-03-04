//jest.mock("expo-router");

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Register from "../app/auth/register.jsx"; 
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

jest.spyOn(Alert, "alert");

describe("Register Screen", () => {

  it("renders all input fields", () => {
    const { getByPlaceholderText } = render(<NavigationContainer><Register /></NavigationContainer>);

    expect(getByPlaceholderText("First Name")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("shows error if passwords do not match", () => {
    const { getByPlaceholderText, getByText } = render(<NavigationContainer><Register /></NavigationContainer>);

    fireEvent.changeText(getByPlaceholderText("Password"), "1234");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "5678");

    fireEvent.press(getByText("Sign Up"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Passwords do not match"
    );
  });

  it("shows confirmation alert when valid", () => {
    const { getByPlaceholderText, getByText } = render(<NavigationContainer><Register /></NavigationContainer>);

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

});