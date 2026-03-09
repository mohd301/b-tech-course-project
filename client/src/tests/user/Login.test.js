import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import store from "../../store/Store";
import Login from "../../comps/Login";
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

// Fake user data for testing
const mockUsers = [
    { Email: "test1@example.com", Password: "123456" },
    { Email: "test2@example.com", Password: "abcdef" },
];

// Fake JWT token
const fakeToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + // header
    "eyJ1c2VyIjoidGVzdDEiLCJ0eXBlIjoiYWRtaW4ifQ." + // payload
    "signature"; // fake signature

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
            return { data: { serverMsg: "User not found !", flag: false } };
        }
        if (user.Password !== userData.Password) {
            return { data: { serverMsg: "Incorrect Password!", flag: false } };
        }
        // Successful login
        return { data: { serverMsg: "Welcome", flag: true, token: fakeToken } };
    });
    // Render Login component
    render(
        <Provider store={store}>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </Provider>
    );
    // Clear Redux store before each test
    act(() => {
        store.dispatch({ type: 'sliceAuth/logout' });
    });
    // Clear mocks before each test
    axios.post.mockClear();
    mockNavigate.mockClear();

    // Clear toast mocks
    mockToastSuccess.mockClear();
    mockToastError.mockClear();

    // Clear localStorage before tests
    localStorage.clear();
});

test("Login success sets token and navigates", async () => {

    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const passwordInput = screen.getByPlaceholderText("*******");
    const loginButton = screen.getByRole("button", { name: "Login" });

    // Simulate user input
    act(() => {
        fireEvent.change(emailInput, { target: { value: "test1@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "123456" } });
        fireEvent.click(loginButton);
    });

    // Wait for updates
    await waitFor(() => {
        // Check localStorage token
        expect(localStorage.getItem("authToken")).toBe(fakeToken);

        // Check Redux state
        const state = store.getState().auth;
        expect(state.token).toBe(fakeToken);
        // Check navigation
        expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });

        // Check toast success
        expect(mockToastSuccess).toHaveBeenCalledWith("Welcome");
    });
});

test("Wrong email gives user not found", async () => {

    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const passwordInput = screen.getByPlaceholderText("*******");
    const loginButton = screen.getByRole("button", { name: "Login" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "wrong1@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "123456" } });
        fireEvent.click(loginButton);
    });

    await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("User not found !");
    });
});

test("Wrong password gives incorrect password message", async () => {

    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const passwordInput = screen.getByPlaceholderText("*******");
    const loginButton = screen.getByRole("button", { name: "Login" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "test1@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "WrongPas" } });
        fireEvent.click(loginButton);
    });

    await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Incorrect Password!");
    });
});