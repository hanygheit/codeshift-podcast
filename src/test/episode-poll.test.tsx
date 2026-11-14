import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EpisodePoll } from "@/components/episode-poll";
import { EP004_ARCHITECTURE_POLL as POLL } from "@/content/episode-polls";

const WATCH = "https://youtube.com/live/GnvFox330Sg";
const pollRecord = { slug: POLL.slug, status: "open" };
const results = {
  total: 8,
  results: [
    { optionId: "a", count: 1, percent: 13 },
    { optionId: "b", count: 2, percent: 25 },
    { optionId: "d", count: 5, percent: 63 },
  ],
};
const fetchMock = vi.fn<typeof fetch>();
const reply = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
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
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
    const vote = await renderReady();

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`/api/polls?episodePoll=${POLL.slug}`);
    expect(
      screen.getByRole("heading", { name: /You’re the Architect\. What Would YOU Build\?/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1,000 users, but we might reach 1 million/)).toBeInTheDocument();
    expect(screen.getByText(/less than 30 seconds/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Watch EP004: Inside Software Architecture/ }),
    ).toHaveAttribute("href", WATCH);
    expect(vote).toBeDisabled();
    expect(screen.queryByText("How the community answered")).not.toBeInTheDocument();
    expect(screen.queryByText(POLL.insight.takeaway)).not.toBeInTheDocument();

    expect(screen.getAllByRole("radio")).toHaveLength(4);
    fireEvent.click(screen.getByRole("radio", { name: /D\. Ask more questions/ }));
    expect(vote).toBeEnabled();

    fetchMock.mockImplementationOnce(() =>
      reply({ poll: pollRecord, ...results, myVote: "d", voted: true }),
    );
    fireEvent.click(vote);

    const list = await screen.findByRole("list", { name: "Community results" });
    const [url, init] = fetchMock.mock.calls[1] ?? [];
    expect(url).toBe("/api/polls");
    expect(JSON.parse(String(init?.body))).toEqual({
      operation: "episode-vote",
      slug: POLL.slug,
      optionId: "d",
    });
    expect(screen.getByText("You chose")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "That’s the architect’s mindset." }),
    ).toBeInTheDocument();
    expect(screen.getByText("How the community answered")).toBeInTheDocument();
    expect(screen.getByText("8 votes")).toBeInTheDocument();
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[3]).toHaveTextContent("63%");
    expect(items[3]).toHaveTextContent("Your choice");
    expect(items[2]).toHaveTextContent("0%");
    expect(items[0]).not.toHaveTextContent("Your choice");
    expect(screen.getByText(POLL.insight.takeaway)).toBeInTheDocument();
    expect(screen.getByText(POLL.closing)).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("goes straight to results and feedback for a browser that already voted", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord, ...results, myVote: "b" }));
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    const list = await screen.findByRole("list", { name: "Community results" });
    expect(within(list).getAllByRole("listitem")[1]).toHaveTextContent("Your choice");
    expect(
      screen.getByRole("heading", { name: "A strong, pragmatic starting point." }),
    ).toBeInTheDocument();
  });

  it("without a vote store, an answer reveals personal feedback and the insight only", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord, notReady: true }));
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
    expect(screen.getByText(/this answer wasn’t counted/)).toBeInTheDocument();
    expect(screen.getByText(POLL.insight.takeaway)).toBeInTheDocument();
    expect(screen.queryByText("How the community answered")).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports an unavailable server instead of showing made-up results", async () => {
    fetchMock.mockImplementationOnce(() => reply({ error: "down" }, 503));
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/temporarily unavailable/);
    expect(screen.queryByText("How the community answered")).not.toBeInTheDocument();

    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("keeps the selection and explains a rate-limited vote", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
    const vote = await renderReady();
    fireEvent.click(screen.getByRole("radio", { name: /B\. Start with a Modular Monolith/ }));
    fetchMock.mockImplementationOnce(() =>
      reply(
        {
          error: "Too many votes have come from your network recently. Please try again later.",
          code: "rate_limited",
        },
        429,
      ),
    );
    fireEvent.click(vote);
    expect(
      await screen.findByText(/Too many votes have come from your network/),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /B\. Start with a Modular Monolith/ })).toBeChecked();
  });

  it("copies the direct poll link when native sharing is not used", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
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
