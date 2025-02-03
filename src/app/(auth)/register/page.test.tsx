import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "./page";
import "@testing-library/jest-dom";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    className?: string;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock use-toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  it("renders register form with all elements", () => {
    render(<RegisterPage />);

    // Check for main headings and text
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(
      screen.getByText("Register to a new Intellica account")
    ).toBeInTheDocument();

    // Check for form inputs
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    // Check for placeholders
    expect(screen.getByPlaceholderText("Celso Puerto")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();

    // Check for buttons and links
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();

    // Check for terms and privacy links
    expect(
      screen.getByRole("link", { name: "Terms of Service" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" })
    ).toBeInTheDocument();
  });

  it("has required attributes on form inputs", () => {
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(nameInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
    expect(nameInput).toHaveAttribute("type", "text");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("toggles password visibility", () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("has correct navigation links", () => {
    render(<RegisterPage />);

    const loginLink = screen.getByRole("link", { name: "Login" });
    const termsLink = screen.getByRole("link", { name: "Terms of Service" });
    const privacyLink = screen.getByRole("link", { name: "Privacy Policy" });

    expect(loginLink).toHaveAttribute("href", "/login");
    expect(termsLink).toHaveAttribute("href", "#");
    expect(privacyLink).toHaveAttribute("href", "#");
  });

  it("shows loading state during form submission", async () => {
    render(<RegisterPage />);

    const registerButton = screen.getByRole("button", { name: "Register" });
    const form = screen.getByRole("form");

    // Mock form submission
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    fireEvent.submit(form);

    expect(registerButton).toHaveTextContent("Registering...");
    expect(registerButton).toBeDisabled();
  });

  it("handles form submission with correct data", async () => {
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const form = screen.getByRole("form");

    // Fill in form
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Mock successful registration
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Registration successful" }),
      })
    );

    // Submit form
    fireEvent.submit(form);

    // Check if fetch was called with correct data
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });
  });
});
