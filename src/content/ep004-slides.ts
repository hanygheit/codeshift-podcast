import type { BriefPage } from "./executive-briefs";

/** Repository-hosted derivatives of the supplied EP004 architecture artwork. */
export const EP004_ART = {
  styles: "/ep004/solution-architecture.jpg",
  system: "/ep004/system-architecture.jpg",
  reference: "/ep004/reference-architecture.jpg",
};

const stage = (
  id: string,
  section: string,
  title: string,
  challenge: string,
  decision: string,
  tradeOff: string,
): BriefPage => ({
  id,
  title,
  section,
  layout: "canvas",
  entries: [
    { title: "Challenge", body: challenge },
    { title: "Decision", body: decision },
    { title: "Trade-off", body: tradeOff },
  ],
});

/**
 * EP004 pages. `canvas` pages are drawn by ep004-presentation.ts (diagrams and artwork);
 * their entries feed the diagram callouts and the mobile reading view.
 */
export const EP004_BRIEF: BriefPage[] = [
  {
    id: "journey",
    title: "Tonight: From Three Boxes to a Real System",
    section: "THE EPISODE ROADMAP",
    layout: "canvas",
    entries: [
      { title: "Why it matters", body: "Engineering is more than writing code." },
      { title: "Architecture vs. design", body: "Structure, boundaries and decisions." },
      { title: "Start with questions", body: "Requirements before technologies." },
      { title: "Design an e-commerce system", body: "Twelve stages, one evolving diagram." },
      { title: "The complete picture", body: "Reference architecture and checkout flow." },
      { title: "Trade-offs & takeaways", body: "No single correct answer." },
    ],
  },
  {
    id: "previously",
    title: "Previously on CodeShift: More Than Writing Code",
    section: "PART 1 · WHY SOFTWARE ARCHITECTURE MATTERS",
    layout: "canvas",
    takeaway: "From writing components to designing complete systems.",
    entries: [
      {
        title: "AI writes more of the implementation.",
        body: "Generating code keeps getting cheaper (EP001–EP003).",
      },
      {
        title: "Developer value moves outward.",
        body: "Judgment, verification and ownership of outcomes.",
      },
      {
        title: "Understand the whole system.",
        body: "Requirements, design, architecture and trade-offs.",
      },
    ],
  },
  {
    id: "developer-journey",
    title: "The Traditional Developer Journey",
    section: "PART 1 · WHY SOFTWARE ARCHITECTURE MATTERS",
    layout: "canvas",
    takeaway:
      "Every engineer needs the why: interfaces, constraints, failure modes and trade-offs. You don’t need the title “Architect” to think architecturally.",
    entries: [
      {
        title: "Architects & Tech Leads decide",
        body: "Requirements & constraints\nArchitecture & trade-offs\nBreak into tasks",
      },
      {
        title: "Junior developers implement",
        body: "Pick up a ticket\nBuild the endpoint or screen\nWhy is it designed this way?",
      },
    ],
  },
  {
    id: "three-boxes",
    title: "Frontend + Backend + Database — and an ERD",
    section: "PART 1 · WHAT DEVELOPERS USUALLY LEARN FIRST",
    layout: "canvas",
    takeaway: "Useful foundations — but only part of system design.",
    entries: [
      { title: "Classic 3-tier", body: "Frontend, backend API and database." },
      {
        title: "Sample e-commerce ERD",
        body: "Customer, Cart, Cart_Item, Product, Order, Order_Item and Payment with primary and foreign keys.",
      },
      {
        title: "The rest of a real system",
        body: "Load balancing, caching, CDN, queues & workers, integrations, security, observability, CI/CD.",
      },
    ],
  },
  {
    id: "architecture-vs-design",
    title: "Software Architecture vs. System Design",
    section: "PART 2 · UNDERSTANDING ARCHITECTURE",
    layout: "canvas",
    takeaway: "They overlap: architecture sets the frame; system design makes it work.",
    entries: [
      {
        title: "Software Architecture",
        body: "Structure & boundaries\nPrinciples & major decisions\nQuality attributes: performance, security, availability",
      },
      {
        title: "System Design",
        body: "Requirements into components\nAPIs & data flows\nCapacity, scaling & failure handling",
      },
    ],
  },
  {
    id: "questions",
    title: "Architecture Starts With Questions",
    section: "PART 2 · REQUIREMENTS BEFORE DECISIONS",
    layout: "canvas",
    takeaway: "Decision rule: every component must solve a real, justified requirement.",
    entries: [
      { title: "What?", body: "What are we building?" },
      { title: "Who?", body: "Who will use it?" },
      { title: "Features", body: "Core functional requirements?" },
      { title: "Traffic", body: "How much load, and when?" },
      { title: "Data", body: "How much data will we store?" },
      { title: "Quality", body: "Availability & speed targets?" },
      { title: "Budget", body: "Cost & operational constraints?" },
      { title: "Team", body: "What can the team run?" },
    ],
  },
  {
    id: "case-study",
    title: "Let’s Design an E-Commerce System",
    section: "PART 3 · CASE STUDY",
    layout: "canvas",
    takeaway:
      "Illustrative design for teaching — not the actual architecture of Amazon, Shopify or any other company.",
    entries: [
      { title: "Browse", body: "product catalog" },
      { title: "Search", body: "find products" },
      { title: "Details", body: "product page" },
      { title: "Cart", body: "add to cart" },
      { title: "Order", body: "place an order" },
      { title: "Pay", body: "payment provider" },
      { title: "Confirm", body: "confirmation" },
      { title: "Track", body: "order status" },
    ],
  },
  stage(
    "stage-1",
    "CASE STUDY · STAGE 01",
    "Stage 1 — The Simplest Working Architecture",
    "We need a first release that customers can use.",
    "Client, one backend API, one relational database.",
    "Simple to build and run; one instance limits capacity and availability.",
  ),
  stage(
    "stack-hosting",
    "CASE STUDY · STAGES 02–03",
    "Stages 2–3 — Choose the Stack and Where to Host It",
    "Pick technologies and a place to run them.",
    "Choose by team, requirements, ecosystem and compliance.",
    "Control vs. operational responsibility — cloud is not automatically best.",
  ),
  stage(
    "stage-4",
    "CASE STUDY · STAGE 04",
    "Stage 4 — Traffic Grows",
    "Traffic outgrows a single API instance.",
    "Load balancer in front of stateless API instances.",
    "Sessions move to a shared store; the database can still bottleneck.",
  ),
  stage(
    "stage-5",
    "CASE STUDY · STAGE 05",
    "Stage 5 — Database Decisions",
    "Orders and payments must never be half-saved.",
    "Relational DB with transactions; NoSQL only for proven access patterns.",
    "Scaling the app tier is not scaling the DB; replicas lag, sharding is complex.",
  ),
  stage(
    "stage-6",
    "CASE STUDY · STAGE 06",
    "Stage 6 — Improving Performance With Caching",
    "Popular products are read again and again.",
    "Redis cache-aside with an expiry (TTL) for hot reads.",
    "Stale data and invalidation; never cache payment status or stock checks.",
  ),
  stage(
    "stage-7",
    "CASE STUDY · STAGE 07",
    "Stage 7 — Serving Static Content Efficiently",
    "Images and static files load slowly and hit the origin.",
    "Serve static assets from a CDN backed by object storage.",
    "Lower latency and origin load; versioning and invalidation needed.",
  ),
  stage(
    "stage-8",
    "CASE STUDY · STAGE 08",
    "Stage 8 — Asynchronous Processing",
    "Checkout waits on slow work: emails, fulfillment.",
    "Commit the order, publish an event; workers do the rest.",
    "Eventual processing; retries mean idempotent, duplicate-safe handlers.",
  ),
  stage(
    "stage-9",
    "CASE STUDY · STAGE 09",
    "Stage 9 — External Integrations",
    "Take real payments, send messages, ship orders.",
    "Call providers with timeouts and idempotency keys; verify webhooks.",
    "External failures: payment may stay pending — confirm, never assume.",
  ),
  {
    id: "architecture-styles",
    title: "Monolith, Modular Monolith or Microservices?",
    section: "CASE STUDY · STAGE 10 · DEPLOYMENT BOUNDARIES",
    layout: "canvas",
    takeaway: "A well-structured modular monolith can be a very good production solution.",
    entries: [
      {
        title: "Monolith",
        body: "+ Simple to build, test and deploy\n− Boundaries erode as it grows",
      },
      {
        title: "Modular monolith",
        body: "+ Clear modules, one release\n+ Owned data, simple operations",
      },
      {
        title: "Microservices",
        body: "+ Independent deploys and scaling\n− Network, data and ops overhead",
      },
    ],
  },
  {
    id: "code-structure",
    title: "Inside the Backend: How Do We Structure the Code?",
    section: "CASE STUDY · STAGE 10 · CODE STRUCTURE",
    layout: "canvas",
    image: EP004_ART.styles,
    subtitle:
      "Previous slide: deployment boundaries. This one: structuring code inside one backend — any style fits a monolith, modular monolith or service.",
    entries: [
      { title: "N-Tier", body: "Organized by technical layers; familiar structure." },
      { title: "Clean / Onion", body: "Dependencies point inward to the domain." },
      { title: "Vertical Slice", body: "Organized by feature or use case, end to end." },
    ],
  },
  {
    id: "production",
    title: "Stage 11 — Security, Reliability & Observability",
    section: "CASE STUDY · STAGE 11",
    layout: "canvas",
    entries: [
      { title: "Security", body: "AuthN/AuthZ · HTTPS/TLS · secrets · rate limiting" },
      { title: "Reliability", body: "Health checks · timeouts & retries · backups & DR" },
      { title: "Observability", body: "Logs · metrics · distributed traces · alerts" },
    ],
  },
  stage(
    "deployment",
    "CASE STUDY · STAGE 12",
    "Stage 12 — Deployment and Operations",
    "Releases are manual, risky and inconsistent.",
    "CI/CD builds one tested image; promote it from dev to staging to production.",
    "More tooling; Kubernetes adds a lot — adopt it when scale needs it.",
  ),
  {
    id: "reference-architecture",
    title: "The Complete System — Illustrative E-Commerce Architecture",
    section: "PART 4 · THE COMPLETE PICTURE",
    layout: "canvas",
    image: EP004_ART.system,
    subtitle:
      "Clients, edge (CDN/WAF, load balancer), storefront API, SQL + Redis; the broker feeds workers; providers are called over HTTPS.",
    entries: [
      {
        title: "Clients & edge",
        body: "Web/mobile and admin through CDN/WAF and the load balancer.",
      },
      {
        title: "Storefront API",
        body: "Catalog, cart, orders and inventory modules; SQL and Redis.",
      },
      {
        title: "Async & external",
        body: "Broker and background workers; payment, shipping and email/SMS providers.",
      },
    ],
  },
  {
    id: "reference-detail",
    title: "Detailed Reference View — Infrastructure, Security & Operations",
    section: "PART 4 · THE COMPLETE PICTURE",
    layout: "canvas",
    image: EP004_ART.reference,
    subtitle:
      "Illustrative reference — not any company’s actual architecture. Zones, data stores, integrations, observability, security and CI/CD.",
    entries: [
      { title: "Zones", body: "Public edge, private application, managed data and integrations." },
      {
        title: "Cross-cutting",
        body: "Observability & operations, security, CI/CD and deployment.",
      },
    ],
  },
  {
    id: "order-flow",
    title: "What Happens When a Customer Places an Order?",
    section: "PART 4 · END-TO-END EXAMPLE",
    layout: "canvas",
    entries: [
      { title: "Idempotency", body: "A retried request never creates a second order or charge." },
      {
        title: "Webhooks",
        body: "Verify the signature, dedupe events, reconcile if one is missed.",
      },
      { title: "Failures", body: "Release the reservation; never assume the payment succeeded." },
    ],
  },
  {
    id: "same-product",
    title: "Same Product, Different Architecture",
    section: "PART 5 · IS THIS THE ONLY CORRECT ARCHITECTURE? NO.",
    layout: "canvas",
    takeaway: "Examples, not fixed maturity levels — users, budget, team and compliance decide.",
    entries: [
      { title: "Small startup", body: "Simple monolith\nRelational database\nManaged hosting" },
      {
        title: "Growing e-commerce",
        body: "Modular monolith\nCaching + load balancing\nAsync processing",
      },
      {
        title: "Large enterprise",
        body: "Multiple services where justified\nIndependent scaling\nMature platform & operations",
      },
    ],
  },
  {
    id: "trade-offs",
    title: "Architecture Is About Trade-offs",
    section: "PART 5 · DECISIONS & TRADE-OFFS",
    layout: "canvas",
    takeaway: "Requirements decide where you sit on each line — and that position can change.",
    entries: [
      {
        title: "Simplicity | Flexibility",
        body: "Each service, plugin point or abstraction is more to build, test and run.",
      },
      {
        title: "Performance | Cost",
        body: "Caches, replicas and bigger machines buy speed — and add spend.",
      },
      {
        title: "Consistency | Availability",
        body: "During network failures, distributed data must choose; payments and reviews choose differently.",
      },
      {
        title: "Scalability | Operational complexity",
        body: "Independent scaling needs automation, monitoring and skilled people.",
      },
    ],
  },
  {
    id: "takeaways",
    title: "Key Takeaways",
    section: "THINK BEYOND THE CODE",
    layout: "canvas",
    entries: [
      { title: "Bigger than code", body: "Software engineering is more than writing code." },
      {
        title: "Requirements first",
        body: "Architecture begins with requirements, not technologies.",
      },
      { title: "Know the why", body: "Understand why each component exists." },
      { title: "Start simple", body: "Evolve the system based on actual needs." },
      {
        title: "Real constraints",
        body: "Design for real constraints, not hypothetical maximum scale.",
      },
      { title: "Keep deciding", body: "Architecture is a continuous decision-making process." },
    ],
  },
  {
    id: "last-item",
    title: "Who Gets the Last Item?",
    section: "CLOSING CASE · DESIGN FROM A BUSINESS PROBLEM",
    layout: "canvas",
    last: true,
    subtitle:
      "During the session, we picked parts of the architecture and discussed what they do. Let’s close by starting with a business problem and designing how the system should handle it.",
    entries: [
      {
        title: "Display available stock",
        body: "Read from inventory; push updates after changes commit. Both shoppers can still see the same count before the update arrives.",
      },
      {
        title: "Decide when to reserve",
        body: "Reserve at checkout by default. If Add to Cart promises stock, create a short reservation there with a visible expiry.",
      },
      {
        title: "Reserve atomically",
        body: "One transaction: reduce stock only if enough remains, and record the reservation. Lock = the transaction; hold = until confirm, cancel or expiry.",
      },
      {
        title: "Confirm or release once",
        body: "Confirm from an active reservation. If the hold expires or is canceled, return the stock exactly once.",
      },
      {
        title: "Show the outcome",
        body: "One unit, one reservation: one shopper checks out; the other sees “Sold out.”",
      },
    ],
  },
];
