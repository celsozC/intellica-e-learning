import { render, screen } from "@testing-library/react";
import LoginPage from "./page";
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

describe("LoginPage", () => {
  it("renders login form with all elements", () => {
    render(<LoginPage />);

    // Check for main headings and text
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(
      screen.getByText("Login to your Intellica account")
    ).toBeInTheDocument();

    // Check for form inputs
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();

    // Check for buttons and links
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();

    // Check for terms and privacy links
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("has required attributes on form inputs", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("has correct navigation links", () => {
    render(<LoginPage />);

    const registerLink = screen.getByText("Register");
    const forgotPasswordLink = screen.getByText("Forgot your password?");
    const termsLink = screen.getByText("Terms of Service");
    const privacyLink = screen.getByText("Privacy Policy");

    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
    expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", "#");
    expect(termsLink.closest("a")).toHaveAttribute("href", "#");
    expect(privacyLink.closest("a")).toHaveAttribute("href", "#");
  });
});
