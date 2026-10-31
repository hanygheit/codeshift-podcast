import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PollView } from "@/components/poll-view";

export const Route = createFileRoute("/polls/$slug/results")({
  validateSearch: z.object({
    host: z.string().optional(),
  }),
  head: () => ({
    meta: [{ title: "Live Poll Results — CodeShift" }, { name: "robots", content: "noindex" }],
  }),
  component: function PollResults() {
    const { slug } = Route.useParams();
    const { host } = Route.useSearch();
    return <PollView slug={slug} hostMode={host === "true"} />;
  },
});
