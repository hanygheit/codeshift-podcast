import { createFileRoute } from "@tanstack/react-router";
import { PollView } from "@/components/poll-view";

export const Route = createFileRoute("/polls/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `CodeShift Poll — ${params.slug}` }, { name: "robots", content: "noindex" }],
  }),
  component: function PollBySlug() {
    const { slug } = Route.useParams();
    return <PollView slug={slug} />;
  },
});
