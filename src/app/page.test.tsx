import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "./page";

describe("Home (Landing Page)", () => {
  beforeEach(() => {
    render(<Home />);
  });

  it("renders the main heading with Intellica text", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/intellica/i);
  });

  it("renders the main subheading text", () => {
    const subheading = screen.getByText(/where knowledge meets innovation/i);
    expect(subheading).toBeInTheDocument();
  });

  it("renders call-to-action buttons", () => {
    const exploreButton = screen.getByRole("link", {
      name: /explore courses/i,
    });
    const trialButton = screen.getByRole("link", { name: /start free trial/i });

    expect(exploreButton).toBeInTheDocument();
    expect(exploreButton).toHaveAttribute("href", "/courses");
    expect(trialButton).toBeInTheDocument();
    expect(trialButton).toHaveAttribute("href", "/trial");
  });

  it("renders all three feature cards", () => {
    const features = [
      "Expert-Led Courses",
      "Interactive Learning",
      "Certified Growth",
    ];

    features.forEach((feature) => {
      const featureHeading = screen.getByRole("heading", { name: feature });
      expect(featureHeading).toBeInTheDocument();
    });
  });

  it("renders footer with copyright and links", () => {
    const copyright = screen.getByText(/© 2024 intellica/i);
    const links = ["Privacy", "Terms", "Contact"];

    expect(copyright).toBeInTheDocument();
    links.forEach((link) => {
      const footerLink = screen.getByRole("link", { name: link });
      expect(footerLink).toBeInTheDocument();
      expect(footerLink).toHaveAttribute("href", `/${link.toLowerCase()}`);
    });
  });
});
