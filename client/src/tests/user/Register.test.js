import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import store from "../../store/Store";
import Register from "../../comps/Register";
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
            textError: "red",
        },
    }),
}));

// Mock navigate
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

beforeAll(() => {
    // Mock console.warn to suppress warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    // Mock window.alert to prevent actual alerts during tests
    jest.spyOn(window, 'alert').mockImplementation(() => { });
});

beforeEach(() => {
    // Simulate register APIs
    axios.post.mockImplementation(async (url, data) => {
        if (url.includes("addUser")) {
            const user = mockUsers.find(u => u.Email === data.Email);
            if (user) {
                return { data: { serverMsg: "User already exists!", flag: false } };
            }
            return { data: { serverMsg: "Registration Success!", flag: true } };
        }

        if (url.includes("sendOtp")) {
            return { data: { serverMsg: "OTP sent!", flag: true } };
        }

        if (url.includes("verifyOtp")) {
            if (data.OTP == 1234) {
                return { data: { serverMsg: "OTP verified!", flag: true } };
            }
            return { data: { serverMsg: "Invalid OTP", flag: false } };
        }
    });

    jest.clearAllMocks();
    localStorage.clear();

    render(
        <Provider store={store}>
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        </Provider>
    );
});

test("Renders registration form fields", () => {
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("eg@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("9xxx-xxxx")).toBeInTheDocument();
});

test("Shows validation errors on empty submit", async () => {
    const registerButton = screen.getByRole("button", { name: "Register" });

    act(() => {
        fireEvent.click(registerButton);
    });

    await waitFor(() => {
        expect(screen.getByText(/Email Required/i)).toBeInTheDocument();
        expect(screen.getByText(/Phone number required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password Required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password Confirmation Required/i)).toBeInTheDocument();
    });
});

test("Successful OTP flow opens modal", async () => {
    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const phoneInput = screen.getByPlaceholderText("9xxx-xxxx");
    const registerButton = screen.getByRole("button", { name: "Register" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "exists@example.com" } });
        fireEvent.change(phoneInput, { target: { value: "91234567" } });

        // password
        fireEvent.change(screen.getAllByPlaceholderText("*******")[0], {
            target: { value: "P@ssword123" }
        });

        // confirm password
        fireEvent.change(screen.getAllByPlaceholderText("*******")[1], {
            target: { value: "P@ssword123" }
        });

        fireEvent.click(registerButton);
    });

    await waitFor(() => {
        // OTP modal should open
        expect(screen.getAllByText(/otp/i)[0]).toBeInTheDocument();
    });
});

test("Registration success triggers toast and navigation", async () => {
    const emailInput = screen.getByPlaceholderText("eg@email.com");
    const phoneInput = screen.getByPlaceholderText("9xxx-xxxx");
    const registerButton = screen.getByRole("button", { name: "Register" });

    act(() => {
        fireEvent.change(emailInput, { target: { value: "new@example.com" } });
        fireEvent.change(phoneInput, { target: { value: "91234567" } });

        fireEvent.change(screen.getAllByPlaceholderText("*******")[0], {
            target: { value: "P@ssword123" }
        });

        fireEvent.change(screen.getAllByPlaceholderText("*******")[1], {
            target: { value: "P@ssword123" }
        });

        fireEvent.click(registerButton);
    });

    // wait for OTP modal
    await waitFor(() => {
        expect(screen.getAllByText(/otp/i)[0]).toBeInTheDocument();
    });

    // simulate OTP verification
    act(() => {
        fireEvent.change(screen.getByPlaceholderText(/Enter OTP/), {
            target: { value: "1234" }
        });

        fireEvent.click(screen.getByText(/Confirm OTP/));
    });

    await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Registration Success!");
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
});