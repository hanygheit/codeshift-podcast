import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EpisodePoll } from "@/components/episode-poll";
import { EP004_ARCHITECTURE_POLL as POLL } from "@/content/episode-polls";

const WATCH = "https://youtube.com/live/GnvFox330Sg";
const pollRecord = { slug: POLL.slug, status: "open" };
const hostResults = {
  total: 8,
  results: [
    { optionId: "a", count: 1, percent: 13 },
    { optionId: "b", count: 2, percent: 25 },
    { optionId: "c", count: 0, percent: 0 },
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
  it("after voting shows the choice, the best answer and an insight for every option — no results", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
    const vote = await renderReady();

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`/api/polls?episodePoll=${POLL.slug}`);
    expect(screen.getByText(/1,000 users, but we might reach 1 million/)).toBeInTheDocument();
    expect(screen.getByText(/less than 30 seconds/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Watch EP004: Inside Software Architecture/ }),
    ).toHaveAttribute("href", WATCH);
    expect(vote).toBeDisabled();
    expect(screen.queryByText("The best answer")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /B\. Start with a Modular Monolith/ }));
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord, myVote: "b", voted: true }));
    fireEvent.click(vote);

    expect(
      await screen.findByRole("heading", { name: "A strong, pragmatic starting point." }),
    ).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[1] ?? [];
    expect(url).toBe("/api/polls");
    expect(JSON.parse(String(init?.body))).toEqual({
      operation: "episode-vote",
      slug: POLL.slug,
      optionId: "b",
    });
    expect(screen.getByText("You chose")).toBeInTheDocument();
    expect(screen.getByText("The best answer")).toBeInTheDocument();

    const insights = within(screen.getByRole("list", { name: "Insight for each option" }));
    const items = insights.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    POLL.options.forEach((option, index) => expect(items[index]).toHaveTextContent(option.insight));
    expect(items[1]).toHaveTextContent("Your choice");
    expect(items[3]).toHaveTextContent("Best answer");
    expect(items[0]).not.toHaveTextContent(/Your choice|Best answer/);

    expect(screen.getByText(POLL.insight.takeaway)).toBeInTheDocument();
    expect(screen.getByText(POLL.closing)).toBeInTheDocument();
    expect(screen.getByText(/your vote is counted/)).toBeInTheDocument();
    expect(items[1]).toHaveTextContent("Strong next step");
    expect(items[0]).toHaveTextContent("Too early");
    expect(
      within(screen.getByRole("list", { name: "Questions to ask" })).getAllByRole("listitem"),
    ).toHaveLength(POLL.questions.items.length);
    expect(screen.getByRole("button", { name: /Challenge a Friend/ })).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Watch EP004: Inside Software Architecture/ }),
    ).toHaveLength(1);
    expect(screen.queryByRole("list", { name: "Community results" })).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("tells a visitor who chose the best answer that they did", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord, myVote: "d" }));
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    expect(await screen.findByText("You picked the best answer")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "That’s the architect’s mindset." }),
    ).toBeInTheDocument();
  });

  it("shows community results only to a host with the correct PIN", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
    await renderReady();
    fireEvent.click(screen.getByRole("button", { name: "Host results" }));
    const pin = screen.getByLabelText("Host PIN");

    fireEvent.change(pin, { target: { value: "0000" } });
    fetchMock.mockImplementationOnce(() => reply({ error: "That PIN is not correct." }, 401));
    fireEvent.click(screen.getByRole("button", { name: /Show results/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That PIN is not correct.");
    expect(screen.queryByRole("list", { name: "Community results" })).not.toBeInTheDocument();

    fireEvent.change(pin, { target: { value: "1405" } });
    fetchMock.mockImplementationOnce(() => reply(hostResults));
    fireEvent.click(screen.getByRole("button", { name: /Show results/ }));
    const list = await screen.findByRole("list", { name: "Community results" });
    expect(JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body))).toEqual({
      operation: "episode-results",
      slug: POLL.slug,
      pin: "1405",
    });
    expect(screen.getByText("8 votes")).toBeInTheDocument();
    const rows = within(list).getAllByRole("listitem");
    expect(rows[3]).toHaveTextContent("63%");
    expect(rows[2]).toHaveTextContent("0%");
  });

  it("without a vote store, an answer still reveals the feedback and insights", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord, notReady: true }));
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    const reveal = await screen.findByRole("button", { name: /Reveal the Insight/ });
    fireEvent.click(screen.getByRole("radio", { name: /C\. Build on Kubernetes/ }));
    fireEvent.click(reveal);
    expect(
      await screen.findByRole("heading", {
        name: "Powerful — but it solves a problem you don’t have yet.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("The best answer")).toBeInTheDocument();
    expect(screen.getByText(/this answer wasn’t counted/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports an unavailable server and lets the visitor retry", async () => {
    fetchMock.mockImplementationOnce(() => reply({ error: "down" }, 503));
    render(<EpisodePoll poll={POLL} watchUrl={WATCH} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/temporarily unavailable/);
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("keeps the selection and explains a rate-limited vote", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: pollRecord }));
    const vote = await renderReady();
    fireEvent.click(screen.getByRole("radio", { name: /B\. Start with a Modular Monolith/ }));
    fetchMock.mockImplementationOnce(() =>
      reply({ error: "Too many votes have come from your network.", code: "rate_limited" }, 429),
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
