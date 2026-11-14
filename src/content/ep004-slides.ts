import type { BriefPage } from "./executive-briefs";

/** EP004 executive-brief pages rendered by the shared deck layouts. */
export const EP004_BRIEF: BriefPage[] = [
  {
    id: "journey",
    title: "Tonight: From Three Boxes to a Real System",
    section: "THE EPISODE ROADMAP",
    layout: "flow",
    cards: true,
    emphasis: 3,
    entries: [
      { title: "Why It Matters", body: "Software engineering is more than writing code." },
      {
        title: "Architecture vs. Design",
        body: "Structure, boundaries, decisions and quality attributes.",
      },
      { title: "Start With Questions", body: "Requirements and constraints before technologies." },
      {
        title: "Design an E-Commerce System",
        body: "Twelve stages: challenge, decision, trade-off.",
      },
      { title: "Reference Architecture", body: "The full picture and one order, end to end." },
      {
        title: "Trade-offs & Takeaways",
        body: "No single correct answer — and how to keep learning.",
      },
    ],
  },
  {
    id: "previously",
    title: "Previously on CodeShift: More Than Writing Code",
    section: "PART 1 · WHY SOFTWARE ARCHITECTURE MATTERS",
    layout: "statement",
    takeaway: "From writing components to designing complete systems.",
    entries: [
      {
        title: "AI writes more of the implementation code.",
        body: "EP001–EP003: generating code is getting cheaper every month.",
      },
      {
        title: "Developer value goes beyond syntax.",
        body: "Judgment, ownership and verification are where value concentrates.",
      },
      {
        title: "Understand the whole system.",
        body: "Requirements, design, architecture, decisions and trade-offs.",
      },
    ],
  },
  {
    id: "developer-journey",
    title: "The Traditional Developer Journey",
    section: "PART 1 · WHY SOFTWARE ARCHITECTURE MATTERS",
    layout: "comparison",
    takeaway: "Today, every engineer needs to understand why the system is shaped this way.",
    entries: [
      {
        title: "Architects & Tech Leads decide",
        body: "Structure, boundaries and technology choices\nTrade-offs, risks and quality attributes\nBreak the work into predefined tasks",
      },
      {
        title: "Juniors implement",
        body: "Pick up a ticket, build the endpoint or screen\nFix bugs inside an existing design\nRarely see why the system looks this way",
      },
    ],
  },
  {
    id: "three-boxes",
    title: "Software Architecture Is More Than Three Boxes",
    section: "PART 1 · WHAT DEVELOPERS USUALLY LEARN FIRST",
    layout: "comparison",
    takeaway: "Useful foundations — but only part of system design.",
    entries: [
      {
        title: "Frontend + Backend + Database",
        body: "Client → API → relational database\nCustomer, Product, Order, Payment tables\nOne server, one database, happy path",
      },
      {
        title: "Real systems also need",
        body: "Load balancing, caching and a CDN\nQueues, workers and external integrations\nSecurity, observability and delivery pipelines",
      },
    ],
  },
  {
    id: "architecture-vs-design",
    title: "Software Architecture vs. System Design",
    section: "PART 2 · UNDERSTANDING ARCHITECTURE",
    layout: "comparison",
    takeaway: "They overlap: architecture sets the frame; system design makes it work.",
    entries: [
      {
        title: "Software Architecture",
        body: "Structure, boundaries and principles\nMajor, hard-to-change decisions\nQuality attributes: performance, security, availability",
      },
      {
        title: "System Design",
        body: "Turn requirements into a workable design\nComponents, interfaces (APIs) and data flows\nCapacity, scaling choices and trade-offs",
      },
    ],
  },
  {
    id: "questions",
    title: "Architecture Starts With Questions",
    section: "PART 2 · REQUIREMENTS → DECISIONS",
    layout: "flow",
    cards: true,
    entries: [
      { title: "What?", body: "What are we building?" },
      { title: "Who?", body: "Who will use it?" },
      { title: "Features", body: "Core functional requirements?" },
      { title: "Traffic", body: "How much load, and when?" },
      { title: "Data", body: "How much data will we store?" },
      { title: "Quality", body: "Availability and performance targets?" },
      { title: "Budget", body: "Cost and operational constraints?" },
      { title: "Team", body: "What can our team build and run?" },
    ],
  },
  {
    id: "case-study",
    title: "Case Study: Design an E-Commerce System",
    section: "PART 3 · ILLUSTRATIVE ENTERPRISE E-COMMERCE PLATFORM",
    layout: "flow",
    cards: true,
    emphasis: 4,
    takeaway: "Requirement → Challenge → Decision → Trade-off → Updated diagram",
    entries: [
      { title: "Browse", body: "Product catalog" },
      { title: "Search", body: "Find products" },
      { title: "Details", body: "Product page" },
      { title: "Cart", body: "Add to cart" },
      { title: "Order", body: "Place an order" },
      { title: "Pay", body: "Payment provider" },
      { title: "Confirm", body: "Confirmation" },
      { title: "Track", body: "Order status" },
    ],
  },
  {
    id: "stages-1-3",
    title: "Stages 1–3: Build It, Choose the Stack, Host It",
    section: "CASE STUDY · STAGES 01–03",
    layout: "flow",
    cards: true,
    entries: [
      {
        title: "Simplest Working Architecture",
        body: "Web/Mobile → Backend API → Relational DB. Customer, Product, Cart, Order, Payment with PK/FK. Simple — but one instance limits scale.",
      },
      {
        title: "Choose the Stack",
        body: "React, .NET, Node.js, PostgreSQL, SQL Server are examples. Decide by team experience, requirements, ecosystem, maintainability.",
      },
      {
        title: "Where to Host?",
        body: "On-premises, cloud or hybrid. Weigh ops responsibility, scaling, cost, compliance. Cloud is not automatically best.",
      },
    ],
  },
  {
    id: "stages-4-6",
    title: "Stages 4–6: Traffic, Data and Speed",
    section: "CASE STUDY · STAGES 04–06",
    layout: "flow",
    cards: true,
    entries: [
      {
        title: "Traffic Grows",
        body: "Reverse proxy + load balancer + multiple API instances. Horizontal over vertical scaling. Trade-off: stateless APIs, shared session state.",
      },
      {
        title: "Database Decisions",
        body: "Relational + ACID is a sound default for orders and payments. Indexes first, then replicas or partitioning. NoSQL for specific access patterns.",
      },
      {
        title: "Caching",
        body: "Redis cache-aside with TTL for popular products. Trade-off: stale data and invalidation. Never cache payment status or checkout stock.",
      },
    ],
  },
  {
    id: "stages-7-9",
    title: "Stages 7–9: Static Content, Async Work, Integrations",
    section: "CASE STUDY · STAGES 07–09",
    layout: "flow",
    cards: true,
    entries: [
      {
        title: "CDN & Object Storage",
        body: "Images and static assets served from edge caches; API calls still reach the backend. Trade-off: cache invalidation and versioning.",
      },
      {
        title: "Asynchronous Processing",
        body: "Checkout saves the order, then publishes events. Workers send notifications and start fulfillment. Plan for retries, idempotency, duplicates.",
      },
      {
        title: "External Integrations",
        body: "Payment, email/SMS, shipping. Use timeouts, signed webhooks and idempotency keys. Payment success is never assumed — confirm it.",
      },
    ],
  },
  {
    id: "architecture-styles",
    title: "Stage 10: Monolith, Modular Monolith or Microservices?",
    section: "CASE STUDY · STAGE 10",
    layout: "flow",
    cards: true,
    emphasis: 1,
    takeaway: "A well-structured modular monolith can be a very good production solution.",
    entries: [
      {
        title: "Monolith",
        body: "One deployable, shared code and data. Simple to build and run; boundaries erode as it grows.",
      },
      {
        title: "Modular Monolith",
        body: "One deployable with enforced module boundaries and data ownership. Simple operations, clear structure.",
      },
      {
        title: "Microservices",
        body: "Independent deployment and scaling per team. Cost: network calls, distributed data, heavy operations.",
      },
    ],
  },
  {
    id: "production",
    title: "Stages 11–12: Production Concerns and Delivery",
    section: "CASE STUDY · STAGES 11–12",
    layout: "matrix",
    cards: true,
    entries: [
      {
        title: "Security",
        body: "Authentication and authorization, HTTPS/TLS, secrets management, rate limiting.",
      },
      {
        title: "Reliability & Observability",
        body: "Logs, metrics, distributed tracing, health checks, backups and disaster recovery.",
      },
      {
        title: "Containers & CI/CD",
        body: "Docker packages the app; CI/CD builds, tests and promotes it: dev → staging → production.",
      },
      {
        title: "Kubernetes Is Optional",
        body: "Orchestration solves a different problem. Smaller systems often run well on managed hosting.",
      },
    ],
  },
  {
    id: "reference-architecture",
    title: "Illustrative E-Commerce Reference Architecture",
    section: "PART 4 · THE COMPLETE PICTURE",
    layout: "map",
    cards: true,
    entries: [
      {
        title: "Clients & Edge",
        body: "Web/mobile → CDN + object storage; load balancer / reverse proxy.",
      },
      {
        title: "Application",
        body: "Stateless API instances: catalog, cart, orders, payments modules.",
      },
      { title: "Data", body: "Relational database for orders; Redis cache for hot reads." },
      { title: "Async", body: "Message broker + background workers: notifications, fulfillment." },
      { title: "External", body: "Payment provider, email/SMS provider, shipping integration." },
      { title: "Cross-cutting", body: "Security boundaries, logging, monitoring, tracing, CI/CD." },
    ],
  },
  {
    id: "order-flow",
    title: "What Happens When a Customer Places an Order?",
    section: "PART 4 · END-TO-END EXAMPLE",
    layout: "flow",
    cards: true,
    entries: [
      { title: "Submit", body: "Checkout with an idempotency key." },
      { title: "Validate", body: "Cart, prices and customer." },
      { title: "Reserve", body: "Order + stock in one transaction." },
      { title: "Pay", body: "Initiate payment at the provider." },
      { title: "Confirm", body: "Signed webhook; ignore duplicates." },
      { title: "Update", body: "Order paid, failed or pending." },
      { title: "Async", body: "Notify and start fulfillment." },
      { title: "Inform", body: "Customer sees a clear status." },
    ],
  },
  {
    id: "same-product",
    title: "Same Product, Different Architecture",
    section: "PART 5 · IS THIS THE ONLY CORRECT ARCHITECTURE? NO.",
    layout: "flow",
    cards: true,
    emphasis: 1,
    takeaway: "Examples, not fixed maturity levels — users, budget, team and compliance decide.",
    entries: [
      { title: "Small Startup", body: "Simple monolith, relational database, managed hosting." },
      {
        title: "Growing E-Commerce",
        body: "Modular monolith, caching, load balancing, async processing.",
      },
      {
        title: "Large Enterprise",
        body: "Multiple services where justified, independent scaling, mature operations.",
      },
    ],
  },
  {
    id: "trade-offs",
    title: "Architecture Is About Trade-offs",
    section: "PART 5 · DECISIONS & TRADE-OFFS",
    layout: "matrix",
    cards: true,
    entries: [
      {
        title: "Simplicity ↔ Flexibility",
        body: "Every extension point or service adds code and concepts to own.",
      },
      {
        title: "Performance ↔ Cost",
        body: "Caches, replicas and bigger machines buy speed — at a price.",
      },
      {
        title: "Consistency ↔ Availability",
        body: "During network failures, distributed data must choose; requirements decide.",
      },
      {
        title: "Scalability ↔ Operational Complexity",
        body: "Independent scaling needs automation, monitoring and skills.",
      },
    ],
  },
  {
    id: "takeaways",
    title: "Key Takeaways",
    section: "THINK BEYOND THE CODE",
    layout: "flow",
    cards: true,
    entries: [
      { title: "Bigger Than Code", body: "Software engineering is more than writing code." },
      {
        title: "Requirements First",
        body: "Architecture begins with requirements, not technologies.",
      },
      { title: "Know the Why", body: "Understand why each component exists." },
      { title: "Start Simple", body: "Evolve based on actual needs." },
      { title: "Real Constraints", body: "Design for real constraints, not hypothetical scale." },
      { title: "Keep Deciding", body: "Architecture is a continuous decision-making process." },
    ],
  },
];
