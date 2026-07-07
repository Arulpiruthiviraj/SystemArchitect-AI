import { VisualNode, VisualConnection } from './interview-questions';

export interface ComponentOption {
  id: string;
  name: string;
  category: 'Routing' | 'Caching' | 'Database' | 'Protocol' | 'Resiliency' | 'Security' | 'Messaging';
  status: 'recommended' | 'suboptimal' | 'incorrect';
  justification: string;
  whyNot: string;
}

export interface SystemDesignScenario {
  id: string;
  title: string;
  difficulty: 'Medium' | 'Hard' | 'Expert';
  testing: string;
  metrics: { label: string; value: string }[];
  problem: string;
  traps: string[];
  options: ComponentOption[];
  diagram: {
    type: 'flow' | 'layers' | 'comparison' | 'cycle' | 'grid';
    nodes: VisualNode[];
    connections: VisualConnection[];
  };
  cheatsheet: string[];
}

export const SYSTEM_DESIGN_SCENARIOS: SystemDesignScenario[] = [
  {
    id: "sc-1",
    title: "Scenario 1: The Global Latency Problem",
    difficulty: "Medium",
    testing: "Geo-routing, replication, and caching.",
    metrics: [
      { label: "Active Users", value: "5M DAU" },
      { label: "Current Load Time", value: "4,000ms" },
      { label: "Target Load Time", value: "< 200ms" },
      { label: "User Spread", value: "60% Tokyo & London" }
    ],
    problem: "We have a dashboard application that just grew to 5 million daily active users. Originally, all our users were in New York. Now, 60% of our users are in Tokyo and London. The European and Asian users are complaining that the app takes 4 seconds to load, while US users load it in 200ms. How do you redesign the architecture to give everyone 200ms load times?",
    traps: [
      "Forgetting eventual consistency limits when replicating database nodes.",
      "Placing a standard Load Balancer at the edge (it does not reduce speed-of-light transit latency).",
      "Relying entirely on database tuning when the actual bottleneck is network round-trip times."
    ],
    options: [
      {
        id: "opt-1-1",
        name: "Geo-DNS (Amazon Route 53)",
        category: "Routing",
        status: "recommended",
        justification: "Correct. Routes users to the physically closest regional gateway at the DNS level before the request even leaves their local network provider.",
        whyNot: "A standard single regional load balancer forces all DNS lookups to go to the US first, defeating physical latency reduction."
      },
      {
        id: "opt-1-2",
        name: "Edge Content Delivery Network (CDN)",
        category: "Caching",
        status: "recommended",
        justification: "Excellent. Caches compiled frontend static assets (React/Vue chunks, styles, graphics) directly in Tokyo and London edge servers. This eliminates the transatlantic trip entirely for page loads.",
        whyNot: "Serving static files from a single centralized web server forces foreign users to make high-latency network calls just to fetch raw code, taking seconds."
      },
      {
        id: "opt-1-3",
        name: "Cross-Region DB Read Replicas",
        category: "Database",
        status: "recommended",
        justification: "Perfect. Establishes asynchronous read replicas in Tokyo and London regions. Since dashboard operations are 95% reads, read latency drops from >150ms to ~10ms.",
        whyNot: "A single global SQL database in New York is bounded by the speed of light (~150ms round-trip to Tokyo), meaning every single read query is slow regardless of index tuning."
      },
      {
        id: "opt-1-4",
        name: "Standard Application Load Balancer (ALB)",
        category: "Routing",
        status: "suboptimal",
        justification: "Suboptimal. While useful inside a single data center, a standard load balancer is regional and cannot route traffic globally before the speed-of-light penalty is paid.",
        whyNot: "Use Geo-DNS to route users to the correct global region first; then use regional load balancers to distribute traffic locally."
      },
      {
        id: "opt-1-5",
        name: "Database Query Sharding by User IP",
        category: "Database",
        status: "incorrect",
        justification: "Incorrect. Sharding a database on a single New York instance still forces global clients to query the same server across oceans, doing nothing for network latency.",
        whyNot: "Database sharding solves scale storage bottlenecks, not light-speed propagation bottlenecks across global regions."
      }
    ],
    diagram: {
      type: "flow",
      nodes: [
        { id: "geo-client", label: "Tokyo Client", type: "client" },
        { id: "geo-dns", label: "Geo-DNS", type: "gateway", role: "Route Route 53" },
        { id: "geo-cdn", label: "Tokyo Edge CDN", type: "cache", role: "Assets & Images" },
        { id: "geo-replica", label: "Tokyo Read Replica", type: "db", role: "Local Reads" },
        { id: "geo-ny-db", label: "NY Primary DB", type: "db", role: "Async Sync Writes" }
      ],
      connections: [
        { from: "geo-client", to: "geo-dns", label: "1. Resolve DNS", animated: true },
        { from: "geo-dns", to: "geo-cdn", label: "2. Fetch Assets", animated: true },
        { from: "geo-client", to: "geo-replica", label: "3. Read Dashboard Data", animated: true },
        { from: "geo-ny-db", to: "geo-replica", label: "Sync writes asynchronously", animated: false }
      ]
    },
    cheatsheet: [
      "Explain the speed-of-light physical barrier: NY to Tokyo fiber propagation delay is roughly 150ms round-trip. Component tuning cannot beat physics.",
      "Acknowledge Eventual Consistency: Mention that Tokyo read replicas are replicated asynchronously, meaning an updated profile might take up to 1 second to reflect in Asia.",
      "Explain that static assets constitute 80% of page weight, which CDNs resolve, while Read Replicas solve the dynamic 20% database latency."
    ]
  },
  {
    id: "sc-2",
    title: "Scenario 2: The 'Thundering Herd' Spike",
    difficulty: "Hard",
    testing: "Asynchronous processing, decoupling, and protecting the database.",
    metrics: [
      { label: "Normal Load", value: "500 req/min" },
      { label: "Peak Expected Load", value: "500,000 / 10s" },
      { label: "Core Obstacle", value: "Relational DB Crash" },
      { label: "Primary Resource", value: "Concert Inventory" }
    ],
    problem: "We run a ticketing platform. Normally, we get about 500 requests per minute. But tomorrow, Taylor Swift tickets go on sale, and we expect 500,000 users to hit the 'Buy' button in the exact same 10-second window. In the past, this caused our SQL database to crash and everyone got error pages. How do you redesign this to survive the spike?",
    traps: [
      "Letting users hit the database directly to check ticket quantities.",
      "Scaling the server nodes without a message buffer (this simply shifts the bottleneck directly to the database).",
      "Using standard database row-locking for ticket counts which causes immediate lock timeouts."
    ],
    options: [
      {
        id: "opt-2-1",
        name: "Message Queue (Kafka or Amazon SQS)",
        category: "Messaging",
        status: "recommended",
        justification: "Correct. Instead of executing transactions synchronously, the API Gateway drops purchase orders into a persistent queue and immediately returns a 'Processing...' token. This buffers the traffic.",
        whyNot: "Without a queue, hundreds of thousands of concurrent database connections will immediately exhaust the DB pool and cause a total database freeze."
      },
      {
        id: "opt-2-2",
        name: "In-Memory Cache (Redis Cluster)",
        category: "Caching",
        status: "recommended",
        justification: "Excellent. Stores ticket inventory counts inside in-memory Redis RAM. Checking inventory using atomic Lua scripts or DECR operations avoids touching disk storage completely.",
        whyNot: "Running 500,000 concurrent SQL queries checking 'SELECT quantity' will cause severe read locks on the database and crash disk read performance."
      },
      {
        id: "opt-2-3",
        name: "WebSockets or Long Polling",
        category: "Routing",
        status: "recommended",
        justification: "Perfect. Since the checkout has been decoupled asynchronously via a queue, WebSockets are used to stream the purchase confirmation to the client once the background worker finishes.",
        whyNot: "Standard client polling would create a second thundering herd of millions of secondary status check requests, re-killing the gateway servers."
      },
      {
        id: "opt-2-4",
        name: "Auto-Scaling Server Nodes Upward",
        category: "Resiliency",
        status: "suboptimal",
        justification: "Suboptimal. While auto-scaling is good, server containers take up to 2-3 minutes to spin up. The 10-second spike will complete and crash the database long before new instances boot.",
        whyNot: "Static pre-provisioning combined with asynchronous queues is required to survive a short, ultra-dense spike."
      },
      {
        id: "opt-2-5",
        name: "Adding More SQL Read Replicas",
        category: "Database",
        status: "incorrect",
        justification: "Incorrect. Read replicas only help with read-heavy lookups. Ticket purchase transactions involve highly contested writes on a single stock count, which must hit the primary write database.",
        whyNot: "Read replicas cannot handle concurrent transactional ticket decrements because they are read-only and suffer from replication lag."
      }
    ],
    diagram: {
      type: "layers",
      nodes: [
        { id: "spike-client", label: "500k Clients", type: "client" },
        { id: "spike-gw", label: "API Gateway", type: "gateway", role: "Rate Limit / JWT" },
        { id: "spike-redis", label: "Redis Inventory Cache", type: "cache", role: "Atomic DECR Stock" },
        { id: "spike-queue", label: "Kafka Event Bus", type: "queue", role: "Asynchronous Buffer" },
        { id: "spike-workers", label: "Worker Pool", type: "server", role: "Order Processors" },
        { id: "spike-db", label: "Primary SQL DB", type: "db", role: "ACID Ledger Record" }
      ],
      connections: [
        { from: "spike-client", to: "spike-gw", label: "1. Buy Ticket Click", animated: true },
        { from: "spike-gw", to: "spike-redis", label: "2. Check & Decrement Stock", animated: true },
        { from: "spike-gw", to: "spike-queue", label: "3. Push Order Task", animated: true },
        { from: "spike-workers", to: "spike-queue", label: "4. Pull Task at safe rate", animated: true },
        { from: "spike-workers", to: "spike-db", label: "5. Commit Sale to DB", animated: true }
      ]
    },
    cheatsheet: [
      "Detail the Virtual Queue Concept: Explain that we shield our database by giving clients a queue state. The database is isolated from external users.",
      "Mention Redis Lua Scripting: Using Redis Lua scripts guarantees that check-and-decrement actions happen atomically, preventing race conditions in memory.",
      "Discuss WebSockets fallback: If connection breaks, the client can fall back to standard HTTP GET with high intervals using jitter."
    ]
  },
  {
    id: "sc-3",
    title: "Scenario 3: Massive Write Ingestion (IoT/Telemetry)",
    difficulty: "Hard",
    testing: "High-throughput writes and time-series data modeling.",
    metrics: [
      { label: "IoT Devices", value: "10 Million" },
      { label: "Ping Interval", value: "Every 5 seconds" },
      { label: "Writes / Sec", value: "2 Million / s" },
      { label: "Primary Goal", value: "Monthly Reports" }
    ],
    problem: "We are deploying smart thermostats in 10 million homes. Every thermostat sends a payload of its current temperature, humidity, and HVAC status every 5 seconds. We need to store this data to generate monthly energy reports. How do you design the ingestion and storage layers?",
    traps: [
      "Using standard REST over HTTPS (which has massive header overhead and TCP handshaking bounds).",
      "Storing raw telemetry in a standard Relational Database using default indexes.",
      "Executing immediate database writes for every single thermostat ping individually."
    ],
    options: [
      {
        id: "opt-3-1",
        name: "MQTT / UDP Connection Layer",
        category: "Protocol",
        status: "recommended",
        justification: "Correct. MQTT uses a lightweight pub/sub model with tiny 2-byte headers. UDP drops handshakes entirely, dramatically lowering bandwidth and gateway CPU requirements compared to HTTPS.",
        whyNot: "HTTPS forces a 3-way TLS handshake and heavy headers for every tiny 100-byte metric, which will bottleneck router bandwidth and exhaust socket limits."
      },
      {
        id: "opt-3-2",
        name: "Log-Structured NoSQL Database (Cassandra)",
        category: "Database",
        status: "recommended",
        justification: "Excellent. Cassandra utilizes an LSM-tree (Log-Structured Merge-tree) where incoming data is appended sequentially in memory and flushed to disk in bulk. This offers extremely high write speeds.",
        whyNot: "SQL databases use B-Tree indexes which perform random disk lookups and re-balancing to insert data, completely stalling under 2 million writes per second."
      },
      {
        id: "opt-3-3",
        name: "TimescaleDB or InfluxDB",
        category: "Database",
        status: "recommended",
        justification: "Perfect. Specialized time-series databases organize data into time-based partitions (hypertables) and support built-in downsampling, allowing old detailed data to shrink automatically.",
        whyNot: "A general-purpose document store like MongoDB will grow exponentially in index size, causing RAM exhaustion within weeks."
      },
      {
        id: "opt-3-4",
        name: "Stream Aggregator (Apache Spark / Flink)",
        category: "Messaging",
        status: "recommended",
        justification: "Excellent. A stream processing layer aggregates the 5-second raw pings into 5-minute averages in-memory before writing, reducing database write counts by 60x.",
        whyNot: "Writing raw, non-aggregated 5-second metrics directly to disk creates unnecessary wear, immense storage costs, and redundant report queries."
      },
      {
        id: "opt-3-5",
        name: "Direct Transactional SQL Inserts",
        category: "Database",
        status: "incorrect",
        justification: "Incorrect. Sending 2 million INSERT SQL commands per second will trigger transaction lock congestion and crash any traditional ACID relational system.",
        whyNot: "Relational systems prioritize ACID locking guarantees which are totally unnecessary for append-only, disposable metric streams."
      }
    ],
    diagram: {
      type: "flow",
      nodes: [
        { id: "iot-device", label: "10M Thermostats", type: "client" },
        { id: "iot-broker", label: "MQTT Broker Hub", type: "gateway", role: "Lightweight Ingest" },
        { id: "iot-kafka", label: "Kafka Raw Buffer", type: "queue", role: "Partitioned Stream" },
        { id: "iot-flink", label: "Flink Aggregator", type: "server", role: "5-Min Rollups" },
        { id: "iot-db", label: "Cassandra / TSDB", type: "db", role: "Time-Series Disk" }
      ],
      connections: [
        { from: "iot-device", to: "iot-broker", label: "MQTT Pub (Lightweight)", animated: true },
        { from: "iot-broker", to: "iot-kafka", label: "Stream Ingest", animated: true },
        { from: "iot-kafka", to: "iot-flink", label: "Aggregate in-memory", animated: true },
        { from: "iot-flink", to: "iot-db", label: "Batch Write 5-Min data", animated: true }
      ]
    },
    cheatsheet: [
      "Compare B-Trees vs. LSM-Trees: Explain that B-Trees are for fast random lookups (read-heavy), while LSM-Trees are optimized for raw append-only writes (write-heavy).",
      "Mention Network Bandwidth Math: 10M devices * 100 bytes every 5s = 200 MB/sec raw bandwidth. Light protocols like MQTT or custom UDP are mandatory to reduce this cost.",
      "Highlight Downsampling: For old logs, explain that we automatically aggregate 5-second data into 1-hour rolls and delete raw logs after 30 days."
    ]
  },
  {
    id: "sc-4",
    title: "Scenario 4: The Double-Booking Lock",
    difficulty: "Expert",
    testing: "Distributed concurrency control and ACID guarantees.",
    metrics: [
      { label: "Remaining Stock", value: "1 PlayStation 5" },
      { label: "Purchase Diff", value: "0 milliseconds" },
      { label: "Buyer 1 Loc", value: "New York" },
      { label: "Buyer 2 Loc", value: "Los Angeles" }
    ],
    problem: "You are building an inventory system for a warehouse. There is exactly 1 PlayStation left in stock. Two different users, one in New York and one in LA, hit the 'Purchase' button at the exact same millisecond. How do you ensure your system doesn't sell the same item twice and end up with negative inventory?",
    traps: [
      "Using eventually consistent NoSQL databases like standard DynamoDB, leading to dual purchase acceptance.",
      "Implementing locks inside the server's local application memory (this fails when multiple servers run behind a Load Balancer).",
      "Using Optimistic Concurrency under extreme contention, which leads to high retry loops."
    ],
    options: [
      {
        id: "opt-4-1",
        name: "Pessimistic Locking (SELECT FOR UPDATE)",
        category: "Database",
        status: "recommended",
        justification: "Correct. PostgreSQL or MySQL offers strict ACID locking. Running a 'SELECT FOR UPDATE' locks the specific database row representing that PlayStation. The second request is blocked until the first transaction completes.",
        whyNot: "Without row-level locks, both server threads will read stock as '1' simultaneously, process credit card charges, and write back '0', selling 2 items."
      },
      {
        id: "opt-4-2",
        name: "Distributed Redis Lock (Redlock)",
        category: "Caching",
        status: "recommended",
        justification: "Excellent. If the checkout process takes time (e.g. contacting payment APIs), holding a database row lock is extremely dangerous. We acquire a short-lived, distributed lock in Redis instead.",
        whyNot: "Holding a database transaction open while waiting for third-party HTTP payments can freeze the entire connection pool and crash the application."
      },
      {
        id: "opt-4-3",
        name: "Fully Relational SQL DB (PostgreSQL)",
        category: "Database",
        status: "recommended",
        justification: "Perfect. Relational engines support full ACID isolation levels (like Repeatable Read or Serializable) that ensure concurrent operations are ordered sequentially.",
        whyNot: "Standard NoSQL databases prioritize availability over immediate consistency, which can cause replication lag and double-booking errors."
      },
      {
        id: "opt-4-4",
        name: "Optimistic Concurrency Control (OCC)",
        category: "Database",
        status: "suboptimal",
        justification: "Suboptimal. While OCC (using version columns) works well for low-contention updates, under high contention for a single hot item it causes constant write aborts and massive retry loops.",
        whyNot: "For a hot item with high transactional collision, a pessimistic lock or Redis lock resolves transactions cleaner without wasteful retries."
      },
      {
        id: "opt-4-5",
        name: "Local NodeJS / Java Mutex Lock",
        category: "Resiliency",
        status: "incorrect",
        justification: "Incorrect. A local code mutex only operates inside a single server's memory space. Because your app is load-balanced across multiple servers, they cannot share local locks.",
        whyNot: "New York hits Server A and Los Angeles hits Server B. Local locks will succeed on both servers, letting both users double-book the item."
      }
    ],
    diagram: {
      type: "comparison",
      nodes: [
        { id: "lock-la", label: "LA Client", type: "client" },
        { id: "lock-ny", label: "NY Client", type: "client" },
        { id: "lock-redis", label: "Redis Distributed Lock", type: "cache", role: "SET key NX PX" },
        { id: "lock-db", label: "PostgreSQL Database", type: "db", role: "SELECT ... FOR UPDATE" }
      ],
      connections: [
        { from: "lock-ny", to: "lock-redis", label: "1. Acquires Lock (Success)", animated: true },
        { from: "lock-la", to: "lock-redis", label: "1. Blocked / Denied Lock", animated: false },
        { from: "lock-redis", to: "lock-db", label: "2. Securely update item count", animated: true }
      ]
    },
    cheatsheet: [
      "Define distributed locking: Explain how 'SET key_id value NX PX 10000' in Redis guarantees only one load-balanced node handles the checkout at any millisecond.",
      "Warn about the Payment Call Anti-Pattern: Never hold a database lock open while making external network calls (e.g. Stripe API). Use distributed states instead.",
      "Discuss Idempotency: Always attach an Idempotency Key (usually a UUID generated on client) to prevent duplicate submissions if the user double-clicks the Buy button."
    ]
  },
  {
    id: "sc-5",
    title: "Scenario 5: The 'Chatty' Microservice Outage",
    difficulty: "Medium",
    testing: "Fault tolerance and graceful degradation.",
    metrics: [
      { label: "Chain Length", value: "4 Services (A->B->C->D)" },
      { label: "Fail Point", value: "Service D Offline" },
      { label: "User Impact", value: "30s Homepage Freeze" },
      { label: "Availability", value: "Cascading Failure" }
    ],
    problem: "We have a microservice architecture. When a user loads their homepage, the Frontend Service calls the User Service, which calls the Billing Service, which calls the History Service. If the History Service goes down, the entire homepage fails to load and times out after 30 seconds. How do we make this resilient?",
    traps: [
      "Letting downstream timeouts multiply upward across synchronous HTTP request boundaries.",
      "Retrying failing connections automatically without exponential backoff or limiters.",
      "Designing services as deep synchronous chains instead of decoupled, event-driven components."
    ],
    options: [
      {
        id: "opt-5-1",
        name: "Circuit Breaker Pattern (Netflix Hystrix/Resilience4j)",
        category: "Resiliency",
        status: "recommended",
        justification: "Correct. A Circuit Breaker monitors downstream health. If Service D fails repeatedly, the breaker trips immediately. Subsequent calls return an instant error (e.g., in 2ms) rather than waiting 30 seconds.",
        whyNot: "Without a circuit breaker, slow timeouts consume server thread pools and connection sockets, causing a cascading crash of all parent services."
      },
      {
        id: "opt-5-2",
        name: "Graceful Degradation (Fallback Data)",
        category: "Resiliency",
        status: "recommended",
        justification: "Excellent. If the non-critical History Service fails, the UI falls back to showing standard dashboard layouts with a message 'History temporarily unavailable', letting the user access critical functions.",
        whyNot: "Crashing the entire core homepage because a single minor history logging component is down is an amateur architectural mistake."
      },
      {
        id: "opt-5-3",
        name: "Asynchronous Event Sourcing (Kafka Pub/Sub)",
        category: "Messaging",
        status: "recommended",
        justification: "Perfect. Instead of deep synchronous HTTP chain calls (A -> B -> C -> D), services publish updates to a Kafka broker. Frontend queries a pre-aggregated materialized view, fully decoupling operations.",
        whyNot: "Synchronous HTTP chains amplify fault risk. If each of 4 chained services has a 99.9% uptime, the joint uptime drops to 99.6% (0.999^4), causing constant micro-outages."
      },
      {
        id: "opt-5-4",
        name: "Increasing Service Timeouts to 60 Seconds",
        category: "Resiliency",
        status: "incorrect",
        justification: "Incorrect. Increasing timeouts aggravates the issue. It forces client browsers to wait even longer, exhausting server thread pools faster during minor outages.",
        whyNot: "Timeouts should be kept tight (e.g., 500ms) to ensure fast failover and prevent resource congestion."
      },
      {
        id: "opt-5-5",
        name: "Infinite Connection Retries",
        category: "Resiliency",
        status: "incorrect",
        justification: "Incorrect. Infinite retries trigger a 'Retry Storm' (Thundering Herd on a sick server), completely preventing the failing downstream service from recovering.",
        whyNot: "Retries must always utilize exponential backoff paired with randomized Jitter and a strict maximum attempt count."
      }
    ],
    diagram: {
      type: "layers",
      nodes: [
        { id: "chatty-client", label: "User Client", type: "client" },
        { id: "chatty-front", label: "Frontend API", type: "gateway", role: "Aggregates view" },
        { id: "chatty-user", label: "User Service", type: "server", role: "Active" },
        { id: "chatty-breaker", label: "Circuit Breaker", type: "security", role: "TRIPPED (Fail Fast)" },
        { id: "chatty-history", label: "History Service", type: "server", role: "OFFLINE" }
      ],
      connections: [
        { from: "chatty-client", to: "chatty-front", label: "1. Request Homepage", animated: true },
        { from: "chatty-front", to: "chatty-user", label: "2. Fetch user profile", animated: true },
        { from: "chatty-user", to: "chatty-breaker", label: "3. Check History", animated: true },
        { from: "chatty-breaker", to: "chatty-history", label: "BLOCKED (No Call)", animated: false }
      ]
    },
    cheatsheet: [
      "Explain the Circuit Breaker States: Closed (everything normal), Open (downstream failing, calls blocked immediately), and Half-Open (letting a small test percentage through to check recovery).",
      "Mention Cascading Failures: Explain how thread pools get exhausted when calls pile up waiting on a slow network socket. Failing fast is the only way to save the cluster.",
      "Describe Materialized Views: For reading dashboard views, let microservices dump events asynchronously into a database cache so read paths are 100% decouple-independent."
    ]
  },
  {
    id: "sc-6",
    title: "Scenario 6: The 'Lost Connection' Payment (Idempotency)",
    difficulty: "Hard",
    testing: "API idempotency and state management.",
    metrics: [
      { label: "Payment Attempt", value: "$1,000 Flight" },
      { label: "Cell Service", value: "Lost in Tunnel" },
      { label: "Failure Mode", value: "Silent Success" },
      { label: "Key Goal", value: "0% Double Charges" }
    ],
    problem: "A user buys a $1,000 flight. They hit 'Pay'. The request reaches your server, the server successfully charges their credit card, but right as the server sends the 'Success' response back to the phone, the user drives into a tunnel and loses cell service. The phone never gets the success message. The user panics, refreshes the app, and hits 'Pay' a second time. How do you prevent charging them $2,000?",
    traps: [
      "Relying solely on client-side button disabling (users can still refresh, force close, or tap multiple times).",
      "Checking the SQL payments table without proper transaction isolation levels (causes raw race conditions during fast concurrent clicks).",
      "Generating transactional identifiers sequentially on the server rather than deterministically on the client."
    ],
    options: [
      {
        id: "opt-6-1",
        name: "Client-Generated Idempotency Keys (UUIDv4)",
        category: "Routing",
        status: "recommended",
        justification: "Correct. The client app generates a unique request key (UUID) when rendering the checkout page. If the network drops and the user retries, the app sends the exact same key.",
        whyNot: "Server-side key generation cannot prevent double charges because the retry looks like a fresh request if the server never knows it's a retry."
      },
      {
        id: "opt-6-2",
        name: "Fast In-Memory State Store (Redis)",
        category: "Caching",
        status: "recommended",
        justification: "Excellent. The payment handler executes a fast 'SET key NX' command in Redis with a TTL of 24 hours. This acts as a distributed lock and state register that resolves in <1ms.",
        whyNot: "Querying historical SQL transaction tables for duplicate charges is slow, disk-bound, and prone to race conditions if multiple threads query before inserting."
      },
      {
        id: "opt-6-3",
        name: "Transactional SQL Deduplication (Unique Constraint)",
        category: "Database",
        status: "recommended",
        justification: "Perfect. Enforces a database-level UNIQUE constraint on the idempotency key column. Even if memory locks fail, the DB will raise a hard conflict and abort the duplicate charge.",
        whyNot: "Client-side state tracking can be cleared by force-closing the app, making database-level constraints the ultimate safety net."
      },
      {
        id: "opt-6-4",
        name: "Pure Client-Side Button Disabling",
        category: "Resiliency",
        status: "suboptimal",
        justification: "Suboptimal. While good practice for UI/UX, button disabling is easily bypassed by network reloads, pull-to-refresh gestures, or browser freezes.",
        whyNot: "Client-side restrictions are easily bypassed and do not guard against programmatic API abuse or automated scripts."
      },
      {
        id: "opt-6-5",
        name: "Reversing Transactions after 30s Timout",
        category: "Security",
        status: "incorrect",
        justification: "Incorrect. Reversing a charge automatically simply because the user lost cell signal is highly dangerous and creates major ledger discrepancies across banking APIs.",
        whyNot: "Refunds are slow, subject to merchant fees, and should never be used as a replacement for API-level request deduplication."
      }
    ],
    diagram: {
      type: "flow",
      nodes: [
        { id: "idemp-client", label: "User Phone", type: "client" },
        { id: "idemp-api", label: "Payment API", type: "gateway", role: "Key header parser" },
        { id: "idemp-redis", label: "Redis State Store", type: "cache", role: "SET req_123 NX (Locks)" },
        { id: "idemp-stripe", label: "Stripe Gateway", type: "db", role: "Performs actual charge" }
      ],
      connections: [
        { from: "idemp-client", to: "idemp-api", label: "1. Pay (req_123)", animated: true },
        { from: "idemp-api", to: "idemp-redis", label: "2. Lock req_123", animated: true },
        { from: "idemp-api", to: "idemp-stripe", label: "3. Charge Card (Once)", animated: true },
        { from: "idemp-client", to: "idemp-api", label: "4. Retry (req_123) -> Skips card", animated: true }
      ]
    },
    cheatsheet: [
      "Explain the header-driven retry pattern: Walk through how 'Idempotency-Key' in headers allows the server to look up the exact response payload of previous charges.",
      "Detail Redis atomic locks: Explain that 'SET idempotency_req_123 processing NX PX 10000' guarantees only one server thread can perform the charge.",
      "Acknowledge the Payment Gateway limitations: Mention that Stripe/Adyen natively accept idempotency keys, which we must proxy safely."
    ]
  },
  {
    id: "sc-7",
    title: "Scenario 7: The 'Noisy Neighbor' (Multi-Tenancy)",
    difficulty: "Hard",
    testing: "Resource isolation, database sharding, and API throttling.",
    metrics: [
      { label: "Small Tenants", value: "10,000 Clients" },
      { label: "Large Tenant", value: "1 Enterprise" },
      { label: "Crash Window", value: "2:00 AM Nightly" },
      { label: "User Experience", value: "Timeout Errors" }
    ],
    problem: "You run a B2B software platform. You have 10,000 small business clients, and 1 massive enterprise client (e.g., Walmart). Every night at 2:00 AM, Walmart runs a massive data-export script. During this time, the database gets so overwhelmed that the other 10,000 small clients experience app timeouts and errors. How do you fix this?",
    traps: [
      "Adding indexes inside the transactional DB (indexes help with selective reads, but bulk data-exports still trigger massive table scans that saturate disk IOPS).",
      "Scaling the SQL DB vertically (incredibly expensive and fails when the next enterprise client is onboarded).",
      "Treating all clients with the same rate limits, restricting small active businesses during standard hours."
    ],
    options: [
      {
        id: "opt-7-1",
        name: "Tenant-Based DB Sharding (Physical Isolation)",
        category: "Database",
        status: "recommended",
        justification: "Correct. Placing your massive enterprise client on its own dedicated database instance (Cluster A) completely isolates its resource footprint from the shared cluster of small tenants (Cluster B).",
        whyNot: "Without physical separation, noisy tenants will always compete for the same IOPS, CPU cycles, and lock buffers on shared disks."
      },
      {
        id: "opt-7-2",
        name: "OLTP / OLAP Database Separation",
        category: "Database",
        status: "recommended",
        justification: "Excellent. Analytical exports (OLAP) should be served from read-replicas or a dedicated Data Warehouse (like Snowflake/BigQuery) rather than the transactional (OLTP) database.",
        whyNot: "Mixing real-time transactional inserts with long-running, multi-million row aggregate scans results in immediate transaction queue blockage."
      },
      {
        id: "opt-7-3",
        name: "API Gateway Rate Limiting (Token Bucket)",
        category: "Routing",
        status: "recommended",
        justification: "Perfect. Enforces individual tenant rate limits at the gateway layer. If Walmart's automated exporter script exceeds safe request budgets, the gateway returns '429 Too Many Requests'.",
        whyNot: "Without rate limiting at the gateway, any tenant can write a loop script that exhausts the thread count of your web servers before it even reaches the database."
      },
      {
        id: "opt-7-4",
        name: "Vertical Scale-Up of Primary Instance",
        category: "Resiliency",
        status: "suboptimal",
        justification: "Suboptimal. While raising CPU and memory buys some headroom, it is a costly band-aid that fails to solve the underlying resource-sharing conflict.",
        whyNot: "Vertical scaling increases the single point of failure footprint and scales cloud budgets exponentially instead of linearly."
      },
      {
        id: "opt-7-5",
        name: "Global Multi-Region Syncing",
        category: "Database",
        status: "incorrect",
        justification: "Incorrect. Syncing a database globally does not prevent a noisy neighbor on one region from saturating the replica node, which eventually drags down the sync pipe.",
        whyNot: "Multi-region setups are for geographic speed and disaster recovery, not tenant workload isolation."
      }
    ],
    diagram: {
      type: "comparison",
      nodes: [
        { id: "tenant-walmart", label: "Walmart (Enterprise)", type: "client" },
        { id: "tenant-small", label: "10,000 Small Tenants", type: "client" },
        { id: "tenant-gateway", label: "Throttled Gateway", type: "gateway", role: "Limit Walmart to 500 req/s" },
        { id: "tenant-db-wal", label: "Dedicated Shard (A)", type: "db", role: "Walmart exclusive CPU" },
        { id: "tenant-db-shared", label: "Shared Shard (B)", type: "db", role: "10k Small Biz CPU" }
      ],
      connections: [
        { from: "tenant-walmart", to: "tenant-gateway", label: "1. Runs export script", animated: true },
        { from: "tenant-gateway", to: "tenant-db-wal", label: "2. Executed on isolated DB", animated: true },
        { from: "tenant-small", to: "tenant-db-shared", label: "3. Fast, unaffected access", animated: true }
      ]
    },
    cheatsheet: [
      "Argue for physical tenancy separation: Explain the concept of 'SaaS Sharding' where high-tier clients pay premium rates to live on isolated infrastructure.",
      "Propose CQRS (Command Query Responsibility Segregation): Explain that writes go to the OLTP primary database, while exports query an offline analytical replica updated asynchronously.",
      "Discuss Rate Limit Mechanics: Explain how Token Bucket or Leaky Bucket algorithms keep B2B API exports balanced without causing cascading outages."
    ]
  },
  {
    id: "sc-8",
    title: "Scenario 8: The Transcoding Bottleneck (Compute-Heavy Tasks)",
    difficulty: "Hard",
    testing: "Decoupling compute-heavy tasks and direct-to-cloud uploading.",
    metrics: [
      { label: "File Size", value: "Up to 1GB Videos" },
      { label: "Target resolutions", value: "1080p, 720p" },
      { label: "Concurrent Uploads", value: "50 Uploads" },
      { label: "Failure Mode", value: "API Server Crash (100% CPU)" }
    ],
    problem: "You are building a video-sharing app. Currently, users upload videos directly to your backend Node.js servers. The server then transcodes the video into different resolutions (1080p, 720p). The problem is, transcoding takes a long time and uses 100% of the CPU. When 50 users upload a video at once, your web servers crash, taking the whole website offline. Redesign the upload flow.",
    traps: [
      "Running transcoding threads inside the same Node.js cluster (Node's single-threaded nature means even fork scripts quickly starve the core network loop).",
      "Relying on standard VM auto-scaling (API instances take up to 2 minutes to boot, while a 50-user upload spikes CPU in 2 seconds, crashing the system before scaling kicks in).",
      "Saving videos directly onto local API server volumes (destroys scalability and prevents simple load balancing)."
    ],
    options: [
      {
        id: "opt-8-1",
        name: "Pre-Signed URLs (Direct-to-S3 Uploads)",
        category: "Routing",
        status: "recommended",
        justification: "Correct. Clients fetch a secure, short-lived pre-signed URL from your API. The browser then uploads the heavy 1GB file directly to Amazon S3 or Google Cloud Storage, bypassing your application servers.",
        whyNot: "Routing gigabyte streams through API servers causes heavy network I/O congestion and exhausts memory heaps immediately."
      },
      {
        id: "opt-8-2",
        name: "Message Queue (Amazon SQS / RabbitMQ)",
        category: "Messaging",
        status: "recommended",
        justification: "Excellent. Landing a video in S3 triggers an event that drops a transcoding task onto SQS. This acts as an asynchronous buffer, protecting workers from instant spikes.",
        whyNot: "Without a queue, if 100 uploads finish at once, the worker servers will still attempt to transcode all 100 simultaneously, crashing from memory exhaustion."
      },
      {
        id: "opt-8-3",
        name: "Dedicated Compute Worker Fleet",
        category: "Resiliency",
        status: "recommended",
        justification: "Perfect. Transcoding is handled by a dedicated pool of CPU/GPU-optimized worker nodes. They pull tasks sequentially from SQS at a stable, controlled rate.",
        whyNot: "API servers should remain lightweight and optimized for network routing; mixing them with compute-heavy processing is a classic anti-pattern."
      },
      {
        id: "opt-8-4",
        name: "NodeJS Worker Threads (In-App Multi-Threading)",
        category: "Resiliency",
        status: "suboptimal",
        justification: "Suboptimal. Worker threads allow multi-core CPU usage, but running them on the main web servers still competes with active HTTP connection routing for memory and network bandwidth.",
        whyNot: "Separation of concerns dictates that heavy CPU tasks must live on separate servers so metadata routing remains available."
      },
      {
        id: "opt-8-5",
        name: "Synchronous HTTP Scale-Up",
        category: "Resiliency",
        status: "incorrect",
        justification: "Incorrect. Simply scaling web servers up synchronously does not decouple the bottleneck; a sudden surge of video uploads will always outpace scaling velocities.",
        whyNot: "Web applications must decouple heavy asset streaming from the synchronous HTTP request-response path entirely."
      }
    ],
    diagram: {
      type: "layers",
      nodes: [
        { id: "video-client", label: "User App", type: "client" },
        { id: "video-api", label: "API Gateway", type: "gateway", role: "Issues Pre-signed URL" },
        { id: "video-s3", label: "Object Storage (S3)", type: "cache", role: "Holds raw video" },
        { id: "video-sqs", label: "SQS Job Queue", type: "queue", role: "Buffers transcode tasks" },
        { id: "video-workers", label: "Fargate Worker Fleet", type: "server", role: "Runs FFmpeg" }
      ],
      connections: [
        { from: "video-client", to: "video-api", label: "1. Fetch Pre-signed URL", animated: true },
        { from: "video-client", to: "video-s3", label: "2. Upload 1GB Video", animated: true },
        { from: "video-s3", to: "video-sqs", label: "3. Publish ObjectCreated Event", animated: true },
        { from: "video-workers", to: "video-sqs", label: "4. Pull Task sequentially", animated: true }
      ]
    },
    cheatsheet: [
      "Articulate direct cloud ingestion: Explain how bypass-uploading to object storage (like S3/GCS) completely eliminates bandwidth pressure on application API gateways.",
      "Justify asynchronous worker separation: State that your transcoding fleet uses spot instances or serverless workers (AWS Fargate) to process jobs out-of-band.",
      "Explain the event trigger loop: Describe how S3 event triggers (SQS notifications) automate the pipeline without manual coordination logic."
    ]
  },
  {
    id: "sc-9",
    title: "Scenario 9: Live Data & Cache Invalidation (The Super Bowl Problem)",
    difficulty: "Hard",
    testing: "Real-time push mechanisms and cache invalidation.",
    metrics: [
      { label: "Viewer Base", value: "Millions Concurrent" },
      { label: "Polling Rate", value: "3s Polling" },
      { label: "Update Delay", value: "30 seconds" },
      { label: "Target Latency", value: "Sub-second Push" }
    ],
    problem: "Millions of users are watching the Super Bowl and have your sports app open. Currently, their phones 'poll' your server every 3 seconds to check for a score update. This is causing millions of useless API calls when the score hasn't changed. Furthermore, when the score does change, it takes up to 30 seconds to update on users' screens. Fix it.",
    traps: [
      "Tuning database replica counts (even with 50 replicas, millions of polling clients hitting endpoints every 3 seconds will overwhelm active load balancers and route bandwidth).",
      "Applying standard CDN caching (while it shields the origin, it creates cache-coherence issues that prevent fans from seeing the score updates instantly).",
      "Writing directly to SQL and relying on read replica polling intervals."
    ],
    options: [
      {
        id: "opt-9-1",
        name: "WebSockets or Server-Sent Events (SSE)",
        category: "Routing",
        status: "recommended",
        justification: "Correct. Establishes long-lived, persistent TCP connections with clients. Phones stop polling; instead, the server silently holds the connection and pushes updates the millisecond they happen.",
        whyNot: "HTTP Polling creates massive, redundant network overhead (TCP handshakes, headers) and drains mobile batteries with useless calls."
      },
      {
        id: "opt-9-2",
        name: "Write-Through Caching (Redis Primary)",
        category: "Caching",
        status: "recommended",
        justification: "Excellent. Admin score inputs write directly to the in-memory Redis cache first, bypassing slow disk-based SQL lookups for active users.",
        whyNot: "Writing updates to a relational DB and waiting for periodic syncs to propagate to the cache introduces high, unpredictable lag."
      },
      {
        id: "opt-9-3",
        name: "Redis Pub/Sub Connection Distribution",
        category: "Messaging",
        status: "recommended",
        justification: "Perfect. Because millions of connections are spread across multiple WebSocket gateway servers, Redis Pub/Sub is used to broadcast the score update from the admin panel to all WebSocket servers in the cluster instantly.",
        whyNot: "Without an internal pub/sub event bus, WebSocket servers cannot coordinate; an update on Server A wouldn't reach users connected to Server B."
      },
      {
        id: "opt-9-4",
        name: "Aggressive CDN Caching (10s TTL)",
        category: "Caching",
        status: "suboptimal",
        justification: "Suboptimal. While CDNs successfully shield API servers, a 10s caching delay is unacceptable for sports fans who will hear neighbors cheer a touchdown before their screen updates.",
        whyNot: "CDNs are static content caches, not real-time event routers. Use WebSockets/SSE for live events."
      },
      {
        id: "opt-9-5",
        name: "Replicating SQL DB Instances",
        category: "Database",
        status: "incorrect",
        justification: "Incorrect. Adding database replicas is expensive, increases replication lag under load, and completely fails to address the underlying network layer congestion.",
        whyNot: "DB read replicas solve heavy database query loads, not network connection starvation caused by millions of active clients."
      }
    ],
    diagram: {
      type: "flow",
      nodes: [
        { id: "super-admin", label: "Score Admin Panel", type: "client" },
        { id: "super-redis", label: "Redis Write-Through", type: "cache", role: "Holds active game state" },
        { id: "super-pub", label: "Redis Pub/Sub Bus", type: "queue", role: "Broadcasts scores internally" },
        { id: "super-sockets", label: "WebSocket Cluster", type: "server", role: "Maintains 5M connections" },
        { id: "super-clients", label: "Millions of Fans", type: "client" }
      ],
      connections: [
        { from: "super-admin", to: "super-redis", label: "1. Commit Score Update", animated: true },
        { from: "super-redis", to: "super-pub", label: "2. Publish Event", animated: true },
        { from: "super-sockets", to: "super-pub", label: "3. Listen for broadcats", animated: true },
        { from: "super-sockets", to: "super-clients", label: "4. TCP instant push", animated: true }
      ]
    },
    cheatsheet: [
      "Contrast Polling vs. Pushing: Explain that WebSockets/SSE replace million-request 'pull' storms with efficient, server-initiated zero-overhead updates.",
      "Describe state distribution: Explain that WebSocket servers are stateless. They subscribe to a shared Redis Pub/Sub channel so any server can broadcast to its local connection pool.",
      "Mention scale limits: Acknowledge that a single server can hold ~60,000 TCP sockets; you scale the connection layer horizontally behind an IP-hash Load Balancer."
    ]
  },
  {
    id: "sc-10",
    title: "Scenario 10: The Data Residency Law (Geographic Compliance)",
    difficulty: "Expert",
    testing: "Geo-partitioning and compliance-driven architecture.",
    metrics: [
      { label: "Data Location", value: "Virginia, US (Original)" },
      { label: "Jurisdiction", value: "European Union" },
      { label: "Legal Constraint", value: "GDPR Compliance" },
      { label: "Requirement", value: "0% Physical EU-to-US sync" }
    ],
    problem: "Your app has users globally, and all data is currently stored in a massive database in Virginia (US). A new law passes in the European Union stating that all digital data belonging to European citizens must physically reside on servers located within Europe, and cannot legally be transferred to the US. How do you re-architect the system?",
    traps: [
      "Using logical-only tenant views or simple country-masking filters (this is a direct regulatory violation; the physical disks holding European user rows must be physically inside Europe).",
      "Splitting the codebase into separate applications (destroys global network features and doubles engineering/operational overhead).",
      "Replicating the entire database globally for redundancy (violates laws if EU records sync to US backup disks)."
    ],
    options: [
      {
        id: "opt-10-1",
        name: "Geo-DNS Interception (Route 53)",
        category: "Routing",
        status: "recommended",
        justification: "Correct. Routes traffic at the DNS level based on client IP. European clients are directed to API gateways in Frankfurt, while US clients are directed to Virginia, ensuring localized traffic entry.",
        whyNot: "A single global entry load balancer is physically located in one country, exposing data packets to foreign jurisdiction intercept before routing."
      },
      {
        id: "opt-10-2",
        name: "Geo-Partitioned Database Cluster (CockroachDB)",
        category: "Database",
        status: "recommended",
        justification: "Excellent. Uses CockroachDB or Postgres physical sharding where 'user_region' is the partition key. EU user tables are strictly written to physical disks in Frankfurt, while US data remains in Virginia.",
        whyNot: "Relying on separate, un-linked databases prevents global queries and destroys unified social features across continents."
      },
      {
        id: "opt-10-3",
        name: "Dynamic Cross-Region Proxy Fetching",
        category: "Routing",
        status: "recommended",
        justification: "Perfect. If a US user views an EU user's profile, the US app server makes a real-time, cross-region API call to Frankfurt. It displays the data transiently in memory without writing it to US disks.",
        whyNot: "Replicating EU users to the US database to speed up profile loads directly violates GDPR residency rules."
      },
      {
        id: "opt-10-4",
        name: "Dual-Writing from Application Code",
        category: "Database",
        status: "suboptimal",
        justification: "Suboptimal. Attempting to write to separate database connections inside your backend application code leads to severe transaction sync bugs and data corruption if one region's network drops.",
        whyNot: "Database engines should handle physical data partitioning at the storage layer; application code should remain clean and region-agnostic."
      },
      {
        id: "opt-10-5",
        name: "Primary-Replica Sync (US Primary)",
        category: "Database",
        status: "incorrect",
        justification: "Incorrect. Keeping the primary database in the US and replicating a read-only copy to Europe is a direct violation, as European user writes still cross the ocean to US primary disks.",
        whyNot: "The database primary node must reside in the region where the citizen's data is legally bound."
      }
    ],
    diagram: {
      type: "comparison",
      nodes: [
        { id: "geo-eu", label: "EU User", type: "client" },
        { id: "geo-us", label: "US User", type: "client" },
        { id: "geo-route", label: "Geo-DNS Router", type: "gateway", role: "Resolves IP Geolocation" },
        { id: "geo-db-eu", label: "EU Shard (Frankfurt)", type: "db", role: "Strict local EU writes" },
        { id: "geo-db-us", label: "US Shard (Virginia)", type: "db", role: "Strict local US writes" }
      ],
      connections: [
        { from: "geo-eu", to: "geo-route", label: "1. Resolve Request", animated: true },
        { from: "geo-route", to: "geo-db-eu", label: "2. Write EU Data physically", animated: true },
        { from: "geo-us", to: "geo-db-us", label: "2. Write US Data physically", animated: true },
        { from: "geo-db-eu", to: "geo-db-us", label: "X BLOCKED REPLICATION", animated: false }
      ]
    },
    cheatsheet: [
      "Explain compliance-driven sharding: Walk through how database engines use Row-Level Geopartitioning to automatically map partition keys to specific cloud datacenters.",
      "Describe ephemeral data transfer: Highlight that GDPR allows real-time, client-initiated, transient displays of EU data to US viewers (e.g. looking at a profile) but strictly prohibits permanent US storage.",
      "Mention network routing bounds: Emphasize that Geo-DNS combined with regional load balancers guarantees European traffic stays within European sovereign networks."
    ]
  }
];

