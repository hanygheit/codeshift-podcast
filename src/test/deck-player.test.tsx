import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { EP003 } from "@/content/ep003";
import { DeckPlayer } from "@/components/deck/deck-player";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));
vi.mock("@/components/deck/download-pdf", () => ({
  DownloadPdfButton: () => <button>Download PDF</button>,
}));

describe("shared presentation interactions", () => {
  beforeEach(() => navigate.mockClear());
  afterEach(() => vi.restoreAllMocks());

  const expectSlide = (slide: string) =>
    expect(navigate).toHaveBeenLastCalledWith({
      to: "/episodes/$slug/slides",
      params: { slug: "ep003" },
      search: { slide },
      resetScroll: false,
    });

  it("bounds buttons and synchronizes slide count and progress with the URL", () => {
    const view = render(<DeckPlayer ep={EP003} />);
    const stage = view.container.querySelector(".presentation-stage")!;
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expectSlide("journey");
    stage.scrollTop = 300;
    view.rerender(<DeckPlayer ep={EP003} slideId="references" />);
    expect(stage.scrollTop).toBe(0);
    expect(screen.getByText("Slide 16 / 16")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("16");
    expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "6" } });
    expectSlide("engineering-layers");
  });

  it("supports keyboard navigation without hijacking inputs or clickable content", () => {
    render(<DeckPlayer ep={EP003} slideId="journey" />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expectSlide("effectiveness");
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expectSlide("cover");
    fireEvent.keyDown(window, { key: "End" });
    expectSlide("references");
    fireEvent.keyDown(window, { key: "Home" });
    expectSlide("cover");
    navigate.mockClear();
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByRole("button", { name: "Next slide" }), { key: " " });
    fireEvent.keyDown(window, { key: "ArrowRight", repeat: true });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("searches contents, navigates to the right slide, and closes on Escape from search", () => {
    render(<DeckPlayer ep={EP003} />);
    fireEvent.click(screen.getByRole("button", { name: "Contents" }));
    const search = screen.getByRole("textbox", { name: "Search slide titles" });
    fireEvent.change(search, { target: { value: "Harness Engineering" } });
    fireEvent.keyDown(search, { key: "ArrowRight" });
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /06.*Prompt \+ Context \+ Harness/ }));
    expectSlide("engineering-layers");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Contents" }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports native fullscreen and restores the controls on exit", async () => {
    render(<DeckPlayer ep={EP003} />);
    const root = document.querySelector(".presentation-shell")!;
    const request = vi.fn(async () => {
      Object.defineProperty(document, "fullscreenElement", { configurable: true, value: root });
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    const exit = vi.fn(async () => {
      Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null });
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    Object.defineProperty(root, "requestFullscreen", { configurable: true, value: request });
    Object.defineProperty(document, "exitFullscreen", { configurable: true, value: exit });
    fireEvent.click(screen.getByRole("button", { name: "Fullscreen" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Exit fullscreen" })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Exit fullscreen" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Fullscreen" })).toBeInTheDocument(),
    );
    expect(request).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledOnce();
  });

  it("falls back to immersive mode if native fullscreen is denied", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<DeckPlayer ep={EP003} />);
    const root = document.querySelector(".presentation-shell")!;
    Object.defineProperty(root, "requestFullscreen", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("Fullscreen denied")),
    });
    fireEvent.click(screen.getByRole("button", { name: "Fullscreen" }));
    await waitFor(() => expect(document.body.style.overflow).toBe("hidden"));
    expect(root).toHaveClass("presentation-immersive");
    expect(warning).toHaveBeenCalledOnce();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(root).not.toHaveClass("presentation-immersive");
    expect(document.body.style.overflow).toBe("");
  });
});
