import { createFileRoute } from "@tanstack/react-router";
import { PollAdmin } from "@/components/poll-admin";

export const Route = createFileRoute("/admin/polls")({
  head: () => ({
    meta: [{ title: "Poll Management — CodeShift" }, { name: "robots", content: "noindex" }],
  }),
  component: PollAdmin,
});
