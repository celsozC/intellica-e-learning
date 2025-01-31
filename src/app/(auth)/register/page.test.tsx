import { render, screen } from "@testing-library/react";
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

describe("RegisterPage", () => {
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
    expect(screen.getByPlaceholderText("Celso Puerto")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();

    // Check for buttons and links
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Check for terms and privacy links
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
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

  it("has correct navigation links", () => {
    render(<RegisterPage />);

    const loginLink = screen.getByText("Login");
    const termsLink = screen.getByText("Terms of Service");
    const privacyLink = screen.getByText("Privacy Policy");

    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
    expect(termsLink.closest("a")).toHaveAttribute("href", "#");
    expect(privacyLink.closest("a")).toHaveAttribute("href", "#");
  });
});
