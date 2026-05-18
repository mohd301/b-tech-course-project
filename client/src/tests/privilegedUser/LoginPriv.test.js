import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { privLoginThunk } from "../../slices/SliceAuth.js";
import store from "../../store/Store";
import LoginPriv from "../../compsPriv/LoginPriv";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("react-toastify", () => ({
    toast: {
        success: (...args) => mockToastSuccess(...args),
        error: (...args) => mockToastError(...args),
    },
}));

// Mock ThemeContext
jest.mock("../../compsMisc/ThemeContext", () => ({
    useTheme: () => ({
        theme: {
            primaryBackground: "#fff",
            tertiaryColor: "#fff",
            textColorAlt: "#000",
            primaryColor: "#000",
        },
    }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

// Mock helpers
jest.mock("../../functions/checkAuth", () => ({
    checkAuth: jest.fn(),
}));

// override return value per test
const mockGetUserType = jest.fn();
jest.mock("../../functions/getUserType", () => ({
    getUserType: () => mockGetUserType(),
}));

// Fake JWT token
const fakeToken = "header.payload.signature";

// Fake user data for testing
const mockUsers = [
    { Email: "test1@example.com", Password: "123456" },
    { Email: "test2@example.com", Password: "abcdef" },
];


beforeAll(() => {
    // Mock console.warn to suppress warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    // Mock window.alert to prevent actual alerts during tests
    jest.spyOn(window, 'alert').mockImplementation(() => { });
});

beforeEach(() => {
    // Simulate login API
    axios.post.mockImplementation(async (url, userData) => {
        const user = mockUsers.find(u => u.Email === userData.Email);
        if (!user) {
            return { data: { serverMsg: "Privileged user not found!", flag: false } };
        }
        if (user.Password !== userData.Password) {
            return { data: { serverMsg: "Incorrect Password!", flag: false } };
        }
        // Successful login
        return { data: { serverMsg: "Welcome", flag: true, token: fakeToken } };
    });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <LoginPriv />
            </MemoryRouter>
        </Provider>
    );

    act(() => {
        store.dispatch({ type: "sliceAuth/logout" });
    });

    axios.post.mockClear();
    mockNavigate.mockClear();
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    localStorage.clear();
});

test("Renders Privileged login form fields", () => {
    expect(screen.getByRole("heading", { name: "Admin / Regulator Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("eg@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("*******")).toBeInTheDocument();
    const loginButton = screen.getByRole("button", { name: "Login" });
});

test("Admin login success navigates to admin home page", async () => {
    mockGetUserType.mockReturnValue("Admin");

    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const passwordInput = screen.getByPlaceholderText("*******");
    const loginButton = screen.getByRole("button", { name: "Login" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "test1@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "123456" } });
        fireEvent.click(loginButton);
    });

    await waitFor(() => {
        expect(localStorage.getItem("authToken")).toBe(fakeToken);
        expect(mockToastSuccess).toHaveBeenCalledWith("Welcome");
        expect(mockNavigate).toHaveBeenCalledWith("/homeAdmin", { replace: true });
    });
});

test("Regulator login success navigates to regulator home page", async () => {
    mockGetUserType.mockReturnValue("Regulator");

    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const passwordInput = screen.getByPlaceholderText("*******");
    const loginButton = screen.getByRole("button", { name: "Login" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "test2@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "abcdef" } });
        fireEvent.click(loginButton);
    });

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/homeReg", { replace: true });
    });
});

test("User not found shows error toast", async () => {

    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const passwordInput = screen.getByPlaceholderText("*******");
    const loginButton = screen.getByRole("button", { name: "Login" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "wrong@test.com" } });
        fireEvent.change(passwordInput, { target: { value: "123456" } });
        fireEvent.click(loginButton);
    });

    await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Privileged user not found!");
    });
});

test("Incorrect password shows error toast", async () => {

    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const passwordInput = screen.getByPlaceholderText("*******");
    const loginButton = screen.getByRole("button", { name: "Login" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "test1@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
        fireEvent.click(loginButton);
    });

    await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Incorrect Password!");
    });
});