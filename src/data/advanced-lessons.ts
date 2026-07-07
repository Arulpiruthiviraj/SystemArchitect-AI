import { Lesson } from './lessons';

export const advancedLessons: Lesson[] = [
  {
    id: "saga-pattern",
    level: 4,
    title: "The Saga Pattern (Distributed Transactions)",
    description: "Learn how to maintain data consistency across multiple independent microservices when things go wrong.",
    scenes: [
      {
        id: "saga-s1",
        title: "The Distributed Transaction Problem",
        explanation: "In a microservices architecture, an e-commerce order involves multiple services: Order, Payment, and Inventory. Each has its own database. We cannot use a simple database transaction. If Payment succeeds but Inventory fails, the system is in an inconsistent state.",
        nodes: [
          { id: "gateway", position: { x: 50, y: 150 }, data: { label: "Gateway", iconName: "API Gateway", color: "bg-purple-500" }, type: "custom" },
          { id: "order", position: { x: 250, y: 150 }, data: { label: "Order Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "payment", position: { x: 500, y: 50 }, data: { label: "Payment Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "inventory", position: { x: 500, y: 250 }, data: { label: "Inventory Service", iconName: "Server", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "gateway", target: "order", animated: true, label: "Place Order" },
          { id: "e2", source: "order", target: "payment", animated: true, label: "1. Charge (Success)", style: { stroke: '#10b981' } },
          { id: "e3", source: "order", target: "inventory", animated: false, label: "2. Reserve (Out of Stock!)", style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "saga-s2",
        title: "Compensating Transactions",
        explanation: "The Saga pattern solves this by issuing compensating transactions. When the Order service detects that Inventory failed, it immediately fires a new event to the Payment service to refund the user. This ensures eventual consistency.",
        nodes: [
          { id: "order", position: { x: 50, y: 150 }, data: { label: "Order Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "payment", position: { x: 350, y: 50 }, data: { label: "Payment Service", iconName: "Server", color: "bg-amber-500" }, type: "custom" },
          { id: "inventory", position: { x: 350, y: 250 }, data: { label: "Inventory Service", iconName: "Server", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "order", target: "inventory", animated: false, label: "Fails", style: { stroke: '#ef4444' } },
          { id: "e2", source: "order", target: "payment", animated: true, label: "Refund Payment (Compensation)", style: { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '5,5' } }
        ],
        quiz: {
          question: "Which of the following is a drawback of the Saga pattern?",
          options: [
            "It requires all services to share a single database.",
            "It is highly complex to orchestrate and debug, especially with many steps.",
            "It blocks the database tables for the entire duration of the order.",
            "It cannot be implemented with message queues."
          ],
          answerIndex: 1,
          explanation: "Sagas introduce massive complexity. You have to write logic for every possible failure scenario and ensure compensations are idempotent. It is much harder to debug than a single database transaction."
        }
      }
    ]
  },
  {
    id: "cqrs-pattern",
    level: 4,
    title: "CQRS (Command Query Responsibility Segregation)",
    description: "Learn how separating write models from read models allows systems to scale independently and optimize for performance.",
    scenes: [
      {
        id: "cqrs-s1",
        title: "The Problem with Single Models",
        explanation: "In traditional apps, we use the same database model for writing (complex validation) and reading (complex joins). As traffic grows, read queries lock up the database, slowing down write performance.",
        nodes: [
          { id: "api", position: { x: 50, y: 150 }, data: { label: "API Server", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "db", position: { x: 350, y: 150 }, data: { label: "Single Database", iconName: "Database (SQL)", color: "bg-red-500", cpu: 95 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "api", target: "db", animated: true, label: "Heavy Writes & Complex Reads", style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "cqrs-s2",
        title: "Separating Reads and Writes",
        explanation: "With CQRS, we physically separate the Write database (optimized for fast inserts and validation) from the Read database (optimized for fast queries, like a search index or materialized view).",
        nodes: [
          { id: "api-write", position: { x: 50, y: 50 }, data: { label: "Command API (Writes)", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "api-read", position: { x: 50, y: 250 }, data: { label: "Query API (Reads)", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "db-write", position: { x: 350, y: 50 }, data: { label: "Write DB (PostgreSQL)", iconName: "Database (SQL)", color: "bg-blue-600", cpu: 20 }, type: "custom" },
          { id: "db-read", position: { x: 350, y: 250 }, data: { label: "Read DB (Elasticsearch)", iconName: "Database (NoSQL)", color: "bg-emerald-600", cpu: 15 }, type: "custom" },
          { id: "mq", position: { x: 350, y: 150 }, data: { label: "Event Broker", iconName: "Message Queue", color: "bg-purple-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "api-write", target: "db-write", animated: true, label: "Write" },
          { id: "e2", source: "db-write", target: "mq", animated: true, label: "Publish Event", style: { stroke: '#8b5cf6', strokeDasharray: '5,5' } },
          { id: "e3", source: "mq", target: "db-read", animated: true, label: "Sync Read Model", style: { stroke: '#8b5cf6', strokeDasharray: '5,5' } },
          { id: "e4", source: "api-read", target: "db-read", animated: true, label: "Query" }
        ]
      }
    ]
  },
  {
    id: "real-time-chat",
    level: 5,
    title: "System Design: Real-Time Chat (WhatsApp)",
    description: "Design a globally scalable real-time chat architecture that supports millions of concurrent connections, offline messages, and presence.",
    scenes: [
      {
        id: "chat-s1",
        title: "The Architecture",
        explanation: "A real-time chat system requires thousands of WebSocket servers to maintain persistent connections. When User A sends a message to User B, it goes to User A's connected WebSocket server, into a Message Queue (Kafka), to the Chat Service, and finally pushed to User B's connected WebSocket server via Redis Pub/Sub routing.",
        nodes: [
          { id: "usera", position: { x: 50, y: 50 }, data: { label: "User A", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "userb", position: { x: 50, y: 250 }, data: { label: "User B", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "wsa", position: { x: 250, y: 50 }, data: { label: "WebSocket Server 1", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "wsb", position: { x: 250, y: 250 }, data: { label: "WebSocket Server 2", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "pubsub", position: { x: 500, y: 150 }, data: { label: "Redis Pub/Sub", iconName: "Cache (Redis)", color: "bg-red-500" }, type: "custom" },
          { id: "db", position: { x: 700, y: 150 }, data: { label: "Cassandra (Storage)", iconName: "Database (NoSQL)", color: "bg-amber-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "usera", target: "wsa", animated: true, label: "Send Msg", style: { stroke: '#10b981' } },
          { id: "e2", source: "wsa", target: "pubsub", animated: true, label: "Publish to User B Channel" },
          { id: "e3", source: "pubsub", target: "wsb", animated: true, label: "Push to WS Server 2" },
          { id: "e4", source: "wsb", target: "userb", animated: true, label: "Deliver Msg", style: { stroke: '#10b981' } },
          { id: "e5", source: "wsa", target: "db", animated: true, label: "Async Persist", style: { stroke: '#f59e0b', strokeDasharray: '5,5' } }
        ]
      }
    ]
  },
  {
    id: "architecture-evolution",
    level: 5,
    title: "Architecture Evolution (Instagram)",
    description: "Watch a system evolve from a simple single-server startup to a globally distributed microservices architecture.",
    scenes: [
      {
        id: "ev-s1",
        title: "Version 1: The Startup (Monolith)",
        explanation: "Instagram starts with a single server and a single PostgreSQL database. It handles 100 users perfectly.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "Mobile App", iconName: "Smartphone", color: "bg-blue-500" }, type: "custom" },
          { id: "server", position: { x: 350, y: 150 }, data: { label: "Monolith Server", iconName: "Server", color: "bg-emerald-500", cpu: 20 }, type: "custom" },
          { id: "db", position: { x: 650, y: 150 }, data: { label: "PostgreSQL DB", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 15 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "server", animated: true },
          { id: "e2", source: "server", target: "db", animated: true }
        ]
      },
      {
        id: "ev-s2",
        title: "Version 2: Traffic Spike (Load Balancer & Cache)",
        explanation: "The app goes viral (10,000 users). The database is overwhelmed by reads. We add a Load Balancer to distribute traffic across 3 servers, and a Redis Cache to handle the heavy read load of the feed.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "10k Users", iconName: "Smartphone", color: "bg-blue-500" }, type: "custom" },
          { id: "lb", position: { x: 250, y: 150 }, data: { label: "Load Balancer", iconName: "Load Balancer", color: "bg-purple-500" }, type: "custom" },
          { id: "s1", position: { x: 450, y: 50 }, data: { label: "Server 1", iconName: "Server", color: "bg-emerald-500", cpu: 40 }, type: "custom" },
          { id: "s2", position: { x: 450, y: 150 }, data: { label: "Server 2", iconName: "Server", color: "bg-emerald-500", cpu: 40 }, type: "custom" },
          { id: "s3", position: { x: 450, y: 250 }, data: { label: "Server 3", iconName: "Server", color: "bg-emerald-500", cpu: 40 }, type: "custom" },
          { id: "cache", position: { x: 650, y: 50 }, data: { label: "Redis Cache", iconName: "Cache (Redis)", color: "bg-red-500", cpu: 30 }, type: "custom" },
          { id: "db", position: { x: 650, y: 200 }, data: { label: "PostgreSQL DB", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 60 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "lb", animated: true },
          { id: "e2", source: "lb", target: "s1", animated: true },
          { id: "e3", source: "lb", target: "s2", animated: true },
          { id: "e4", source: "lb", target: "s3", animated: true },
          { id: "e5", source: "s1", target: "cache", animated: true, style: { stroke: '#f43f5e' } },
          { id: "e6", source: "s2", target: "db", animated: true, style: { stroke: '#f59e0b' } }
        ]
      },
      {
        id: "ev-s3",
        title: "Version 3: Global Scale (Microservices & Sharding)",
        explanation: "100 Million users. The monolithic codebase is impossible to maintain. We split into Microservices (Auth, Feed, Upload). We introduce Object Storage (S3) for images, a CDN for global delivery, and Shard the PostgreSQL database.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "100M Users", iconName: "Globe", color: "bg-blue-500" }, type: "custom" },
          { id: "cdn", position: { x: 200, y: 50 }, data: { label: "CDN", iconName: "CDN", color: "bg-teal-500" }, type: "custom" },
          { id: "gateway", position: { x: 200, y: 250 }, data: { label: "API Gateway", iconName: "API Gateway", color: "bg-purple-500" }, type: "custom" },
          { id: "s3", position: { x: 400, y: 50 }, data: { label: "S3 Storage", iconName: "Cloud", color: "bg-orange-500" }, type: "custom" },
          { id: "auth", position: { x: 400, y: 150 }, data: { label: "Auth Svc", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "feed", position: { x: 400, y: 250 }, data: { label: "Feed Svc", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "cache", position: { x: 600, y: 150 }, data: { label: "Redis Cluster", iconName: "Cache (Redis)", color: "bg-red-500" }, type: "custom" },
          { id: "shard1", position: { x: 600, y: 250 }, data: { label: "DB Shard 1", iconName: "Database (SQL)", color: "bg-amber-500" }, type: "custom" },
          { id: "shard2", position: { x: 600, y: 350 }, data: { label: "DB Shard 2", iconName: "Database (SQL)", color: "bg-amber-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "cdn", animated: true, label: "Fetch Images" },
          { id: "e2", source: "client", target: "gateway", animated: true, label: "API Calls" },
          { id: "e3", source: "cdn", target: "s3", animated: false, style: { strokeDasharray: '5,5' } },
          { id: "e4", source: "gateway", target: "auth", animated: true },
          { id: "e5", source: "gateway", target: "feed", animated: true },
          { id: "e6", source: "feed", target: "cache", animated: true },
          { id: "e7", source: "feed", target: "shard1", animated: true }
        ]
      }
    ]
  },
  {
    id: "decision-simulator",
    level: 4,
    title: "Decision Simulator: Sync vs Async",
    description: "Compare Synchronous REST vs Asynchronous Event-Driven Architectures for an order processing system.",
    scenes: [
      {
        id: "dec-s1",
        title: "Option A: Synchronous REST",
        explanation: "The Order service calls Payment, Inventory, and Shipping sequentially over HTTP. If Shipping is slow or down, the ENTIRE order fails. The user stares at a loading spinner.",
        nodes: [
          { id: "user", position: { x: 50, y: 150 }, data: { label: "User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "order", position: { x: 250, y: 150 }, data: { label: "Order (Waiting...)", iconName: "Server", color: "bg-amber-500", cpu: 90 }, type: "custom" },
          { id: "pay", position: { x: 500, y: 50 }, data: { label: "Payment", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "inv", position: { x: 500, y: 150 }, data: { label: "Inventory", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "ship", position: { x: 500, y: 250 }, data: { label: "Shipping (SLOW)", iconName: "Server", color: "bg-red-500", cpu: 100 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "user", target: "order", animated: true, label: "Checkout", style: { stroke: '#f59e0b', strokeWidth: 3 } },
          { id: "e2", source: "order", target: "pay", animated: true, label: "1. HTTP POST" },
          { id: "e3", source: "order", target: "inv", animated: true, label: "2. HTTP POST" },
          { id: "e4", source: "order", target: "ship", animated: true, label: "3. HTTP POST (Timeout!)", style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "dec-s2",
        title: "Option B: Async Event-Driven",
        explanation: "The Order service writes an 'Order Created' event to Kafka and instantly returns 'Success' to the user. Payment, Inventory, and Shipping read the event independently. If Shipping is down, it simply reads the event later when it recovers.",
        nodes: [
          { id: "user", position: { x: 50, y: 150 }, data: { label: "User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "order", position: { x: 250, y: 150 }, data: { label: "Order", iconName: "Server", color: "bg-emerald-500", cpu: 10 }, type: "custom" },
          { id: "kafka", position: { x: 500, y: 150 }, data: { label: "Kafka Broker", iconName: "Message Queue", color: "bg-purple-500" }, type: "custom" },
          { id: "pay", position: { x: 750, y: 50 }, data: { label: "Payment", iconName: "Worker", color: "bg-emerald-500" }, type: "custom" },
          { id: "inv", position: { x: 750, y: 150 }, data: { label: "Inventory", iconName: "Worker", color: "bg-emerald-500" }, type: "custom" },
          { id: "ship", position: { x: 750, y: 250 }, data: { label: "Shipping (DOWN)", iconName: "Worker", color: "bg-zinc-800" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "user", target: "order", animated: true, label: "Checkout", style: { stroke: '#10b981' } },
          { id: "e2", source: "order", target: "kafka", animated: true, label: "Publish Event", style: { stroke: '#8b5cf6' } },
          { id: "e3", source: "kafka", target: "pay", animated: true, label: "Consume" },
          { id: "e4", source: "kafka", target: "inv", animated: true, label: "Consume" },
          { id: "e5", source: "kafka", target: "ship", animated: false, label: "Cannot Consume", style: { stroke: '#ef4444', strokeDasharray: '5,5' } }
        ],
        quiz: {
          question: "Which of the following is a key trade-off when moving from Option A to Option B?",
          options: [
            "Option B is slower.",
            "Option B introduces Eventual Consistency, meaning the user might not immediately see the result of their action.",
            "Option B is easier to debug because you can just look at one HTTP request trace.",
            "Option B requires you to use a monolithic architecture."
          ],
          answerIndex: 1,
          explanation: "In an event-driven system, the user is told 'Success' before the backend has finished processing. If they immediately refresh the page, their order might show as 'Pending' instead of 'Shipped' because the other services haven't processed the event yet. This is known as Eventual Consistency."
        }
      }
    ]
  },
  {
    id: "eda-fundamentals",
    level: 4,
    title: "Event-Driven Fundamentals",
    description: "Learn the core principles of EDA: Events vs Commands, Notifications vs State Transfer, and Choreography vs Orchestration.",
    scenes: [
      {
        id: "eda-s1",
        title: "Event vs Command",
        explanation: "A **Command** is an intent: 'Please charge this card'. It can be rejected. An **Event** is a statement of fact: 'Order was placed'. It has already happened and cannot be undone. In EDA, we react to facts.",
        nodes: [
          { id: "svc1", position: { x: 50, y: 150 }, data: { label: "Order Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "cmd", position: { x: 300, y: 50 }, data: { label: "Command: 'Pay()'", iconName: "MessageSquare", color: "bg-blue-500" }, type: "custom" },
          { id: "evt", position: { x: 300, y: 250 }, data: { label: "Event: 'Ordered'", iconName: "Activity", color: "bg-purple-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "svc1", target: "cmd", animated: true, label: "Intent" },
          { id: "e2", source: "svc1", target: "evt", animated: true, label: "Fact" }
        ]
      },
      {
        id: "eda-s2",
        title: "Choreography vs Orchestration",
        explanation: "**Orchestration** is like a conductor (centralized): 'You do this, then you do that'. **Choreography** is like a dance (decentralized): Each service reacts to events independently. Choreography is more decoupled but harder to track.",
        nodes: [
          { id: "orchestrator", position: { x: 50, y: 50 }, data: { label: "The Brain", iconName: "Brain", color: "bg-purple-600" }, type: "custom" },
          { id: "s1", position: { x: 300, y: 50 }, data: { label: "Service A", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "s2", position: { x: 550, y: 50 }, data: { label: "Service B", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "eb", position: { x: 300, y: 200 }, data: { label: "Event Bus", iconName: "Layers", color: "bg-zinc-800" }, type: "custom" },
          { id: "s3", position: { x: 50, y: 300 }, data: { label: "Service C", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "s4", position: { x: 550, y: 300 }, data: { label: "Service D", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "orchestrator", target: "s1", animated: true, label: "Do A" },
          { id: "e2", source: "s1", target: "orchestrator", animated: true, label: "Done" },
          { id: "e3", source: "orchestrator", target: "s2", animated: true, label: "Do B" },
          { id: "e4", source: "eb", target: "s3", animated: true, label: "React" },
          { id: "e5", source: "eb", target: "s4", animated: true, label: "React" }
        ]
      }
    ]
  },
  {
    id: "kafka-architecture",
    level: 5,
    title: "Kafka Architecture & Why It Exists",
    description: "Understand the storage engine behind Kafka and why it out-scales traditional message queues.",
    scenes: [
      {
        id: "ka-arch-1",
        title: "The Sequential Disk Secret",
        explanation: "Random disk access is slow. Sequential disk access is incredibly fast. Kafka treats every topic as an append-only log on disk. This allows it to handle millions of events per second on commodity hardware.",
        nodes: [
          { id: "disk", position: { x: 350, y: 150 }, data: { label: "Disk Log", iconName: "HardDrive", color: "bg-zinc-800" }, type: "custom" },
          { id: "m1", position: { x: 150, y: 150 }, data: { label: "Msg 0", iconName: "FileText", color: "bg-zinc-600" }, type: "custom" },
          { id: "m2", position: { x: 250, y: 150 }, data: { label: "Msg 1", iconName: "FileText", color: "bg-zinc-600" }, type: "custom" },
          { id: "m3", position: { x: 550, y: 150 }, data: { label: "NEW MSG", iconName: "FileText", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "m3", target: "disk", animated: true, label: "Append-Only" }
        ]
      },
      {
        id: "ka-arch-2",
        title: "The Zero-Copy Optimization",
        explanation: "Most systems copy data from Disk -> Kernel -> App -> Kernel -> Network. Kafka uses 'sendfile' to copy data directly from Disk to Network card. It never enters the Application RAM, bypassing the CPU entirely.",
        nodes: [
          { id: "disk", position: { x: 100, y: 150 }, data: { label: "Page Cache", iconName: "HardDrive", color: "bg-blue-600" }, type: "custom" },
          { id: "cpu", position: { x: 350, y: 50 }, data: { label: "CPU (BYPASSED)", iconName: "Cpu", color: "bg-zinc-700" }, type: "custom" },
          { id: "nic", position: { x: 600, y: 150 }, data: { label: "Network Card", iconName: "Wifi", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "disk", target: "nic", animated: true, label: "Zero-Copy Send", style: { stroke: '#10b981', strokeWidth: 5 } }
        ]
      }
    ]
  },
  {
    id: "kafka-producers",
    level: 5,
    title: "Kafka Producers: Reliability & Retries",
    description: "Learn how to configure producers for 'At-Least-Once' or 'Exactly-Once' delivery.",
    scenes: [
      {
        id: "kp-s1",
        title: "ACKs and Reliability",
        explanation: "Producers can choose acks=0 (fire and forget), acks=1 (leader only), or acks=all (all ISR replicas). acks=all is the slowest but safest choice for financial data.",
        nodes: [
          { id: "p", position: { x: 50, y: 150 }, data: { label: "Producer (acks=all)", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "leader", position: { x: 350, y: 150 }, data: { label: "Leader Broker", iconName: "Layers", color: "bg-indigo-600" }, type: "custom" },
          { id: "f1", position: { x: 600, y: 50 }, data: { label: "Follower 1", iconName: "Layers", color: "bg-indigo-400" }, type: "custom" },
          { id: "f2", position: { x: 600, y: 250 }, data: { label: "Follower 2", iconName: "Layers", color: "bg-indigo-400" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "p", target: "leader", animated: true, label: "Send" },
          { id: "e2", source: "leader", target: "f1", animated: true, label: "Sync" },
          { id: "e3", source: "leader", target: "f2", animated: true, label: "Sync" },
          { id: "e4", source: "leader", target: "p", animated: true, label: "ACK (Success)", style: { stroke: '#10b981' } }
        ]
      }
    ]
  },
  {
    id: "kafka-deep-dive",
    level: 5,
    title: "Kafka Deep Dive: Scalability & Partitions",
    description: "Understand how Kafka achieves massive throughput through horizontal partitioning and consumer groups.",
    scenes: [
      {
        id: "ka-s1",
        title: "The Partitioning Strategy",
        explanation: "Kafka topics are split into multiple Partitions. Each partition is an ordered, immutable sequence of messages. By partitioning, Kafka allows multiple brokers to host a single topic, enabling horizontal scaling.",
        nodes: [
          { id: "p1", position: { x: 50, y: 50 }, data: { label: "Producer 1", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "p2", position: { x: 50, y: 250 }, data: { label: "Producer 2", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "part0", position: { x: 350, y: 50 }, data: { label: "Topic: Partition 0", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "part1", position: { x: 350, y: 150 }, data: { label: "Topic: Partition 1", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "part2", position: { x: 350, y: 250 }, data: { label: "Topic: Partition 2", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "p1", target: "part0", animated: true, label: "Key: User123" },
          { id: "e2", source: "p2", target: "part1", animated: true, label: "Key: User456" },
          { id: "e3", source: "p1", target: "part2", animated: true, label: "Key: User789" }
        ]
      },
      {
        id: "ka-s2",
        title: "Consumer Groups & Rebalancing",
        playground: 'kafka',
        explanation: "Kafka uses Consumer Groups to allow multiple workers to read from the same topic. Each partition is assigned to exactly ONE consumer in a group. If a consumer fails, Kafka 'rebalances' and assigns its partitions to healthy consumers.",
        nodes: [
          { id: "part0", position: { x: 50, y: 50 }, data: { label: "Partition 0", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "part1", position: { x: 50, y: 150 }, data: { label: "Partition 1", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "part2", position: { x: 50, y: 250 }, data: { label: "Partition 2", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "c1", position: { x: 400, y: 50 }, data: { label: "Consumer A", iconName: "Worker", color: "bg-emerald-500" }, type: "custom" },
          { id: "c2", position: { x: 400, y: 150 }, data: { label: "Consumer B", iconName: "Worker", color: "bg-emerald-500" }, type: "custom" },
          { id: "c3", position: { x: 400, y: 250 }, data: { label: "Consumer C (FAILED)", iconName: "Worker", color: "bg-red-900" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "part0", target: "c1", animated: true },
          { id: "e2", source: "part1", target: "c2", animated: true },
          { id: "e3", source: "part2", target: "c2", animated: true, label: "Assigned after C failed", style: { stroke: '#f59e0b' } }
        ],
        quiz: {
          question: "If you have a topic with 3 partitions and a consumer group with 5 consumers, how many consumers will be idle?",
          options: ["0", "1", "2", "5"],
          answerIndex: 2,
          explanation: "Kafka only allows one consumer per partition within a group to ensure message ordering. With 3 partitions, at most 3 consumers can work. The remaining 2 will be idle."
        }
      }
    ]
  },
  {
    id: "outbox-pattern",
    level: 5,
    title: "The Transactional Outbox Pattern",
    description: "Learn how to reliably publish events to Kafka without losing data when a database transaction and a message send need to be atomic.",
    scenes: [
      {
        id: "out-s1",
        title: "The Dual Write Problem",
        explanation: "If you update your database and then send a message to Kafka, the network could fail between the two. If the DB succeeds but Kafka fails, your downstream services never know about the change. This is the 'Dual Write' problem.",
        nodes: [
          { id: "app", position: { x: 50, y: 150 }, data: { label: "App Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "db", position: { x: 350, y: 50 }, data: { label: "SQL Database", iconName: "Database (SQL)", color: "bg-orange-500" }, type: "custom" },
          { id: "kafka", position: { x: 350, y: 250 }, data: { label: "Kafka Broker", iconName: "Message Queue", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "app", target: "db", animated: true, label: "1. Update DB (Success)" },
          { id: "e2", source: "app", target: "kafka", animated: false, label: "2. Send Event (FAIL!)", style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "out-s2",
        title: "The Outbox Solution",
        explanation: "Instead of calling Kafka directly, the app writes the event into a special 'Outbox' table in the SAME database transaction. A separate 'Relay' service polls the Outbox table and publishes to Kafka. This ensures at-least-once delivery.",
        nodes: [
          { id: "app", position: { x: 50, y: 150 }, data: { label: "App Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "db", position: { x: 350, y: 150 }, data: { label: "SQL DB (Incl. Outbox Table)", iconName: "Database (SQL)", color: "bg-orange-500" }, type: "custom" },
          { id: "relay", position: { x: 600, y: 150 }, data: { label: "Outbox Relay (CDC)", iconName: "Worker", color: "bg-purple-500" }, type: "custom" },
          { id: "kafka", position: { x: 850, y: 150 }, data: { label: "Kafka Broker", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "app", target: "db", animated: true, label: "Single Atomic Transaction" },
          { id: "e2", source: "db", target: "relay", animated: true, label: "Poll / CDC" },
          { id: "e3", source: "relay", target: "kafka", animated: true, label: "Publish Event" }
        ]
      }
    ]
  },
  {
    id: "event-sourcing",
    level: 5,
    title: "Event Sourcing: Reconstructing the Past",
    description: "Learn how to store every change as an immutable event instead of just the current state.",
    scenes: [
      {
        id: "es-s1",
        title: "State vs Events",
        explanation: "In a traditional DB, you only see the current balance. In Event Sourcing, you store every single transaction. You can reconstruct the balance at any point in history by replaying the events.",
        nodes: [
          { id: "app", position: { x: 50, y: 150 }, data: { label: "Banking Svc", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "store", position: { x: 350, y: 150 }, data: { label: "Event Store (Append Only)", iconName: "Database (SQL)", color: "bg-zinc-800" }, type: "custom" },
          { id: "e1", position: { x: 600, y: 50 }, data: { label: "Event: Deposited $100", iconName: "FileText", color: "bg-blue-500" }, type: "custom" },
          { id: "e2", position: { x: 600, y: 150 }, data: { label: "Event: Withdrew $20", iconName: "FileText", color: "bg-blue-500" }, type: "custom" },
          { id: "e3", position: { x: 600, y: 250 }, data: { label: "Event: Paid $50 Rent", iconName: "FileText", color: "bg-blue-500" }, type: "custom" }
        ],
        edges: [
          { id: "edge1", source: "app", target: "store", animated: true },
          { id: "edge2", source: "store", target: "e1", animated: false },
          { id: "edge3", source: "store", target: "e2", animated: false },
          { id: "edge4", source: "store", target: "e3", animated: false }
        ]
      }
    ]
  },
  {
    id: "kafka-replication",
    level: 5,
    title: "Kafka: Replication & Fault Tolerance",
    description: "Learn how Kafka ensures your data is never lost, even if multiple brokers fail simultaneously.",
    scenes: [
      {
        id: "rep-s1",
        title: "Leaders and Followers",
        explanation: "Every partition has one Leader and multiple Followers (Replicas). All reads and writes go through the Leader. Followers constantly pull data from the Leader to stay in sync.",
        nodes: [
          { id: "leader", position: { x: 350, y: 150 }, data: { label: "Broker 1: Leader (P0)", iconName: "Layers", color: "bg-indigo-600" }, type: "custom" },
          { id: "follower1", position: { x: 600, y: 50 }, data: { label: "Broker 2: Follower (P0)", iconName: "Layers", color: "bg-indigo-400" }, type: "custom" },
          { id: "follower2", position: { x: 600, y: 250 }, data: { label: "Broker 3: Follower (P0)", iconName: "Layers", color: "bg-indigo-400" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "leader", target: "follower1", animated: true, label: "Fetch Data" },
          { id: "e2", source: "leader", target: "follower2", animated: true, label: "Fetch Data" }
        ]
      },
      {
        id: "rep-s2",
        title: "The ISR (In-Sync Replicas)",
        explanation: "ISR is the set of replicas that are 'caught up' with the leader. If the Leader fails, Kafka elects a new leader ONLY from the ISR set to avoid data loss.",
        nodes: [
          { id: "leader", position: { x: 350, y: 150 }, data: { label: "LEADER FAILED", iconName: "Layers", color: "bg-red-900" }, type: "custom" },
          { id: "isr1", position: { x: 600, y: 50 }, data: { label: "Follower A (IN ISR)", iconName: "Layers", color: "bg-emerald-500" }, type: "custom" },
          { id: "isr2", position: { x: 600, y: 250 }, data: { label: "Follower B (OUT OF SYNC)", iconName: "Layers", color: "bg-amber-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "isr1", target: "isr1", animated: true, label: "Elected New Leader!", style: { stroke: '#10b981', strokeWidth: 4 } }
        ],
        quiz: {
          question: "What happens if all brokers in the ISR set fail?",
          options: [
            "Kafka automatically restores from backup.",
            "The partition becomes unavailable for writes (unless unclean leader election is enabled).",
            "Followers that are out-of-sync automatically become leaders.",
            "The data is permanently deleted."
          ],
          answerIndex: 1,
          explanation: "Kafka prioritizes consistency. If no in-sync replicas are available, it stops accepting writes to prevent 'Unclean Leader Election' which could lead to data loss."
        }
      }
    ]
  },
  {
    id: "kafka-delivery-semantics",
    level: 5,
    title: "Exactly-Once Processing",
    description: "Master the hardest problem in distributed systems: ensuring a message is processed exactly one time.",
    scenes: [
      {
        id: "sem-s1",
        title: "At-Least-Once (The Default)",
        explanation: "The producer sends a message and waits for an ACK. If the ACK is lost due to network failure, the producer retries. Result: The message is in Kafka twice. The consumer must be idempotent.",
        nodes: [
          { id: "p", position: { x: 50, y: 150 }, data: { label: "Producer", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "k", position: { x: 350, y: 150 }, data: { label: "Kafka", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "m1", position: { x: 600, y: 50 }, data: { label: "Msg 1", iconName: "FileText", color: "bg-blue-400" }, type: "custom" },
          { id: "m2", position: { x: 600, y: 250 }, data: { label: "Msg 1 (Duplicate)", iconName: "FileText", color: "bg-blue-400" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "p", target: "k", animated: true, label: "Send Msg" },
          { id: "e2", source: "k", target: "p", animated: false, label: "ACK LOST!", style: { stroke: '#ef4444' } },
          { id: "e3", source: "p", target: "k", animated: true, label: "Retry Send" }
        ]
      },
      {
        id: "sem-s2",
        title: "Exactly-Once (Transactions)",
        explanation: "Kafka Transactions allow a producer to send a batch of messages to multiple partitions atomically. Either all are visible to consumers, or none are. This is used in 'Read-Process-Write' loops.",
        nodes: [
          { id: "p", position: { x: 50, y: 150 }, data: { label: "Transactional Producer", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "k1", position: { x: 350, y: 50 }, data: { label: "Topic A (P0)", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "k2", position: { x: 350, y: 250 }, data: { label: "Offsets Topic", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "p", target: "k1", animated: true, label: "Write Data" },
          { id: "e2", source: "p", target: "k2", animated: true, label: "Commit Offset" },
          { id: "e3", source: "p", target: "p", animated: true, label: "COMMIT TRANSACTION", style: { stroke: '#10b981' } }
        ]
      }
    ]
  },
  {
    id: "distributed-consensus",
    level: 5,
    title: "Distributed Consensus: Raft & Paxos",
    description: "Learn how a group of independent nodes agree on a single value, enabling fault-tolerant leader election.",
    scenes: [
      {
        id: "con-s1",
        title: "The Quorum Requirement",
        explanation: "To survive `f` failures, you need `2f + 1` nodes. If you have 3 nodes, you can survive 1 failure. If you have 5, you can survive 2. Decisions are only made if a Majority (Quorum) agrees.",
        nodes: [
          { id: "n1", position: { x: 50, y: 150 }, data: { label: "Leader", iconName: "Server", color: "bg-emerald-600" }, type: "custom" },
          { id: "n2", position: { x: 350, y: 50 }, data: { label: "Follower A", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "n3", position: { x: 350, y: 250 }, data: { label: "Follower B (DOWN)", iconName: "Server", color: "bg-red-900" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "n1", target: "n2", animated: true, label: "Propose Value" },
          { id: "e2", source: "n2", target: "n1", animated: true, label: "Vote: YES (Quorum Reached!)", style: { stroke: '#10b981' } }
        ]
      }
    ]
  },
  {
    id: "consistent-hashing",
    level: 4,
    title: "Consistent Hashing",
    description: "Learn the magic algorithm used by Load Balancers and NoSQL databases to minimize data movement when scaling.",
    scenes: [
      {
        id: "ch-s1",
        title: "The Modulo Problem",
        explanation: "If you use `Hash(ID) % N` to route traffic, and `N` changes (adding a server), almost EVERY request will route to a different server. This destroys your caches. Consistent Hashing fixes this.",
        nodes: [
          { id: "s1", position: { x: 100, y: 50 }, data: { label: "Node A", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "s2", position: { x: 500, y: 50 }, data: { label: "Node B", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "new", position: { x: 300, y: 250 }, data: { label: "NEW Node C", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: []
      }
    ]
  },
  {
    id: "circuit-breaker",
    level: 4,
    title: "Fault Tolerance: Circuit Breaker",
    description: "Prevent cascading failures in your system by 'tripping the circuit' when a downstream service is struggling.",
    scenes: [
      {
        id: "cb-s1",
        title: "Cascading Failure",
        explanation: "Service A calls Service B. Service B is slow. Service A's threads all wait for Service B, eventually crashing Service A too. The failure cascades up the stack.",
        nodes: [
          { id: "sa", position: { x: 50, y: 150 }, data: { label: "Service A", iconName: "Server", color: "bg-red-500", cpu: 100 }, type: "custom" },
          { id: "sb", position: { x: 350, y: 150 }, data: { label: "Service B (SLOW)", iconName: "Server", color: "bg-amber-600", cpu: 95 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "sa", target: "sb", animated: true, label: "Request (Blocked)", style: { stroke: '#ef4444' } }
        ]
      },
      {
        id: "cb-s2",
        title: "The Circuit Breaker Pattern",
        playground: 'chaos',
        explanation: "We add a Circuit Breaker. If Service B fails `N` times, the circuit 'Opens'. Now, Service A fails fast locally and returns a cached or fallback response, saving its own resources and letting Service B recover.",
        nodes: [
          { id: "sa", position: { x: 50, y: 150 }, data: { label: "Service A", iconName: "Server", color: "bg-emerald-500", cpu: 10 }, type: "custom" },
          { id: "cb", position: { x: 250, y: 150 }, data: { label: "CIRCUIT OPEN", iconName: "ShieldAlert", color: "bg-red-600" }, type: "custom" },
          { id: "sb", position: { x: 450, y: 150 }, data: { label: "Service B (OFFLINE)", iconName: "Server", color: "bg-zinc-800" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "sa", target: "cb", animated: true, label: "Request" },
          { id: "e2", source: "cb", target: "sa", animated: true, label: "Fail Fast (Return Fallback)", style: { stroke: '#ef4444' } }
        ]
      }
    ]
  },
  {
    id: "kafka-streams",
    level: 5,
    title: "Kafka Streams & Real-time Analytics",
    description: "Learn how to process and transform streams of data in real-time, enabling features like fraud detection and live leaderboards.",
    scenes: [
      {
        id: "ks-s1",
        title: "Stateless vs Stateful Processing",
        explanation: "Stateless (Filter/Map) processes one message at a time. Stateful (Window/Join) remembers data over time. Kafka Streams stores this state locally in RocksDB for ultra-fast performance.",
        nodes: [
          { id: "in", position: { x: 50, y: 150 }, data: { label: "Input Topic", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" },
          { id: "ks", position: { x: 300, y: 150 }, data: { label: "KStream App", iconName: "Brain", color: "bg-emerald-600" }, type: "custom" },
          { id: "rocks", position: { x: 300, y: 300 }, data: { label: "Local State (RocksDB)", iconName: "Database", color: "bg-blue-600" }, type: "custom" },
          { id: "out", position: { x: 550, y: 150 }, data: { label: "Output Topic", iconName: "Layers", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "in", target: "ks", animated: true },
          { id: "e2", source: "ks", target: "rocks", animated: true, label: "Read/Write State" },
          { id: "e3", source: "ks", target: "out", animated: true, label: "Aggregated Result" }
        ]
      }
    ]
  },
  {
    id: "nosql-vector-db",
    level: 4,
    title: "NoSQL and Vector Databases (AI Scale)",
    description: "Learn how Document, Wide-Column, Graph, and specialized Vector databases power modern similarity search, recommendations, and AI/RAG pipelines.",
    scenes: [
      {
        id: "nvd-s1",
        title: "The NoSQL Zoo: Specialized Storage",
        explanation: "Relational DBs excel at strict ACID transactions, but suffer under massive web scale. NoSQL databases trade off relationships for performance:\n\n1. **Document (MongoDB)**: Stores nested, flexible JSON documents.\n2. **Wide-Column (Cassandra)**: Partitioned storage that scales horizontally to petabytes.\n3. **Graph (Neo4j)**: Stores highly connected entities (nodes/relationships) with zero-join traversals.",
        nodes: [
          { id: "app", position: { x: 50, y: 150 }, data: { label: "App Server", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "doc", position: { x: 350, y: 50 }, data: { label: "Document (MongoDB)", iconName: "HardDrive", color: "bg-green-600" }, type: "custom" },
          { id: "wide", position: { x: 350, y: 150 }, data: { label: "Wide-Column (Cassandra)", iconName: "Database", color: "bg-blue-600" }, type: "custom" },
          { id: "graph", position: { x: 350, y: 250 }, data: { label: "Graph (Neo4j)", iconName: "Layers", color: "bg-purple-600" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "app", target: "doc", animated: true, label: "Flexible JSON" },
          { id: "e2", source: "app", target: "wide", animated: true, label: "Massive Write Scale" },
          { id: "e3", source: "app", target: "graph", animated: true, label: "Social Connections" }
        ]
      },
      {
        id: "nvd-s2",
        title: "Vector Databases & AI (Pinecone/pgvector)",
        explanation: "AI models represent text, images, and audio as **dense numerical vectors (embeddings)**. Traditional B-Tree indexes cannot query these. \n\nSpecialized **Vector Databases (Pinecone, Milvus, pgvector)** index these vectors using algorithms like HNSW (Hierarchical Navigable Small World) to perform sub-millisecond **Approximate Nearest Neighbor (ANN)** similarity search—the absolute core of AI-powered semantic search and Retrieval-Augmented Generation (RAG) pipelines.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "User Query", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "llm", position: { x: 250, y: 150 }, data: { label: "Embedding Svc (LLM)", iconName: "Brain", color: "bg-fuchsia-600" }, type: "custom" },
          { id: "vector", position: { x: 500, y: 150 }, data: { label: "Vector DB (Pinecone)", iconName: "Database", color: "bg-indigo-600" }, type: "custom" },
          { id: "kb", position: { x: 750, y: 150 }, data: { label: "Knowledge Base", iconName: "HardDrive", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "llm", animated: true, label: "1. Vectorize text" },
          { id: "e2", source: "llm", target: "vector", animated: true, label: "2. Vector lookup" },
          { id: "e3", source: "vector", target: "kb", animated: true, label: "3. Retreive context (RAG)" }
        ],
        quiz: {
          question: "Which index type is commonly used in Vector databases to achieve extremely fast similarity searches?",
          options: [
            "B-Tree index",
            "Inverted Index",
            "HNSW (Hierarchical Navigable Small World)",
            "Hash Index"
          ],
          answerIndex: 2,
          explanation: "HNSW builds a multi-layer graph of vectors, allowing search queries to skip large sections of data and find closest semantic matches in logarithmic time."
        }
      }
    ]
  },
  {
    id: "time-ordering-clocks",
    level: 5,
    title: "Time, Ordering & Lamport Clocks",
    description: "Distributed clocks drift. Learn how to establish event sequences without relying on physical clocks using Lamport and Vector Clocks.",
    scenes: [
      {
        id: "toc-s1",
        title: "The Illusion of Physical Time",
        explanation: "In distributed systems, physical clocks are unreliable because of network latency and hardware clock drift. Relying on Network Time Protocol (NTP) to order transactions can lead to catastrophic data corruption or out-of-order writes where an update gets overwritten by an older state.",
        nodes: [
          { id: "node1", position: { x: 100, y: 50 }, data: { label: "Node A (Clock: 12:00:01)", iconName: "Server", color: "bg-red-500" }, type: "custom" },
          { id: "node2", position: { x: 100, y: 250 }, data: { label: "Node B (Clock: 12:00:00)", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "db", position: { x: 450, y: 150 }, data: { label: "Database (LWW: Last Write Wins)", iconName: "Database", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "node1", target: "db", animated: true, label: "1. Update User (Timestamp 12:00:01)", style: { stroke: '#ef4444' } },
          { id: "e2", source: "node2", target: "db", animated: true, label: "2. Update User (Timestamp 12:00:00) - Overwrites NEW with OLD!", style: { stroke: '#3b82f6' } }
        ]
      },
      {
        id: "toc-s2",
        title: "Logical Clocks: Lamport & Vector",
        explanation: "To solve physical clock unreliability, we use **Logical Clocks**:\n\n1. **Lamport Clocks**: A simple monotonically increasing integer counter. Every time an event occurs, the local counter increments. When sending a message, the counter is attached. The receiver updates its counter to `max(local, message) + 1`.\n2. **Vector Clocks**: A structure containing counters for ALL nodes. Enables true causality tracking to detect write conflicts.",
        nodes: [
          { id: "node1", position: { x: 100, y: 150 }, data: { label: "Server A [V=[1, 0]]", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "node2", position: { x: 450, y: 150 }, data: { label: "Server B [V=[1, 1]]", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "node1", target: "node2", animated: true, label: "Send Msg [V=[1,0]]" },
          { id: "e2", source: "node2", target: "node1", animated: true, label: "Reply [V=[1,1]]" }
        ],
        quiz: {
          question: "What is the primary advantage of a Vector Clock over a basic Lamport Clock?",
          options: [
            "Vector clocks consume much less storage space.",
            "Vector clocks can determine if two events are concurrent (meaning they conflict) rather than sequentially ordered.",
            "Vector clocks synchronize perfectly with physical atomic clocks.",
            "Vector clocks work without network communication."
          ],
          answerIndex: 1,
          explanation: "Lamport clocks establish a total ordering, but cannot detect if two events happened concurrently. Vector clocks store the state of all nodes, enabling systems like Cassandra or Dynamo to identify and resolve concurrent conflicts."
        }
      }
    ]
  },
  {
    id: "observability-tracing",
    level: 4,
    title: "Distributed Observability",
    description: "Discover how centralized metrics, structured logging, and Jaeger distributed tracing allow you to debug massive microservice grids.",
    scenes: [
      {
        id: "obs-s1",
        title: "Metrics, Logs, and the Tracing Void",
        explanation: "As systems scale to hundreds of microservices, traditional logging fails. If a customer reports that checkout took 10 seconds, looking at individual server logs is like looking for a needle in a haystack. You cannot tell how a single request hopped from gateway to orders, payments, inventory, and databases.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "User (Failing/Slow)", iconName: "Client/User", color: "bg-red-500" }, type: "custom" },
          { id: "gw", position: { x: 250, y: 150 }, data: { label: "API Gateway (Latency: 10s)", iconName: "API Gateway", color: "bg-amber-500" }, type: "custom" },
          { id: "order", position: { x: 500, y: 50 }, data: { label: "Order Svc (OK)", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "pay", position: { x: 500, y: 250 }, data: { label: "Payment Svc (Stuck/Slow)", iconName: "Server", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "gw", animated: true },
          { id: "e2", source: "gw", target: "order", animated: true },
          { id: "e3", source: "gw", target: "pay", animated: true, label: "Bottleneck here?" }
        ]
      },
      {
        id: "obs-s2",
        title: "Distributed Tracing (OpenTelemetry/Jaeger)",
        explanation: "With Distributed Tracing, when a request enters the API Gateway, we attach a unique **Trace ID** and **Span ID** to the request headers. As the request hops to downstream services, the Trace ID is propagated (e.g., via W3C Trace Context). Each service reports its performance to a collector like OpenTelemetry, allowing visual analyzers like **Jaeger** to plot the entire execution timeline.",
        nodes: [
          { id: "gw", position: { x: 100, y: 150 }, data: { label: "Span 1: Gateway", iconName: "API Gateway", color: "bg-emerald-500" }, type: "custom" },
          { id: "pay", position: { x: 400, y: 150 }, data: { label: "Span 2: Payment", iconName: "Server", color: "bg-indigo-500" }, type: "custom" },
          { id: "stripe", position: { x: 700, y: 150 }, data: { label: "Span 3: Stripe API", iconName: "Server", color: "bg-fuchsia-600" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "gw", target: "pay", animated: true, label: "Trace-ID: 0x9f3" },
          { id: "e2", source: "pay", target: "stripe", animated: true, label: "Trace-ID: 0x9f3" }
        ],
        quiz: {
          question: "What is context propagation in distributed tracing?",
          options: [
            "Copying the database schema to read replicas.",
            "The process of serializing trace metadata into HTTP headers so tracing details travel with the cross-service request.",
            "Broadcasting metrics data to the user's browser.",
            "Restarting failed nodes automatically."
          ],
          answerIndex: 1,
          explanation: "Context propagation ensures that the Trace ID stays identical across HTTP or RPC hops, enabling tracing collectors to reconstruct the complete service dependency chain."
        }
      }
    ]
  },
  {
    id: "security-identity",
    level: 4,
    title: "Stateless Security: JWT & OAuth2",
    description: "Understand user identity, authentication, and authorization in stateless microservice grids using JSON Web Tokens (JWT) and OAuth2 flows.",
    scenes: [
      {
        id: "sec-s1",
        title: "Stateless Auth with JWTs",
        explanation: "In monolithic applications, session IDs are stored in a centralized database or shared memory. In stateless microservices, checking a session database for every API request creates a huge bottleneck. Instead, we use **JWT (JSON Web Token)**. \n\nThe auth service signs user data using a private key. The API Gateway and services can cryptographically verify the JWT's signature locally in milliseconds using the public key—fully stateless!",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "Client (Has JWT)", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "gw", position: { x: 300, y: 150 }, data: { label: "API Gateway (Local JWT verification)", iconName: "API Gateway", color: "bg-emerald-500" }, type: "custom" },
          { id: "order", position: { x: 550, y: 150 }, data: { label: "Order Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "gw", animated: true, label: "Bearer Token Header" },
          { id: "e2", source: "gw", target: "order", animated: true, label: "Stateless forwarding" }
        ]
      },
      {
        id: "sec-s2",
        title: "OAuth 2.0 / OpenID Connect Redirect Flow",
        explanation: "OAuth 2.0 is an industry-standard authorization framework. Instead of asking users for their credentials directly, applications redirect users to a trusted Identity Provider (like Google or Auth0). The IDP returns an **Authorization Code**, which the server exchanges for an **Access Token** to perform actions on behalf of the user.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "App", iconName: "Laptop", color: "bg-blue-500" }, type: "custom" },
          { id: "idp", position: { x: 350, y: 50 }, data: { label: "Identity Provider (IDP)", iconName: "Shield", color: "bg-indigo-600" }, type: "custom" },
          { id: "api", position: { x: 350, y: 250 }, data: { label: "Protected API", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "idp", animated: true, label: "1. Redirect to Login" },
          { id: "e2", source: "idp", target: "client", animated: true, label: "2. Auth Code Redirect" },
          { id: "e3", source: "client", target: "idp", animated: true, label: "3. Exchange Code for Access Token" },
          { id: "e4", source: "client", target: "api", animated: true, label: "4. Fetch with Token" }
        ],
        quiz: {
          question: "Why does OAuth 2.0 use an Authorization Code step instead of sending the Access Token directly back via the browser redirect?",
          options: [
            "Access tokens cannot be parsed by browsers.",
            "Direct transmission of tokens via URL redirects is highly insecure and prone to browser history and referral leakage.",
            "The authorization code encrypts the database.",
            "Auth codes are faster than tokens."
          ],
          answerIndex: 1,
          explanation: "Redirecting a token via the browser exposes it in URL histories, caching, and logs. Exchanging an Authorization Code server-to-server keeps the access token completely hidden from client exposure."
        }
      }
    ]
  },
  {
    id: "interview-execution",
    level: 5,
    title: "Pragmatic Interview Framework",
    description: "Master the exact step-by-step mental framework used by high-performing engineers to structure and ace any system design interview.",
    scenes: [
      {
        id: "int-s1",
        title: "Step 1 & 2: Requirements & Calculations",
        explanation: "Ace system design interviews by avoiding jumping straight into drawing nodes! \n\n1. **Requirements Gathering**: Spend 5-7 minutes asking clarifying questions. Define Functional Requirements (what the user can do) vs Non-Functional Requirements (Latency, Availability, Consistency).\n2. **Back-of-the-Envelope Math**: Estimate Daily Active Users (DAU), read/write ratios, QPS, bandwidth, and total storage required over 5 years. This informs database & caching sizing.",
        nodes: [
          { id: "user", position: { x: 50, y: 150 }, data: { label: "Requirements Phase", iconName: "FileText", color: "bg-blue-600" }, type: "custom" },
          { id: "calc", position: { x: 350, y: 150 }, data: { label: "Math (Capacity)", iconName: "Hash", color: "bg-indigo-600" }, type: "custom" },
          { id: "arch", position: { x: 650, y: 150 }, data: { label: "Target: 50k QPS, 500 TB Storage", iconName: "Layers", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "user", target: "calc", animated: true },
          { id: "e2", source: "calc", target: "arch", animated: true }
        ]
      },
      {
        id: "int-s2",
        title: "Step 3 & 4: API & Database Design",
        explanation: "Before creating the hardware map, nail down the contract:\n\n1. **API Design**: Define the exact endpoints (e.g., `POST /v1/photos`), request payloads, response payloads, and status codes. This forms the interface contract between front-end and back-end.\n2. **Database Schema**: Determine the data structure (e.g. relational tables vs key-value keys) and access paths based on read vs write patterns. Identify sharding keys and indexes early.",
        nodes: [
          { id: "api", position: { x: 100, y: 150 }, data: { label: "API Contracts (gRPC/REST)", iconName: "Route", color: "bg-purple-600" }, type: "custom" },
          { id: "db", position: { x: 450, y: 150 }, data: { label: "Schema & Indices", iconName: "Database", color: "bg-amber-600" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "api", target: "db", animated: true, label: "Binds Data Paths" }
        ],
        quiz: {
          question: "When should you design your database schema in a System Design interview?",
          options: [
            "At the very end of the interview in the last 2 minutes.",
            "Directly after defining functional requirements and calculating capacity/API contracts, as it establishes data representation early.",
            "Only if the interviewer explicitly requests it.",
            "Before understanding whether the system is read-heavy or write-heavy."
          ],
          answerIndex: 1,
          explanation: "Nailing the API design and Database schema early ensures your actual high-level diagram is structurally correct and grounded in reality rather than vague boxes."
        }
      }
    ]
  },
  {
    id: "bloom-filters",
    level: 4,
    title: "Bloom Filters (Space-Saving Checks)",
    description: "Learn how a highly memory-efficient probabilistic data structure prevents expensive database disk reads for non-existent keys.",
    scenes: [
      {
        id: "bf-s1",
        title: "The Problem: Pointless Disk Access",
        explanation: "In distributed databases like Cassandra, checking if a username or email exists requires traversing large indexes or searching files on disk (SSTables). If 95% of incoming queries look up non-existent accounts, the server wastes massive CPU and I/O doing disk seeks that return 'Not Found'.",
        nodes: [
          { id: "app", position: { x: 50, y: 150 }, data: { label: "Query Router", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "db", position: { x: 450, y: 150 }, data: { label: "Database Disk (SSTable Lookups)", iconName: "Database", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "app", target: "db", animated: true, label: "Pointless 'User404' disk lookup (SLOW!)", style: { stroke: '#ef4444' } }
        ]
      },
      {
        id: "bf-s2",
        title: "The Solution: In-Memory Bloom Filter",
        explanation: "A **Bloom Filter** is a simple bit-array in RAM. When data is written, it is hashed multiple times to flip corresponding bits to 1. \n\nWhen checking a key: \n1. If any hash yields a 0 bit, the key **definitely does not exist** (0% False Negatives). The database returns 'Not Found' instantly without touching the disk.\n2. If all bits are 1, the key **probably exists** (False Positives are possible), and we perform the disk lookup.",
        nodes: [
          { id: "app", position: { x: 50, y: 150 }, data: { label: "Query Router", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "bf", position: { x: 300, y: 50 }, data: { label: "Bloom Filter (RAM Bits: [0, 1, 0, 1])", iconName: "HardDrive", color: "bg-purple-600" }, type: "custom" },
          { id: "db", position: { x: 550, y: 150 }, data: { label: "Database Disk", iconName: "Database", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "app", target: "bf", animated: true, label: "1. Hash & Check Bits" },
          { id: "e2", source: "bf", target: "app", animated: true, label: "Any bit is 0 -> Stop & Fail Fast" },
          { id: "e3", source: "bf", target: "db", animated: true, label: "All bits are 1 -> Do disk check" }
        ],
        quiz: {
          question: "Which of the following is true about a Bloom Filter's accuracy guarantees?",
          options: [
            "It can have false negatives (saying a key doesn't exist when it actually does).",
            "It is 100% accurate and never makes mistakes.",
            "It can have false positives, but is 100% guaranteed to never have false negatives.",
            "It requires more storage space than the actual data."
          ],
          answerIndex: 2,
          explanation: "Bloom filters have a 0% false negative rate. If it tells you a key does not exist, it is mathematically impossible for it to exist. If it returns positive, there is a small configurable chance it is a collision."
        }
      }
    ]
  },
  {
    id: "distributed-locks",
    level: 5,
    title: "Distributed Locks & Concurrency",
    description: "Discover how clusters coordinate shared resources to prevent double-booking or double-spending using Redis Redlock and ZooKeeper.",
    scenes: [
      {
        id: "dl-s1",
        title: "The Race Condition",
        explanation: "In distributed microservices, multiple independent server pods execute concurrently. If two users click 'Book Last Seat' at the exact same millisecond, both pods will read `available_seats = 1` from the database, approve the checkout, and cause an overbooking.",
        nodes: [
          { id: "user1", position: { x: 50, y: 50 }, data: { label: "User A", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "user2", position: { x: 50, y: 250 }, data: { label: "User B", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "pod1", position: { x: 300, y: 50 }, data: { label: "Booking Pod 1", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "pod2", position: { x: 300, y: 250 }, data: { label: "Booking Pod 2", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "db", position: { x: 550, y: 150 }, data: { label: "Shared DB (Seats: 1)", iconName: "Database", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "user1", target: "pod1", animated: true },
          { id: "e1-b", source: "user2", target: "pod2", animated: true },
          { id: "e2", source: "pod1", target: "db", animated: true, label: "Read available_seats = 1" },
          { id: "e3", source: "pod2", target: "db", animated: true, label: "Read available_seats = 1 (RACE!)" }
        ]
      },
      {
        id: "dl-s2",
        title: "Distributed Coordination with Redis",
        explanation: "To solve race conditions, pods acquire a **Distributed Lock** before editing shared resources. \n\n1. Pod 1 requests a lock on `lock:flight_101` from Redis using an atomic `SET key value NX PX 5000` operation (NX = only if not exists, PX = 5-second TTL).\n2. Pod 1 acquires the lock, books the seat, and deletes the lock.\n3. While Pod 1 holds the lock, Pod 2's request is rejected (fails fast or retries), preventing conflicts.",
        nodes: [
          { id: "pod1", position: { x: 100, y: 50 }, data: { label: "Booking Pod 1 (Active)", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "pod2", position: { x: 100, y: 250 }, data: { label: "Booking Pod 2 (Waiting)", iconName: "Server", color: "bg-red-500" }, type: "custom" },
          { id: "redis", position: { x: 450, y: 150 }, data: { label: "Redis Cluster (Lock Active)", iconName: "HardDrive", color: "bg-rose-600" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "pod1", target: "redis", animated: true, label: "1. Lock Acquired (flight_101)" },
          { id: "e2", source: "pod2", target: "redis", animated: false, label: "2. Lock Denied (NX constraint)", style: { stroke: '#ef4444' } }
        ],
        quiz: {
          question: "Why is an expiration time (TTL) mandatory when establishing a distributed lock?",
          options: [
            "To speed up database transactions.",
            "To prevent the lock from being held forever if the worker crashes immediately after acquiring it.",
            "To encrypt the lock's payload data.",
            "To support consistent hashing."
          ],
          answerIndex: 1,
          explanation: "If a worker crashes or encounters network partitioning while holding a lock, it won't be able to delete it. A TTL ensures the lock automatically frees itself after a safety window."
        }
      }
    ]
  },
  {
    id: "gossip-protocol",
    level: 4,
    title: "Gossip Protocol (Decentralized State)",
    description: "Learn how masterless distributed databases spread cluster membership, health, and status updates like a rumor without a central coordinator.",
    scenes: [
      {
        id: "gp-s1",
        title: "The Heartbeat Bottleneck",
        explanation: "In standard centralized systems, a master coordinator server regularly pings (heartbeats) all other nodes to track their health. In a 5,000-node cluster, a single master node becomes a massive network bottleneck and a Single Point of Failure (SPOF).",
        nodes: [
          { id: "master", position: { x: 350, y: 150 }, data: { label: "Master Node (Overloaded)", iconName: "Server", color: "bg-red-500" }, type: "custom" },
          { id: "n1", position: { x: 100, y: 50 }, data: { label: "Node 1", iconName: "Server", color: "bg-zinc-700" }, type: "custom" },
          { id: "n2", position: { x: 100, y: 250 }, data: { label: "Node 2", iconName: "Server", color: "bg-zinc-700" }, type: "custom" },
          { id: "n3", position: { x: 600, y: 50 }, data: { label: "Node 3", iconName: "Server", color: "bg-zinc-700" }, type: "custom" },
          { id: "n4", position: { x: 600, y: 250 }, data: { label: "Node 4", iconName: "Server", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "master", target: "n1", animated: true },
          { id: "e2", source: "master", target: "n2", animated: true },
          { id: "e3", source: "master", target: "n3", animated: true },
          { id: "e4", source: "master", target: "n4", animated: true }
        ]
      },
      {
        id: "gp-s2",
        title: "Peer-to-Peer Rumor Spreading",
        explanation: "With **Gossip Protocol**, there is no master. Every second, each node selects 1 to 3 random peers and shares its active state (the 'membership list'). \n\nWhen Node 1 detects that Node 2 has crashed, it records this and gossips it to Node 4. Node 4 gossips it to Node 3. Like a rumor, the crash update spreads exponentially ($O(\log N)$ steps) across thousands of nodes within seconds.",
        nodes: [
          { id: "n1", position: { x: 150, y: 50 }, data: { label: "Node A (Detects Node B Dead)", iconName: "Server", color: "bg-blue-600" }, type: "custom" },
          { id: "n2", position: { x: 150, y: 250 }, data: { label: "Node B (DEAD)", iconName: "Server", color: "bg-red-900" }, type: "custom" },
          { id: "n3", position: { x: 450, y: 50 }, data: { label: "Node C", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "n4", position: { x: 450, y: 250 }, data: { label: "Node D", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "n1", target: "n3", animated: true, label: "Gossip: 'B is dead!'" },
          { id: "e2", source: "n3", target: "n4", animated: true, label: "Spread: 'B is dead!'" }
        ],
        quiz: {
          question: "Which of the following describes a key advantage of Gossip Protocol?",
          options: [
            "It guarantees absolute 100% immediate consistency across all nodes.",
            "It is highly decentralized, fault-tolerant, and scales seamlessly to tens of thousands of nodes without bottlenecking.",
            "It completely replaces the need for a persistent database.",
            "It reduces the size of data files on disk."
          ],
          answerIndex: 1,
          explanation: "Gossip protocol is masterless and highly robust. Because nodes communicate randomly and peer-to-peer, the failure of individual nodes has zero impact on the dissemination of membership and state updates."
        }
      }
    ]
  },
  {
    id: "consistent-hashing-lesson",
    level: 3,
    title: "Consistent Hashing & Ring Routing",
    description: "Learn how consistent hashing solves the re-sharding storm on scaling clusters by mapping keys and nodes to a circular hash space.",
    scenes: [
      {
        id: "ch-s1",
        title: "The Hash Ring Concept",
        explanation: "In consistent hashing, both servers (nodes) and cache keys are hashed onto a circular space (often called a 'Ring', representing 0 to 2^32-1). To find which server holds a key, we hash the key, locate its position on the ring, and travel clockwise until we hit the first server node. This maps keys to servers elegantly.",
        nodes: [
          { id: "nodeA", position: { x: 350, y: 50 }, data: { label: "Server A (0°)", iconName: "Server", color: "bg-blue-600" }, type: "custom" },
          { id: "nodeB", position: { x: 550, y: 200 }, data: { label: "Server B (120°)", iconName: "Server", color: "bg-emerald-600" }, type: "custom" },
          { id: "nodeC", position: { x: 150, y: 200 }, data: { label: "Server C (240°)", iconName: "Server", color: "bg-amber-600" }, type: "custom" },
          { id: "key1", position: { x: 450, y: 120 }, data: { label: "Key: 'user_45' (45°)", iconName: "FileText", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "key1", target: "nodeB", animated: true, label: "Clockwise routing to Server B", style: { stroke: '#10b981', strokeWidth: 2 } }
        ]
      },
      {
        id: "ch-s2",
        title: "Scale Ring (Add/Remove Nodes)",
        explanation: "When you add a new server node (e.g., Server D at 60°), only the keys lying between Server A (0°) and Server D (60°) need to be remapped to the new server. All other keys (like from 60° to 360°) remain on their existing servers. This restricts the data migration to a tiny fraction of keys (1/N on average), preventing system storms.",
        nodes: [
          { id: "nodeA", position: { x: 350, y: 50 }, data: { label: "Server A (0°)", iconName: "Server", color: "bg-blue-600" }, type: "custom" },
          { id: "nodeD", position: { x: 500, y: 100 }, data: { label: "Server D (60° - NEW)", iconName: "Server", color: "bg-purple-600" }, type: "custom" },
          { id: "nodeB", position: { x: 550, y: 200 }, data: { label: "Server B (120°)", iconName: "Server", color: "bg-emerald-600" }, type: "custom" },
          { id: "key1", position: { x: 420, y: 80 }, data: { label: "Key: 'user_45' (45°)", iconName: "FileText", color: "bg-zinc-700" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "key1", target: "nodeD", animated: true, label: "Migrates Clockwise to Server D", style: { stroke: '#8b5cf6', strokeWidth: 3 } }
        ],
        quiz: {
          question: "How does consistent hashing differ from traditional hash sharding (hash(key) % N)?",
          options: [
            "Consistent hashing does not use any hash functions.",
            "Consistent hashing requires storing all key-node mapping tables in a SQL master table.",
            "In traditional hashing, adding a node changes the divisor (N), which completely invalidates almost all existing mappings. Consistent hashing only invalidates keys adjacent to the new node.",
            "Consistent hashing is slower and more volatile."
          ],
          answerIndex: 2,
          explanation: "Traditional hash sharding causes a 're-sharding storm' because N changes, altering the destination server for nearly 100% of keys. Consistent hashing maps to a circle where only the neighbor segment is impacted."
        }
      }
    ]
  },
  {
    id: "consensus-raft-lesson",
    level: 4,
    title: "Consensus Protocols & Raft Quorums",
    description: "Discover how multiple database replicas reach agreement and maintain a unified cluster state despite machine crashes and network partitions.",
    scenes: [
      {
        id: "raft-s1",
        title: "The Quorum Requirement",
        explanation: "To guarantee distributed safety, consensus protocols require that any write or leader election is acknowledged by a Quorum (majority) of nodes. For a cluster of N nodes, Quorum is at least (N/2) + 1. This prevents a network split from creating two separate master nodes (Split-Brain).",
        nodes: [
          { id: "n1", position: { x: 100, y: 150 }, data: { label: "Node A (Follower)", iconName: "Server", color: "bg-zinc-800" }, type: "custom" },
          { id: "n2", position: { x: 300, y: 150 }, data: { label: "Node B (Leader)", iconName: "Server", color: "bg-emerald-600" }, type: "custom" },
          { id: "n3", position: { x: 500, y: 150 }, data: { label: "Node C (Follower)", iconName: "Server", color: "bg-zinc-800" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "n2", target: "n1", animated: true, label: "Replicate & Commit", style: { stroke: '#10b981' } },
          { id: "e2", source: "n2", target: "n3", animated: true, label: "Replicate & Commit", style: { stroke: '#10b981' } }
        ]
      },
      {
        id: "raft-s2",
        title: "Raft Leader Election",
        explanation: "In Raft, if a follower node ceases to hear the periodic 'heartbeats' from the active leader due to network loss or leader crash, its election timeout triggers. It transits to CANDIDATE state, increments the term index, and polls peers. Once it collects votes from a Quorum (e.g., 2 out of 3 nodes), it becomes the LEADER.",
        nodes: [
          { id: "n1", position: { x: 100, y: 50 }, data: { label: "Node A (Candidate)", iconName: "Server", color: "bg-blue-600" }, type: "custom" },
          { id: "n2", position: { x: 350, y: 150 }, data: { label: "Node B (CRASHED)", iconName: "Server", color: "bg-red-950" }, type: "custom" },
          { id: "n3", position: { x: 600, y: 50 }, data: { label: "Node C (Granted Vote)", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "n1", target: "n3", animated: true, label: "RequestVote / VoteGranted", style: { stroke: '#10b981', strokeWidth: 2 } }
        ],
        quiz: {
          question: "In a 5-node consensus cluster (e.g., using Raft or Paxos), how many nodes can crash simultaneously before the cluster loses the ability to write new updates?",
          options: [
            "1 node",
            "2 nodes",
            "3 nodes",
            "4 nodes"
          ],
          answerIndex: 1,
          explanation: "In a 5-node cluster, a quorum requires at least 3 active nodes (5/2 + 1 = 3). If 2 nodes crash, 3 remain healthy, allowing consensus to function. If 3 nodes crash, only 2 remain, which is less than a majority, disabling writes."
        }
      }
    ]
  },
  {
    id: "circuit-breaker-lesson",
    level: 4,
    title: "Fault Tolerant Resilience: Circuit Breakers",
    description: "Prevent cascading failures in complex microservices. Learn how to wrap remote calls in a state machine to block failing downstream requests and protect resources.",
    scenes: [
      {
        id: "cb-s1",
        title: "The Problem: Cascading Failure",
        explanation: "If Service A calls Service B, and Service B experiences slow response times or crashes, Service A's thread pools quickly become exhausted waiting for responses. This block spreads back upstream, causing Service A to crash and triggering a total system blackout.",
        nodes: [
          { id: "gateway", position: { x: 50, y: 150 }, data: { label: "API Gateway", iconName: "API Gateway", color: "bg-purple-600" }, type: "custom" },
          { id: "app", position: { x: 300, y: 150 }, data: { label: "Service A (Thread Pool Starved)", iconName: "Server", color: "bg-red-500", cpu: 100 }, type: "custom" },
          { id: "db", position: { x: 600, y: 150 }, data: { label: "Service B (SLOW / CRASHED)", iconName: "Server", color: "bg-red-950" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "gateway", target: "app", animated: true, label: "Blocking Traffic", style: { stroke: '#ef4444' } },
          { id: "e2", source: "app", target: "db", animated: true, label: "Waiting for HTTP Timeout (10s)", style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "cb-s2",
        title: "The Circuit Breaker Pattern",
        explanation: "A **Circuit Breaker** acts as a safety switch. Under normal operation, it is **CLOSED**. If the failure rate crosses a threshold (e.g., 3 failures), the circuit trips **OPEN**, instantly failing subsequent requests with a local fallback response without calling Service B. This gives Service B time to heal and prevents thread starvation.",
        nodes: [
          { id: "gateway", position: { x: 50, y: 150 }, data: { label: "API Gateway", iconName: "API Gateway", color: "bg-purple-600" }, type: "custom" },
          { id: "cb", position: { x: 300, y: 150 }, data: { label: "Circuit Breaker (OPEN)", iconName: "Shield", color: "bg-red-600" }, type: "custom" },
          { id: "db", position: { x: 600, y: 150 }, data: { label: "Service B (Offline)", iconName: "Server", color: "bg-zinc-800" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "gateway", target: "cb", animated: true, label: "Call Rejected Fast" },
          { id: "e2", source: "cb", target: "db", animated: false, label: "Blocked (No call)", style: { stroke: '#9ca3af', strokeDasharray: '5,5' } }
        ],
        quiz: {
          question: "What is the purpose of the 'HALF-OPEN' state in a Circuit Breaker?",
          options: [
            "To allow half the normal traffic to access the database.",
            "To send a limited number of test requests to the failing service to see if it has recovered, returning to CLOSED if they succeed.",
            "To encrypt the outbound payloads during failures.",
            "To load balance between two alternate services."
          ],
          answerIndex: 1,
          explanation: "In HALF-OPEN state, the breaker permits a small 'canary' test sample of requests. If they fail, it transits back to OPEN. If they succeed, it transits to CLOSED to resume regular traffic."
        }
      }
    ]
  }
];

