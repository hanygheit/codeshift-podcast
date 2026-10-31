import { createFileRoute } from "@tanstack/react-router";
import { PollView } from "@/components/poll-view";

export const Route = createFileRoute("/poll")({
  head: () => ({
    meta: [
      { title: "Live Audience Poll — CodeShift" },
      { name: "description", content: "Join the live CodeShift audience poll." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <PollView />,
});
