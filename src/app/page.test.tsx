import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "./page";

describe("Home (Landing Page)", () => {
  beforeEach(() => {
    render(<Home />);
  });

  it("renders the main heading with Intellica text", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    const brandName = heading.textContent?.replace(/\s+/g, "");
    expect(brandName).toBe("Intellica");
  });

  it("renders the main subheading text", () => {
    const subheading = screen.getByText(
      /where knowledge meets innovation\. transform your learning journey with our cutting-edge platform\./i
    );
    expect(subheading).toBeInTheDocument();
  });

  it("renders call-to-action buttons", () => {
    const exploreButton = screen.getByRole("link", {
      name: /explore courses/i,
    });
    const trialButton = screen.getByRole("link", {
      name: /start free trial/i,
    });

    expect(exploreButton).toBeInTheDocument();
    expect(exploreButton).toHaveAttribute("href", "/courses");
    expect(trialButton).toBeInTheDocument();
    expect(trialButton).toHaveAttribute("href", "/trial");
  });

  it("renders all feature cards with correct content", () => {
    const features = [
      {
        title: "Expert-Led Courses",
        description: "Learn from industry leaders and innovators.",
      },
      {
        title: "Interactive Learning",
        description: "Engage with real-world projects and challenges.",
      },
      {
        title: "Certified Growth",
        description: "Earn credentials that matter in the industry.",
      },
    ];

    features.forEach(({ title, description }) => {
      const featureTitle = screen.getByRole("heading", { name: title });
      const featureDesc = screen.getByText(description);

      expect(featureTitle).toBeInTheDocument();
      expect(featureDesc).toBeInTheDocument();
    });
  });

  it("renders footer with copyright and navigation links", () => {
    const copyright = screen.getByText(
      /© 2024 intellica\. all rights reserved\./i
    );
    const links = ["Privacy", "Terms", "Contact"];

    expect(copyright).toBeInTheDocument();

    links.forEach((link) => {
      const footerLink = screen.getByRole("link", { name: link });
      expect(footerLink).toBeInTheDocument();
      expect(footerLink).toHaveAttribute("href", `/${link.toLowerCase()}`);
    });
  });

  it("renders the dynamic pattern background", () => {
    const pattern = screen.getByTestId("hero-pattern");
    expect(pattern).toBeInTheDocument();
    expect(pattern).toHaveClass(
      "absolute",
      "inset-0",
      "bg-[radial-gradient(circle_500px_at_50%_200px,#ffffff,transparent)]",
      "dark:bg-[radial-gradient(circle_500px_at_50%_200px,#1a1a1a,transparent)]"
    );
  });
});
