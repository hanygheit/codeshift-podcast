import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EpisodePoll } from "@/components/episode-poll";
import { EP004_ARCHITECTURE_POLL as POLL } from "@/content/episode-polls";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

const WATCH = "https://youtube.com/live/GnvFox330Sg";
const pollRecord = { slug: POLL.slug, status: "open" };
const counts = [
  { optionId: "a", count: 1 },
  { optionId: "b", count: 2 },
  { optionId: "d", count: 5 },
];
const ok = (data: unknown) => Promise.resolve({ data, error: null });
const fail = (message: string) => Promise.resolve({ data: null, error: { message } });

beforeEach(() => {
  rpc.mockReset();
  window.localStorage.clear();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
});
afterEach(() => vi.unstubAllGlobals());

async function renderReady() {
  render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
  const vote = screen.getByRole("button", { name: /Cast Your Vote|Loading poll/ });
  await waitFor(() => expect(vote).toHaveTextContent("Cast Your Vote"));
  return vote;
}

describe("EpisodePoll", () => {
  it("shows the scenario and choices without results, then reveals real results after voting", async () => {
    rpc.mockImplementationOnce(() => ok({ poll: pollRecord }));
    const vote = await renderReady();

    expect(
      screen.getByRole("heading", { name: /You’re the Architect\. What Would YOU Build\?/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1,000 users, but we might reach 1 million/)).toBeInTheDocument();
    expect(screen.getByText(/less than 30 seconds/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Watch EP004: Inside Software Architecture/ }),
    ).toHaveAttribute("href", WATCH);
    expect(vote).toBeDisabled();
    expect(screen.queryByText("Community results")).not.toBeInTheDocument();
    expect(screen.queryByText(POLL.insight.takeaway)).not.toBeInTheDocument();

    const [, firstArgs] = rpc.mock.calls[0] as [string, { p_slug: string; p_voter: string }];
    expect(rpc.mock.calls[0]?.[0]).toBe("get_open_poll");
    expect(firstArgs.p_slug).toBe(POLL.slug);
    expect(firstArgs.p_voter).toMatch(/^[A-Za-z0-9-]{16,100}$/);

    expect(screen.getAllByRole("radio")).toHaveLength(4);
    fireEvent.click(screen.getByRole("radio", { name: /D\. Ask more questions/ }));
    expect(vote).toBeEnabled();

    rpc.mockImplementationOnce(() => ok({ poll: pollRecord, counts, myVote: "d", voted: true }));
    fireEvent.click(vote);

    const list = await screen.findByRole("list", { name: "Community results" });
    expect(rpc).toHaveBeenLastCalledWith("cast_open_poll_vote", {
      p_slug: POLL.slug,
      p_option: "d",
      p_voter: firstArgs.p_voter,
    });
    expect(screen.getByText("8 votes")).toBeInTheDocument();
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[3]).toHaveTextContent("63%");
    expect(items[3]).toHaveTextContent("Your choice");
    expect(items[2]).toHaveTextContent("0%");
    expect(items[0]).not.toHaveTextContent("Your choice");
    expect(screen.getByText("You chose")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "That’s the architect’s mindset." }),
    ).toBeInTheDocument();
    expect(screen.getByText("How the community answered")).toBeInTheDocument();
    expect(screen.getByText(POLL.insight.takeaway)).toBeInTheDocument();
    expect(screen.getByText(POLL.closing)).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("goes straight to results for a browser that already voted", async () => {
    rpc.mockImplementationOnce(() => ok({ poll: pollRecord, counts, myVote: "b" }));
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    const list = await screen.findByRole("list", { name: "Community results" });
    expect(within(list).getAllByRole("listitem")[1]).toHaveTextContent("Your choice");
    expect(screen.getByText("You chose")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A strong, pragmatic starting point." }),
    ).toBeInTheDocument();
  });

  it("before the poll database exists, an answer reveals the insight only", async () => {
    rpc.mockImplementationOnce(() =>
      Promise.resolve({
        data: null,
        error: {
          code: "PGRST202",
          message: "Could not find the function public.get_open_poll(p_slug, p_voter)",
        },
      }),
    );
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    const reveal = await screen.findByRole("button", { name: /Reveal the Insight/ });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText(/Community voting opens soon/)).toBeInTheDocument();
    expect(reveal).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: /C\. Build on Kubernetes/ }));
    fireEvent.click(reveal);

    expect(
      await screen.findByRole("heading", {
        name: "Powerful — but it solves a problem you don’t have yet.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("You chose")).toBeInTheDocument();
    expect(screen.getByText(/C\. Build on Kubernetes from day one\./)).toBeInTheDocument();
    expect(screen.getByText(/this answer wasn’t counted/)).toBeInTheDocument();
    expect(screen.getByText(POLL.insight.takeaway)).toBeInTheDocument();
    expect(screen.getByText(POLL.closing)).toBeInTheDocument();
    expect(screen.queryByText("Community results")).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("reports an unavailable backend instead of showing made-up results", async () => {
    rpc.mockImplementationOnce(() => fail("upstream request timeout"));
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/temporarily unavailable/);
    expect(screen.queryByText("Community results")).not.toBeInTheDocument();

    rpc.mockImplementationOnce(() => ok({ poll: pollRecord }));
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("keeps the selection and explains a rate-limited vote", async () => {
    rpc.mockImplementationOnce(() => ok({ poll: pollRecord }));
    const vote = await renderReady();
    fireEvent.click(screen.getByRole("radio", { name: /B\. Start with a Modular Monolith/ }));
    rpc.mockImplementationOnce(() => fail("poll_network_rate_limited"));
    fireEvent.click(vote);
    expect(
      await screen.findByText(/Too many votes have come from your network/),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /B\. Start with a Modular Monolith/ })).toBeChecked();
  });

  it("switches to the closed state when the poll closes before the vote lands", async () => {
    rpc.mockImplementationOnce(() => ok({ poll: pollRecord }));
    const vote = await renderReady();
    fireEvent.click(screen.getByRole("radio", { name: /C\. Build on Kubernetes/ }));
    rpc.mockImplementationOnce(() => fail("poll_not_open"));
    fireEvent.click(vote);
    expect(await screen.findByText("This poll is closed.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cast Your Vote/ })).toBeDisabled();
  });

  it("copies the direct poll link when native sharing is not used", async () => {
    rpc.mockImplementationOnce(() => ok({ poll: pollRecord }));
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    fireEvent.click(screen.getByRole("button", { name: /Share This Challenge/ }));
    expect(await screen.findByText("Link copied!")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(
      "https://codeshift-podcast.lovable.app/episodes/ep004#architecture-poll",
    );
  });
});
