export interface VisualNode {
  id: string;
  label: string;
  role?: string;
  type?: 'client' | 'proxy' | 'server' | 'db' | 'cache' | 'queue' | 'cloud' | 'alert' | 'text' | 'security' | 'gateway';
}

export interface VisualConnection {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  visual?: {
    type: 'flow' | 'grid' | 'comparison' | 'cycle' | 'layers';
    nodes: VisualNode[];
    connections: VisualConnection[];
  };
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // --- CATEGORY 1: SYSTEM FUNDAMENTALS & NETWORKING ---
  {
    id: "q1",
    category: "System Fundamentals & Networking",
    question: "What are the core differences between TCP and UDP, and when should you choose one over the other in a system design?",
    answer: "**TCP (Transmission Control Protocol)** is connection-oriented and guarantees reliable, ordered, and error-checked delivery of stream data. It achieves this via a three-way handshake, sequence numbers, acknowledgment packets (ACKs), and congestion control mechanisms.\n\n**UDP (User Datagram Protocol)** is connectionless, lightweight, and offers no guarantees for delivery, ordering, or duplicate protection. It simply sends packet payloads directly.\n\n**Decision Criteria:**\n- **Choose TCP** for transactional systems, APIs, database connections, and file transfers (e.g., HTTP, SSH, FTP) where data integrity is paramount.\n- **Choose UDP** for real-time video streaming, VOIP, multiplayer gaming, and DNS resolution where speed and low latency are critical and minor packet loss is acceptable.",
    visual: {
      type: "comparison",
      nodes: [
        { id: "tcp-client", label: "Client", type: "client" },
        { id: "tcp-server", label: "TCP Server (Reliable)", type: "server", role: "Handshake + ACKs" },
        { id: "udp-client", label: "Client", type: "client" },
        { id: "udp-server", label: "UDP Server (Fast)", type: "server", role: "No connection state" }
      ],
      connections: [
        { from: "tcp-client", to: "tcp-server", label: "1. Syn -> 2. Syn-Ack -> 3. Ack", animated: true },
        { from: "udp-client", to: "udp-server", label: "Fire & Forget Packets", animated: true }
      ]
    }
  },
  {
    id: "q2",
    category: "System Fundamentals & Networking",
    question: "Explain the difference between HTTP/1.1, HTTP/2, and HTTP/3. How does multiplexing solve head-of-line blocking?",
    answer: "- **HTTP/1.1**: Uses a single TCP connection per request/response, or reuses connections via keep-alive. It suffers from **Head-of-Line (HOL) blocking** at the application layer: if a request is slow, all subsequent requests on that connection are blocked.\n- **HTTP/2**: Introduces **Multiplexing** over a single TCP connection by breaking requests down into binary frames. This allows multiple concurrent requests/responses to slide down the wire in parallel, eliminating HTTP-level HOL blocking. However, it still suffers from TCP-level HOL blocking (if a TCP packet drops, the entire connection halts).\n- **HTTP/3**: Solves TCP-level HOL blocking by running over **QUIC (Quick UDP Internet Connections)**. Each stream in HTTP/3 is independent, meaning a packet drop in Stream A has zero impact on Stream B.",
    visual: {
      type: "flow",
      nodes: [
        { id: "browser", label: "Web Browser", type: "client" },
        { id: "h1", label: "HTTP/1.1 (Queued TCP)", type: "proxy", role: "HOL Blocked" },
        { id: "h2", label: "HTTP/2 (Multiplexed TCP)", type: "proxy", role: "Binary Frames" },
        { id: "h3", label: "HTTP/3 (QUIC / UDP)", type: "proxy", role: "Zero TCP Block" },
        { id: "server", label: "App Server", type: "server" }
      ],
      connections: [
        { from: "browser", to: "h1", label: "Sequential", animated: false },
        { from: "browser", to: "h2", label: "Parallel Streams", animated: true },
        { from: "browser", to: "h3", label: "QUIC Streams (UDP)", animated: true },
        { from: "h1", to: "server" },
        { from: "h2", to: "server" },
        { from: "h3", to: "server" }
      ]
    }
  },
  {
    id: "q3",
    category: "System Fundamentals & Networking",
    question: "Describe the step-by-step resolution flow of a DNS lookup. What is the difference between an A record and a CNAME?",
    answer: "When a user requests `example.com`:\n1. **Local Cache / Browser Cache**: Checked first. If missing, requests the Local DNS Resolver (usually ISP).\n2. **Root Nameserver**: Local Resolver queries Root (`.`), which returns the address of the Top-Level Domain (TLD) server (e.g., `.com`).\n3. **TLD Nameserver**: Resolver queries TLD nameserver, which returns the Authoritative Nameserver IP for `example.com`.\n4. **Authoritative Nameserver**: Resolver queries this nameserver, which returns the actual IP address.\n5. **Caching**: Resolver saves the IP locally with a Time-To-Live (TTL) value and returns it to the browser.\n\n**A Record vs. CNAME:**\n- **A Record**: Maps a domain name directly to an IPv4 address (e.g., `example.com -> 192.0.2.1`).\n- **CNAME (Canonical Name)**: Maps a domain name to another domain name (e.g., `www.example.com -> example.com` or `cdn.com -> lb.awsdns.com`). It triggers an additional DNS resolution step.",
    visual: {
      type: "flow",
      nodes: [
        { id: "browser", label: "Client Browser", type: "client" },
        { id: "resolver", label: "ISP DNS Resolver", type: "proxy" },
        { id: "root", label: "Root Server (.)", type: "server" },
        { id: "tld", label: "TLD Server (.com)", type: "server" },
        { id: "auth", label: "Authoritative NS", type: "server", role: "Holds A/CNAME Records" }
      ],
      connections: [
        { from: "browser", to: "resolver", label: "1. Query", animated: true },
        { from: "resolver", to: "root", label: "2. Get .com IP", animated: false },
        { from: "resolver", to: "tld", label: "3. Get domain NS", animated: false },
        { from: "resolver", to: "auth", label: "4. Get A Record IP", animated: true },
        { from: "resolver", to: "browser", label: "5. Return 192.0.2.1", animated: true }
      ]
    }
  },
  {
    id: "q4",
    category: "System Fundamentals & Networking",
    question: "What is the difference between Layer 4 and Layer 7 Load Balancing? When would you use each?",
    answer: "- **Layer 4 Load Balancing (Transport Layer)**: Routes traffic based on network details like IP address and TCP/UDP ports, without looking at the application payload. It is incredibly fast, consumes low CPU, and is highly secure since it does not decrypt traffic (SSL/TLS passthrough).\n- **Layer 7 Load Balancing (Application Layer)**: Inspects the actual HTTP/HTTPS request, including cookies, headers, URL paths, and query parameters. It allows smart routing (e.g., sending `/api/videos` to a video service), rate limiting, SSL termination, and cookie-based sticky sessions.\n\n**When to use:**\n- Use **Layer 4** for raw TCP performance, database replication clusters, or as an entry point load balancer routing to a fleet of downstream Layer 7 proxies.\n- Use **Layer 7** for microservices, API request routing, CDN edge integration, and path-based routing.",
    visual: {
      type: "layers",
      nodes: [
        { id: "client", label: "Incoming Client Traffic", type: "client" },
        { id: "l4", label: "L4 Load Balancer (TCP/IP IP:Port)", type: "proxy", role: "Fast Packet Forwarding" },
        { id: "l7", label: "L7 Load Balancer (Path: /api/checkout)", type: "gateway", role: "Inspects Headers & Cookies" },
        { id: "svc-auth", label: "Auth Service", type: "server" },
        { id: "svc-pay", label: "Payment Service", type: "server" }
      ],
      connections: [
        { from: "client", to: "l4", animated: true },
        { from: "l4", to: "l7", animated: true },
        { from: "l7", to: "svc-auth", label: "Route to /auth", animated: false },
        { from: "l7", to: "svc-pay", label: "Route to /checkout", animated: true }
      ]
    }
  },
  {
    id: "q5",
    category: "System Fundamentals & Networking",
    question: "Compare Forward Proxies and Reverse Proxies. What are their primary use cases?",
    answer: "- **Forward Proxy (Client-Side)**: Acts as an intermediary for a client (or group of clients) requesting resources from external servers. It hides the identity of the client. Use cases: bypassing geoblocks, caching external sites, filtering content in corporate networks.\n- **Reverse Proxy (Server-Side)**: Acts as an intermediary on behalf of web servers. Clients send requests to the reverse proxy, which routes them to internal backend servers. It hides the server identities. Use cases: Load balancing, SSL termination, web acceleration/caching, DDoS protection, rate limiting.",
    visual: {
      type: "flow",
      nodes: [
        { id: "c1", label: "Private Client A", type: "client" },
        { id: "c2", label: "Private Client B", type: "client" },
        { id: "fwd", label: "Forward Proxy", type: "proxy", role: "Hides Client IPs" },
        { id: "internet", label: "Public Web", type: "cloud" },
        { id: "rev", label: "Reverse Proxy", type: "proxy", role: "Hides Backend Servers" },
        { id: "s1", label: "App Server 1", type: "server" },
        { id: "s2", label: "App Server 2", type: "server" }
      ],
      connections: [
        { from: "c1", to: "fwd" },
        { from: "c2", to: "fwd" },
        { from: "fwd", to: "internet", animated: true },
        { from: "internet", to: "rev", animated: true },
        { from: "rev", to: "s1" },
        { from: "rev", to: "s2" }
      ]
    }
  },
  {
    id: "q6",
    category: "System Fundamentals & Networking",
    question: "How do Content Delivery Networks (CDNs) work? Compare Push vs. Pull caching models.",
    answer: "A **CDN** is a globally distributed network of edge proxy servers. It caches static assets (images, HTML, CSS, videos) close to users, reducing latency and backend load.\n\n**Push vs. Pull Models:**\n- **Pull CDN (Query-on-demand)**: When a user requests an asset, the edge server checks its cache. If it's a miss, it pulls the asset from the origin server, caches it locally for future users, and returns it. Best for large websites with high-traffic assets that change infrequently.\n- **Push CDN (Pre-publish)**: The origin server proactively uploads (pushes) assets to the CDN nodes whenever they are created or updated. Best for small, infrequently updated sites, or time-sensitive releases (e.g., software updates).",
    visual: {
      type: "flow",
      nodes: [
        { id: "user", label: "User (Singapore)", type: "client" },
        { id: "edge", label: "Edge Node (Singapore Cache)", type: "cache", role: "Fast Delivery" },
        { id: "origin", label: "Origin Server (New York)", type: "server", role: "Primary Store" }
      ],
      connections: [
        { from: "user", to: "edge", label: "1. Request Asset", animated: true },
        { from: "edge", to: "origin", label: "2. Pull if Cache Miss (Only once!)", animated: false },
        { from: "edge", to: "user", label: "3. Return Cached Asset", animated: true }
      ]
    }
  },

  // --- CATEGORY 2: CORE DISTRIBUTED SYSTEMS THEORY ---
  {
    id: "q7",
    category: "Core Distributed Systems Theory",
    question: "What is the CAP Theorem? Explain how partitions force a choice between Consistency and Availability.",
    answer: "The **CAP Theorem** states that a distributed system can guarantee at most two out of three characteristics:\n1. **Consistency (C)**: Every read receives the most recent write or an error.\n2. **Availability (A)**: Every non-failing node returns a non-error response (without a guarantee of latest write).\n3. **Partition Tolerance (P)**: The system continues to operate despite arbitrary message loss or system partitioning.\n\n**The Trade-off:**\nSince networks are physically prone to fiber cuts or packet loss, **Partition Tolerance (P) is non-negotiable** for distributed systems. Therefore, during a network partition, you must choose:\n- **CP (Consistency)**: Halt writes or refuse reads on partition shards to prevent out-of-sync states (sacrificing Availability).\n- **AP (Availability)**: Accept reads and writes on isolated shards, leading to diverging data across nodes (sacrificing Consistency).",
    visual: {
      type: "comparison",
      nodes: [
        { id: "n1", label: "Node A (Writes 'X=2')", type: "server", role: "AP Node" },
        { id: "n2", label: "Node B (Reads stale 'X=1')", type: "server", role: "Isolated by Partition" },
        { id: "part", label: "NETWORK PARTITION", type: "alert" }
      ],
      connections: [
        { from: "n1", to: "part", animated: false },
        { from: "part", to: "n2", animated: false }
      ]
    }
  },
  {
    id: "q8",
    category: "Core Distributed Systems Theory",
    question: "What is the PACELC Theorem, and how does it extend the CAP Theorem?",
    answer: "The **PACELC Theorem** extends CAP by addressing what happens during *normal operations* (when there is no network partition).\n\n**The Formula:**\n- If there is a **P**artition, trade off **A**vailability vs **C**onsistency.\n- **E**lse (normal operations), trade off **L**atency vs **C**onsistency.\n\n**Why it matters:**\nEven when the network is healthy, a database must choose whether to wait for replicas to acknowledge writes before returning success (ensuring Consistency at the expense of Latency) or write locally and replicate asynchronously (ensuring low Latency at the expense of immediate consistency). Examples: MongoDB is PC/EC; Cassandra is PA/EL.",
    visual: {
      type: "cycle",
      nodes: [
        { id: "p", label: "Partition?", type: "text" },
        { id: "cap", label: "Choose: Availability (A) vs Consistency (C)", type: "alert" },
        { id: "pacelc", label: "Choose: Latency (L) vs Consistency (C)", type: "text" }
      ],
      connections: [
        { from: "p", to: "cap", label: "Yes (Network split)" },
        { from: "p", to: "pacelc", label: "No (Normal state)", animated: true }
      ]
    }
  },
  {
    id: "q9",
    category: "Core Distributed Systems Theory",
    question: "Define Eventual Consistency, Strong Consistency, Causal Consistency, and Read-Your-Writes Consistency.",
    answer: "- **Strong Consistency**: Readers always see the absolute latest written state. High latency because the system must sync and lock multiple nodes before acknowledging a write.\n- **Eventual Consistency**: Replicas sync asynchronously. Readers might see stale data temporarily, but if no new writes occur, all nodes eventually converge on the same state.\n- **Causal Consistency**: If Event A causes Event B, every reader will see Event A before Event B.\n- **Read-Your-Writes**: A specific client is guaranteed to always read their own updates instantly, even if other users see eventual stale states (commonly achieved by pinning a user to their local database node for a short window after they make a write).",
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "User A (Write X=10)", type: "client" },
        { id: "leader", label: "Primary Node (X=10)", type: "server" },
        { id: "replica", label: "Replica Node (X=0)", type: "server", role: "Syncing eventually..." },
        { id: "userB", label: "User B (Read X=0)", type: "client", role: "Sees stale data" }
      ],
      connections: [
        { from: "client", to: "leader", label: "Commit write", animated: true },
        { from: "leader", to: "replica", label: "Async replication (delayed)", animated: false },
        { from: "userB", to: "replica", label: "Read operation", animated: true }
      ]
    }
  },
  {
    id: "q10",
    category: "Core Distributed Systems Theory",
    question: "Compare ACID and BASE transaction properties.",
    answer: "**ACID (Relational / SQL):** Focuses on strict data integrity and predictability.\n- **Atomicity**: All operations in a transaction succeed or all fail (no partial states).\n- **Consistency**: Moves database from one valid state to another, enforcing schemas.\n- **Isolation**: Concurrent transactions execute without interfering with one another.\n- **Durability**: Committed data is written to non-volatile storage and survived crashes.\n\n**BASE (NoSQL):** Focuses on performance, availability, and scale.\n- **Basically Available**: The system remains operational even if shards fail.\n- **Soft State**: Data can change over time without user interaction due to lazy replication.\n- **Eventual Consistency**: The nodes will synchronize and reach matching states over time.",
    visual: {
      type: "comparison",
      nodes: [
        { id: "acid", label: "ACID (SQL Database)", type: "db", role: "Strict, locked, consistent" },
        { id: "base", label: "BASE (NoSQL Cassandra)", type: "db", role: "Fast, lazy sync, massive scale" }
      ],
      connections: []
    }
  },
  {
    id: "q11",
    category: "Core Distributed Systems Theory",
    question: "Explain the basic concept of distributed consensus. Compare Paxos and Raft.",
    answer: "Distributed consensus algorithms ensure a cluster of independent machines agree on a sequence of inputs or system state (e.g., who is the master leader or database sequence), even if some nodes fail.\n\n**Raft vs. Paxos:**\n- **Paxos**: The original, highly abstract, and notoriously difficult-to-understand protocol. It operates through phases of proposals, accepts, and commits.\n- **Raft**: Designed specifically to be understandable. It divides consensus into explicit sub-problems: **Leader Election** (nodes elect a single master leader), **Log Replication** (the leader accepts writes, appends them to its log, and forces followers to clone the log), and **Safety**.",
    visual: {
      type: "flow",
      nodes: [
        { id: "leader", label: "Raft Leader", type: "server", role: "Accepts Writes" },
        { id: "f1", label: "Follower A", type: "server" },
        { id: "f2", label: "Follower B", type: "server" }
      ],
      connections: [
        { from: "leader", to: "f1", label: "Replicate Log Entry", animated: true },
        { from: "leader", to: "f2", label: "Replicate Log Entry", animated: true },
        { from: "f1", to: "leader", label: "Acknowledge Commit", animated: false }
      ]
    }
  },
  {
    id: "q12",
    category: "Core Distributed Systems Theory",
    question: "Why are physical clocks unreliable in distributed systems? How do Lamport Clocks solve ordering?",
    answer: "Distributed physical wall clocks rely on crystal oscillators, which drift due to heat and manufacturing tolerances. Synchronizing them via **Network Time Protocol (NTP)** still has milliseconds of latency, making it impossible to determine the true causal sequence of two rapid events on separate nodes.\n\n**Lamport Clocks** solve this logically without physical time:\n1. Each node maintains a simple integer counter starting at 0.\n2. Before executing an event, a node increments its local counter by 1.\n3. When sending a message, the node attaches its counter.\n4. When receiving a message, the recipient sets its clock to `max(local_clock, message_clock) + 1`.\nThis establishes a strict **happened-before** relationship.",
    visual: {
      type: "flow",
      nodes: [
        { id: "na", label: "Node A [Clock: 1]", type: "server" },
        { id: "nb", label: "Node B [Clock: 0]", type: "server", role: "Receives msg" },
        { id: "nb2", label: "Node B [New Clock: max(0,1)+1 = 2]", type: "server" }
      ],
      connections: [
        { from: "na", to: "nb", label: "Send Message (Clock=1)", animated: true },
        { from: "nb", to: "nb2", label: "Local update", animated: false }
      ]
    }
  },

  // --- CATEGORY 3: DATA STORAGE & DATABASES ---
  {
    id: "q13",
    category: "Data Storage & Databases",
    question: "Explain B-Trees vs. LSM-Trees. Which is better for writes?",
    answer: "- **B-Trees (SQL databases like PostgreSQL, MySQL)**: High-performance, self-balancing tree structures kept on disk. Reads are extremely fast ($O(\log N)$) because data is heavily organized in structured pages. However, writes require in-place updates, leading to random disk I/O, which is expensive.\n- **LSM-Trees (NoSQL like Cassandra, ScyllaDB, LevelDB)**: Writes land in-memory first (**MemTable**) and are written sequentially to append-only files on disk (**SSTables**) in batches. This makes LSM-Trees **significantly faster for write-heavy workloads** because sequential I/O is vastly cheaper than random page updates on disk. Disk compaction runs asynchronously in the background.",
    visual: {
      type: "layers",
      nodes: [
        { id: "write", label: "Incoming Writes", type: "client" },
        { id: "mem", label: "MemTable (RAM - Super Fast)", type: "cache" },
        { id: "disk", label: "SSTable (Disk - Sequential Batch)", type: "db", role: "Append-Only Files" }
      ],
      connections: [
        { from: "write", to: "mem", animated: true },
        { from: "mem", to: "disk", label: "Asynchronous Flush", animated: true }
      ]
    }
  },
  {
    id: "q14",
    category: "Data Storage & Databases",
    question: "Describe Database Sharding. Compare Horizontal Sharding vs. Vertical Partitioning.",
    answer: "- **Vertical Partitioning**: Splitting a single table's columns across multiple tables or databases. For example, moving a large `profile_picture_blob` column out of the primary `users` table into a separate `user_media` database. Helps cache dense text rows.\n- **Horizontal Sharding**: Splitting rows of a table across multiple database servers based on a **Shard Key**. For example, routing all user accounts with IDs 1 to 1M to Shard A, and IDs 1M+ to Shard B. This scales database storage and write throughput infinitely.",
    visual: {
      type: "grid",
      nodes: [
        { id: "router", label: "Query Router (Shard Key: User_ID)", type: "proxy" },
        { id: "s1", label: "Shard A (Users 1-1M)", type: "db" },
        { id: "s2", label: "Shard B (Users 1M-2M)", type: "db" }
      ],
      connections: [
        { from: "router", to: "s1", label: "IDs < 1M", animated: true },
        { from: "router", to: "s2", label: "IDs >= 1M", animated: false }
      ]
    }
  },
  {
    id: "q15",
    category: "Data Storage & Databases",
    question: "What is Consistent Hashing? How does it prevent re-sharding when nodes are added or removed?",
    answer: "In standard sharding, routing is determined by `hash(key) % N` where N is the number of servers. If a server is added or removed, N changes, invalidating almost all mapped keys and forcing a massive data migration.\n\n**Consistent Hashing** maps both Servers and Keys to a conceptual circular ring (usually 0 to $2^{32}-1$). To locate a server for a key, the algorithm hashes the key and travels **clockwise** until it encounters the first server. If a server is added or removed, **only a fraction of keys** (typically $1/N$) need to be rehashed and migrated.",
    visual: {
      type: "cycle",
      nodes: [
        { id: "ring", label: "Consistent Hash Ring (0 to 2^32)", type: "text" },
        { id: "s1", label: "Server A (Position 100)", type: "server" },
        { id: "s2", label: "Server B (Position 500)", type: "server" },
        { id: "key", label: "Key X (Position 150)", type: "db", role: "Maps to Server B (Clockwise)" }
      ],
      connections: [
        { from: "key", to: "s2", label: "Travel Clockwise", animated: true }
      ]
    }
  },
  {
    id: "q16",
    category: "Data Storage & Databases",
    question: "How do search engines implement fast text matches? What is an Inverted Index?",
    answer: "Relational database indexes (B-Trees) are slow for partial text matches (e.g., finding articles containing 'distributed systems' using `%distributed%`).\n\nSearch engines like **Elasticsearch** and **Lucene** use an **Inverted Index**. When documents are ingested, they are split into individual unique words (tokens). The index maps each unique token to a list of Document IDs where that token appears. Looking up a word is an instant $O(1)$ dictionary fetch.",
    visual: {
      type: "flow",
      nodes: [
        { id: "term", label: "Token: 'Consistent'", type: "text" },
        { id: "docs", label: "Document Registry Map", type: "db", role: "Docs: [DocId_4, DocId_12, DocId_99]" }
      ],
      connections: [
        { from: "term", to: "docs", label: "Instant Map Fetch", animated: true }
      ]
    }
  },
  {
    id: "q17",
    category: "Data Storage & Databases",
    question: "What are Vector Databases, and why are they crucial for modern AI and RAG pipelines?",
    answer: "Modern AI models represent text, images, and audio as **dense numerical vectors (embeddings)** (e.g., a 1536-dimensional array of floats). Standard indexes cannot perform proximity searches on high-dimensional vectors.\n\n**Vector Databases** (like Pinecone, Milvus, or pgvector) index these embeddings using specialized algorithms (like HNSW - Hierarchical Navigable Small World) to perform sub-millisecond **Approximate Nearest Neighbor (ANN)** similarity search. In RAG pipelines, we vectorize user queries, find matching semantic text passages in the vector DB, and feed those passages as context into an LLM.",
    visual: {
      type: "flow",
      nodes: [
        { id: "q", label: "User Prompt", type: "client" },
        { id: "llm", label: "Embeddings Model", type: "server", role: "Vectorizes input text" },
        { id: "vdb", label: "Vector DB (Pinecone)", type: "db", role: "HNSW ANN Match" },
        { id: "ctx", label: "Retrieved Context", type: "text" }
      ],
      connections: [
        { from: "q", to: "llm", animated: true },
        { from: "llm", to: "vdb", label: "Search Vector", animated: true },
        { from: "vdb", to: "ctx", label: "Match Passages", animated: false }
      ]
    }
  },

  // --- CATEGORY 4: CACHING STRATEGIES ---
  {
    id: "q18",
    category: "Caching Strategies",
    question: "Compare Write-Through, Write-Around, and Write-Back cache policies.",
    answer: "- **Write-Through**: Data is written to the cache and the database simultaneously before acknowledging success. Pros: cache is never stale, extremely safe. Cons: slow writes.\n- **Write-Around**: Data is written directly to the database, completely bypassing the cache. The cache entry is only loaded on a subsequent read miss. Pros: prevents the cache from being flooded with write data that might never be read again. Cons: slow read on first access.\n- **Write-Back (Write-Deferred)**: Data is written to the cache instantly, and the system acknowledges success immediately. The cached writes are queued and flushed to the database asynchronously in batches. Pros: blazing fast writes. Cons: risk of data loss if the cache node crashes before flushing.",
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "Client App", type: "client" },
        { id: "cache", label: "Redis Cache", type: "cache" },
        { id: "db", label: "PostgreSQL DB", type: "db" }
      ],
      connections: [
        { from: "client", to: "cache", label: "1. Rapid local commit", animated: true },
        { from: "cache", to: "db", label: "2. Async batch flush (Write-Back)", animated: true }
      ]
    }
  },
  {
    id: "q19",
    category: "Caching Strategies",
    question: "Explain the three main cache hazards: Cache Invalidation, Cache Stampede, and Cache Penetration. How do you mitigate them?",
    answer: "- **Cache Invalidation**: Keeping the cache in sync with changes in the DB. Hard problem ('There are only two hard things in Computer Science: cache invalidation and naming things'). Solve using Time-To-Live (TTL) expirations or pub/sub events on DB commits.\n- **Cache Stampede (Dogpiling)**: Occurs when a highly popular cached key expires, and thousands of concurrent requests read a cache miss at the exact same millisecond, hammering the database to compile the result. Mitigate using **mutex locks (single-flight/distributed locks)** so only one thread compiles the data while others wait.\n- **Cache Penetration**: Occurs when clients spam requests for keys that exist in neither the cache nor the DB (e.g., `user_id = -999`), forcing a database query every time. Mitigate using a **Bloom Filter** to fast-fail invalid keys, or cache the empty result (`key -> null`) with a short TTL.",
    visual: {
      type: "flow",
      nodes: [
        { id: "attacker", label: "Spam Bot (ID: -999)", type: "client" },
        { id: "bf", label: "In-Memory Bloom Filter", type: "security", role: "Validates Key exists" },
        { id: "db", label: "Database Disk (Saves I/O)", type: "db" }
      ],
      connections: [
        { from: "attacker", to: "bf", label: "Check ID", animated: true },
        { from: "bf", to: "db", label: "Blocked! 0% disk impact", animated: false }
      ]
    }
  },

  // --- CATEGORY 5: COMMUNICATION PARADIGMS & APIs ---
  {
    id: "q20",
    category: "Communication Paradigms & APIs",
    question: "Compare RESTful APIs, GraphQL, and gRPC. When should you choose gRPC?",
    answer: "- **REST**: Stateless, resource-based HTTP requests using JSON. Standard, highly interoperable, and easy to parse, but suffers from **over-fetching** (returning unneeded fields) or **under-fetching** (requiring multiple API roundtrips).\n- **GraphQL**: A query language allowing clients to define the exact payload schema they need in a single roundtrip. Mitigates over/under-fetching, but makes server-side caching difficult.\n- **gRPC**: A high-performance RPC framework using **Protocol Buffers** (binary serialization) over **HTTP/2**. It is strictly typed, supports streaming, and is extremely low-latency.\n\n**When to choose gRPC:** Choose gRPC for **internal microservice-to-microservice communication** where low latency, small payloads, and type safety are critical.",
    visual: {
      type: "comparison",
      nodes: [
        { id: "rest", label: "REST (JSON over HTTP/1.1)", type: "proxy", role: "Verbose text payload" },
        { id: "grpc", label: "gRPC (Protobuf over HTTP/2)", type: "gateway", role: "Binary, compressed, typed" }
      ],
      connections: []
    }
  },
  {
    id: "q21",
    category: "Communication Paradigms & APIs",
    question: "Explain WebSockets vs. Server-Sent Events (SSE) vs. Long Polling. Which is best for chat?",
    answer: "- **Long Polling**: Client sends an HTTP request, and the server holds the request open until new data is available. Once returned, client immediately opens a new request. High overhead and network chatty.\n- **Server-Sent Events (SSE)**: A persistent, unidirectional HTTP connection where the server pushes updates to the client. Ideal for live scores, stock tickers, or news feeds.\n- **WebSockets**: A persistent, bidirectional TCP connection allowing full-duplex communication (both client and server can fire payloads at any time). Low packet overhead.\n\n**Verdict for Chat:** **WebSockets** is the standard for chat applications because it requires low-latency bidirectional exchanges (sending and receiving messages).",
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "Chat Client", type: "client" },
        { id: "ws", label: "WebSocket Gateway (TCP)", type: "gateway", role: "Persistent Connection" },
        { id: "server", label: "Chat Backend", type: "server" }
      ],
      connections: [
        { from: "client", to: "ws", label: "Full-Duplex Stream", animated: true },
        { from: "ws", to: "server", label: "Route Chat Events", animated: true }
      ]
    }
  },

  // --- CATEGORY 6: ASYNCHRONOUS PROCESSING & STREAMING ---
  {
    id: "q22",
    category: "Asynchronous Processing & Streaming",
    question: "What is the difference between a Message Queue (like RabbitMQ) and an Event Stream (like Apache Kafka)?",
    answer: "- **Message Queue (RabbitMQ / SQS)**: Operates on a **point-to-point / worker queue** model. Once a worker consumes and acknowledges a message, the message is immediately deleted from the queue. Great for task distribution (e.g., 'resize this image').\n- **Event Stream (Kafka / Kinesis)**: Operates on an **append-only, commit log** model. Messages are organized into partition topics, and are NOT deleted upon consumption—they persist until a retention window expires. Multiple distinct consumer groups can read, rewind, and replay the exact same stream independently by tracking their own offset counters.",
    visual: {
      type: "flow",
      nodes: [
        { id: "pub", label: "Producer", type: "client" },
        { id: "kafka", label: "Kafka Log [Offset: 0, 1, 2, 3]", type: "queue", role: "Immutable Append-Only" },
        { id: "c1", label: "Billing App (Offset: 3)", type: "server" },
        { id: "c2", label: "Fraud Check (Offset: 1)", type: "server", role: "Reads at own pace" }
      ],
      connections: [
        { from: "pub", to: "kafka", label: "Publish", animated: true },
        { from: "kafka", to: "c1", animated: true },
        { from: "kafka", to: "c2", animated: false }
      ]
    }
  },

  // --- CATEGORY 7: MICROSERVICES & ARCHITECTURE PATTERNS ---
  {
    id: "q23",
    category: "Microservices & Architecture Patterns",
    question: "What is the Saga Pattern, and how does it manage distributed transactions?",
    answer: "In microservices, databases are decentralized. If a user books a trip, we must charge their card (Payment Svc) and reserve their hotel (Hotel Svc). A standard SQL Two-Phase Commit locks databases and reduces availability.\n\nThe **Saga Pattern** manages this as a sequence of local transactions. Each service executes its local step and publishes an event. If a subsequent step fails (e.g., payment fails), the Saga triggers **Compensating Transactions** (undo actions) in reverse order to restore consistency.\n\n**Implementation Types:**\n- **Choreography**: Fully decentralized; services listen to events and coordinate implicitly.\n- **Orchestration**: A central controller coordinator explicitly directs services to run actions.",
    visual: {
      type: "flow",
      nodes: [
        { id: "orch", label: "Saga Orchestrator", type: "gateway" },
        { id: "pay", label: "1. Charge Card (Local TX)", type: "server" },
        { id: "hotel", label: "2. Reserve Hotel (FAIL)", type: "server" },
        { id: "refund", label: "3. Undo Charge (Refund)", type: "server", role: "Compensating Transaction" }
      ],
      connections: [
        { from: "orch", to: "pay", animated: true },
        { from: "pay", to: "hotel", label: "Succeeds", animated: true },
        { from: "hotel", to: "orch", label: "Fails! Trigger Compensating", animated: false },
        { from: "orch", to: "refund", animated: true }
      ]
    }
  },
  {
    id: "q24",
    category: "Microservices & Architecture Patterns",
    question: "What is CQRS (Command Query Responsibility Segregation)?",
    answer: "**CQRS** is a pattern that separates read models (Queries) from write models (Commands).\n\nIn many applications, the data representation required for writing (normalized, secure, validated SQL transactions) is fundamentally different from the representation needed for reading (highly nested, aggregated views for UI dashboards). Separating them allows you to optimize and scale the write database independently from the read store. Synchronization is handled asynchronously via an event publisher.",
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "User App", type: "client" },
        { id: "cmd", label: "Write API (Commands)", type: "gateway" },
        { id: "db-w", label: "SQL Write DB (Normalized)", type: "db" },
        { id: "sync", label: "Kafka Event Bus", type: "queue" },
        { id: "db-r", label: "NoSQL Read Cache (Denormalized)", type: "cache" },
        { id: "query", label: "Read API (Queries)", type: "gateway" }
      ],
      connections: [
        { from: "client", to: "cmd", label: "POST /order", animated: true },
        { from: "cmd", to: "db-w" },
        { from: "db-w", to: "sync", label: "Emit order-created" },
        { from: "sync", to: "db-r", label: "Update read-model" },
        { from: "client", to: "query", label: "GET /dashboard", animated: false },
        { from: "query", to: "db-r" }
      ]
    }
  },

  // --- CATEGORY 8: RESILIENCY, FAULT TOLERANCE, & SCALING ---
  {
    id: "q25",
    category: "Resiliency, Fault Tolerance, & Scaling",
    question: "How does a Circuit Breaker pattern protect microservices from cascading failures?",
    answer: "If Service A calls Service B, and Service B experiences a major outage or database lock, Service A's incoming requests will pile up waiting for connection timeouts. This consumes all available worker threads in Service A, causing Service A to crash and triggering a cascading failure down the grid.\n\nA **Circuit Breaker** wraps remote calls and monitors failures:\n1. **Closed (Normal)**: Requests flow freely.\n2. **Open (Tripped)**: If failure rate exceeds a threshold, the breaker trips. Requests immediately fail-fast (or return fallback cached data) without hitting Service B, saving thread pools.\n3. **Half-Open**: Periodically, a few probe requests are sent. If they succeed, the breaker closes.",
    visual: {
      type: "layers",
      nodes: [
        { id: "client", label: "Incoming Traffic", type: "client" },
        { id: "breaker", label: "Circuit Breaker (OPEN state)", type: "security", role: "Fails Fast Instantly" },
        { id: "service", label: "Dead/Locked Service B", type: "server", role: "Unreachable" }
      ],
      connections: [
        { from: "client", to: "breaker", animated: true },
        { from: "breaker", to: "client", label: "Return Fallback (Sub-millisecond)", animated: true },
        { from: "breaker", to: "service", label: "Blocked (Protects grid)", animated: false }
      ]
    }
  },
  {
    id: "q26",
    category: "Resiliency, Fault Tolerance, & Scaling",
    question: "What is Idempotency, and why is it mandatory for payment gateways and distributed retries?",
    answer: "**Idempotency** means an operation can be applied multiple times without changing the result beyond the initial application. In payments, if a network hiccup occurs during checkout, the client retries the request. Without idempotency, the user gets charged twice.\n\n**Mitigation:**\nThe client generates a unique **Idempotency Key** (UUID) before firing the request. The server locks and stores this key in Redis. If a second request arrives with the same key, the server blocks execution and simply returns the cached response from the first transaction.",
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "Client App", type: "client" },
        { id: "redis", label: "Redis Keys (Key_XYZ: IN_PROGRESS)", type: "cache", role: "Lock key with TTL" },
        { id: "db", label: "Payment Ledger", type: "db" }
      ],
      connections: [
        { from: "client", to: "redis", label: "1. Charge with Key_XYZ", animated: true },
        { from: "client", to: "redis", label: "2. Duplicate Charge with Key_XYZ -> BLOCKED", animated: false }
      ]
    }
  },

  // --- CATEGORY 9: SECURITY & IDENTITY ---
  {
    id: "q27",
    category: "Security & Identity",
    question: "Explain stateless authentication using JSON Web Tokens (JWT). What are the trade-offs of JWT revocation?",
    answer: "In stateless auth, when a user logs in, the Auth server returns a **JWT** containing the user's details and roles, signed with a private key.\n\nWhen making API calls, the client attaches the JWT. Downstream services verify the signature locally using the Auth server's public key—completely bypassing the need for a session database check.\n\n**The Trade-off (Revocation)**:\nBecause JWT validation is stateless and local, once issued, a token is valid until its expiration date. If a token is stolen or a user is banned, **immediate revocation is difficult**. Mitigations include using very short lifetimes (e.g., 15m) combined with a stateful blacklist cache (Redis) only for revoked IDs.",
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "Client (Has signed JWT)", type: "client" },
        { id: "gw", label: "API Gateway (Local verify)", type: "gateway", role: "No Database query needed" },
        { id: "svc", label: "Orders Service", type: "server" }
      ],
      connections: [
        { from: "client", to: "gw", label: "1. Request with Bearer Token", animated: true },
        { from: "gw", to: "svc", label: "2. Forward request", animated: true }
      ]
    }
  },
  {
    id: "q28",
    category: "Security & Identity",
    question: "Compare Token Bucket, Leaky Bucket, and Sliding Window rate limiting algorithms.",
    answer: "- **Token Bucket**: A bucket holds tokens, filled at a constant rate. Each request consumes a token. If the bucket is empty, requests are dropped. Pros: **Allows bursts of traffic** up to the bucket capacity.\n- **Leaky Bucket**: Requests enter a queue and are processed ('leak') at a strict, constant rate. Pros: **Smoothes out traffic spikes** into a perfectly consistent output flow. Cons: Can delay fresh requests if the queue is full.\n- **Sliding Window Counter**: Tracks exact request timestamps in a rolling window. It is highly precise, preventing traffic bursts at boundaries.",
    visual: {
      type: "layers",
      nodes: [
        { id: "traffic", label: "Spiky Traffic (Bursts)", type: "client" },
        { id: "leaky", label: "Leaky Bucket Queue", type: "proxy", role: "Smooths to constant flow" },
        { id: "app", label: "App Server", type: "server", role: "Protected from spikes" }
      ],
      connections: [
        { from: "traffic", to: "leaky", animated: true },
        { from: "leaky", to: "app", label: "Strict 10 req/s out", animated: true }
      ]
    }
  }
];

// Comprehensive array of the 100 System Design Questions
const SYSTEM_DESIGN_QNS_100 = [
  // SOCIAL & COMMUNICATION (12)
  { id: "sd-1", q: "Design Twitter (X)", cat: "Social & Communication", db: "Cassandra DB", gw: "API Gateway", cache: "Redis Timeline Cache", queue: "Kafka Event Bus", b: "Celebrity fanout latency on posts", s: "Hybrid pull/push model: pre-compute timelines for active users, pull for celebrities." },
  { id: "sd-2", q: "Design the Facebook News Feed", cat: "Social & Communication", db: "Neo4j Graph DB", gw: "API Gateway", cache: "Redis Cluster Cache", queue: "Kafka Message Log", b: "Heavy graph query latency for user network", s: "Denormalize timelines, index follower connections, and pre-cache feed paths." },
  { id: "sd-3", q: "Design WhatsApp", cat: "Social & Communication", db: "Cassandra Message Store", gw: "WebSocket Gateway", cache: "Redis Session Store", queue: "Kafka Message Bus", b: "Real-time socket state maintenance on massive connections", s: "Stateful session servers, heartbeat listeners, and offline queues." },
  { id: "sd-4", q: "Design Discord", cat: "Social & Communication", db: "ScyllaDB Clustered", gw: "WebSocket Gateway", cache: "Redis Channel Cache", queue: "RabbitMQ Task Queue", b: "Massive voice/chat room synchronization", s: "Stateful gateways with localized pub-sub room subscription channels." },
  { id: "sd-5", q: "Design Instagram", cat: "Social & Communication", db: "PostgreSQL Shards + S3", gw: "API Gateway", cache: "Redis Feed Cache", queue: "Kafka Media Pipeline", b: "Uploading high volume media and feed generation", s: "CDN caching at edge, pre-generating multiple image sizes asynchronously." },
  { id: "sd-6", q: "Design Tinder", cat: "Social & Communication", db: "MongoDB (GeoJSON)", gw: "API Gateway", cache: "Redis Geohash Index", queue: "Kafka Event Stream", b: "Real-time geospatial matching query latency", s: "Redis Geohash or Elasticsearch geo-queries for fast localized matching." },
  { id: "sd-7", q: "Design Quora / Reddit", cat: "Social & Communication", db: "PostgreSQL (Normalized)", gw: "API Gateway", cache: "Redis Vote Cache", queue: "Kafka Write Buffer", b: "High-concurrency vote count updates causing database locks", s: "Vote buffering in Redis with asynchronous batch writing to database." },
  { id: "sd-8", q: "Design LinkedIn", cat: "Social & Communication", db: "Neo4j Graph Database", gw: "API Gateway", cache: "Redis Graph Cache", queue: "Kafka Event Bus", b: "N-degree connection queries taking exponential time", s: "Pre-computed 2nd and 3rd degree connection paths in graph database." },
  { id: "sd-9", q: "Design a massive-scale notification system", cat: "Social & Communication", db: "MongoDB Store", gw: "API Gateway", cache: "Redis Token Bucket", queue: "RabbitMQ Delivery Queue", b: "Downstream provider rate limits (Apple APNS, Google FCM)", s: "Token buckets, priority queues, and dynamic rate throttling per client provider." },
  { id: "sd-10", q: "Design a proximity-based social network (like YikYak)", cat: "Social & Communication", db: "MongoDB (Geo)", gw: "API Gateway", cache: "Redis Geohash Cache", queue: "Kafka Stream", b: "Rapidly recalculating localized feeds for moving users", s: "Geohash partitions and localized Redis list caching with automatic TTL expire." },
  { id: "sd-11", q: "Design a comment system with infinite nested replies", cat: "Social & Communication", db: "PostgreSQL (Closure Table)", gw: "API Gateway", cache: "Redis Comment Cache", queue: "Kafka Event Stream", b: "Deeply recursive querying causing query timeouts", s: "Closure Table schema in SQL or tree document structure in MongoDB." },
  { id: "sd-12", q: "Design a real-time presence service (showing who is online)", cat: "Social & Communication", db: "Redis Cluster", gw: "WebSocket Gateway", cache: "Redis Presence Cache", queue: "Kafka Event Stream", b: "Extremely high write traffic from periodic user heartbeats", s: "Heartbeat aggregation and sliding-window TTL updates in memory." },

  // E-COMMERCE & MARKETPLACES (10)
  { id: "sd-13", q: "Design Amazon’s shopping cart and checkout process", cat: "E-Commerce & Marketplaces", db: "DynamoDB (ACID)", gw: "API Gateway", cache: "Redis Cart Cache", queue: "Kafka Order Bus", b: "Cart modification during checkouts leading to race conditions", s: "Distributed locking or optimistic concurrency control in DynamoDB." },
  { id: "sd-14", q: "Design an inventory management system", cat: "E-Commerce & Marketplaces", db: "PostgreSQL (ACID)", gw: "API Gateway", cache: "Redis Stock Cache", queue: "RabbitMQ Task Queue", b: "Flash sale overselling and stock consistency", s: "Database level constraints and Redis decrement with lua scripting." },
  { id: "sd-15", q: "Design Uber / Lyft (Ride-sharing)", cat: "E-Commerce & Marketplaces", db: "Cassandra Location Log", gw: "WebSocket Gateway", cache: "Redis Geohash Index", queue: "Kafka Stream", b: "Matching drivers to riders in high-density locations with low latency", s: "S2/H3 spatial indexing and real-time location stream matching." },
  { id: "sd-16", q: "Design Airbnb", cat: "E-Commerce & Marketplaces", db: "MySQL Shards + ES", gw: "API Gateway", cache: "Redis Booking Cache", queue: "Kafka Sync Pipeline", b: "Concurrent booking attempts for the same listing", s: "Pessimistic locking or double-reservation prevention using booking state machine." },
  { id: "sd-17", q: "Design DoorDash / UberEats", cat: "E-Commerce & Marketplaces", db: "PostgreSQL + Redis Geohash", gw: "API Gateway", cache: "Redis Route Cache", queue: "Kafka Order Bus", b: "Triangular routing optimization for driver, customer, and merchant", s: "Dynamic ETA calculation engines with batch routing." },
  { id: "sd-18", q: "Design Ticketmaster", cat: "E-Commerce & Marketplaces", db: "MySQL Shards", gw: "API Gateway", cache: "Redis Queue Cache", queue: "RabbitMQ Task Queue", b: "Thundering herd buying tickets simultaneously for a hot show", s: "Virtual queue room with ticket reservation lock and short-lived expiration." },
  { id: "sd-19", q: "Design a flash sale system (Amazon Prime Day)", cat: "E-Commerce & Marketplaces", db: "DynamoDB + Redis", gw: "API Gateway", cache: "Redis Stock Cluster", queue: "Kafka Order Queue", b: "Write-heavy stock decrements crushing transactional storage", s: "Redis transactional decrement with database transaction consolidation via queues." },
  { id: "sd-20", q: "Design an online auction system (eBay)", cat: "E-Commerce & Marketplaces", db: "MySQL (Transactional)", gw: "API Gateway", cache: "Redis Bid Cache", queue: "Kafka Write Bus", b: "Last-second bid collision and transactional synchronization", s: "Single-leader queue per auction ID to serialize and process bids sequentially." },
  { id: "sd-21", q: "Design a dynamic pricing/surge pricing engine", cat: "E-Commerce & Marketplaces", db: "Cassandra DB", gw: "API Gateway", cache: "Redis Multiplier Cache", queue: "Kafka Event Stream", b: "Computing complex pricing multipliers in real-time", s: "Event streams feeding spark/flink analytics with pre-compiled multiplier lookup." },
  { id: "sd-22", q: "Design a localized business directory (Yelp)", cat: "E-Commerce & Marketplaces", db: "Elasticsearch / MongoDB", gw: "API Gateway", cache: "Redis Geo Cache", queue: "Kafka Sync", b: "Geo-search querying efficiency for business listings", s: "Spatial inverted index with geohash-based partitioning." },

  // MEDIA & CONTENT DELIVERY (10)
  { id: "sd-23", q: "Design Netflix", cat: "Media & Content Delivery", db: "Cassandra + S3", gw: "API Gateway", cache: "Redis Metadata Cache", queue: "Kafka Encoding Queue", b: "Massive bandwidth usage and buffering delays", s: "Dynamic adaptive streaming over HTTP (DASH) and video transcoding pipeline." },
  { id: "sd-24", q: "Design YouTube", cat: "Media & Content Delivery", db: "MySQL Shards + S3", gw: "API Gateway", cache: "Redis Video Cache", queue: "Kafka Transcoding Bus", b: "Ingesting and transcoding petabytes of video uploads daily", s: "Chunked video uploads, worker queues for async transcoding to multi-resolutions." },
  { id: "sd-25", q: "Design Spotify", cat: "Media & Content Delivery", db: "Cassandra + S3", gw: "API Gateway", cache: "Redis Playlist Cache", queue: "Kafka Stream", b: "Low-latency audio playback and playlist synchronization", s: "P2P protocol helper, client-side caching, and audio file chunking on CDN edges." },
  { id: "sd-26", q: "Design Twitch (Live video streaming)", cat: "Media & Content Delivery", db: "DynamoDB Store", gw: "WebSocket Gateway", cache: "Redis Live Cache", queue: "Kafka Stream", b: "Sub-second live video distribution to millions of simultaneous viewers", s: "WebRTC/HLS ingestion, transcoders, and Edge video distribution networks." },
  { id: "sd-27", q: "Design TikTok", cat: "Media & Content Delivery", db: "Cassandra + S3", gw: "API Gateway", cache: "Redis Recs Cache", queue: "Kafka Stream", b: "Highly personalized video recommendation feed latency", s: "Recommendation engine scoring pipelines and pre-cached next videos list on client." },
  { id: "sd-28", q: "Design Pinterest", cat: "Media & Content Delivery", db: "HBase + S3", gw: "API Gateway", cache: "Redis Board Cache", queue: "Kafka Event Queue", b: "Assembling feeds from millions of high-resolution images", s: "Denormalized board schema and image asset preprocessing." },
  { id: "sd-29", q: "Design a global Content Delivery Network (CDN)", cat: "Media & Content Delivery", db: "SSD Local Storage", gw: "Anycast Routing", cache: "Edge Cache Ring", queue: "Kafka Event Bus", b: "Cache invalidation propagation globally in real-time", s: "Active purge routing and hierarchical edge-caching architectures." },
  { id: "sd-30", q: "Design Google Photos", cat: "Media & Content Delivery", db: "GCS Blob Store", gw: "API Gateway", cache: "Redis Image Cache", queue: "Kafka Analysis Pipeline", b: "Heavy storage indexing and image retrieval speeds", s: "Image compression pipelines, vector embedding indexing for search, metadata caching." },
  { id: "sd-31", q: "Design an online learning platform (Coursera)", cat: "Media & Content Delivery", db: "PostgreSQL + S3", gw: "API Gateway", cache: "Redis Progress Cache", queue: "Kafka Progress Bus", b: "Video chunking, course progression tracking state storage", s: "Progress checkpoints written to low-overhead time-series log." },
  { id: "sd-32", q: "Design a podcast processing and distribution pipeline", cat: "Media & Content Delivery", db: "PostgreSQL + S3", gw: "API Gateway", cache: "Redis Feed Cache", queue: "RabbitMQ Processing Queue", b: "Audio conversion, ID3 tag extraction, feed parsing", s: "Decoupled background worker pool for RSS aggregation and audio standardizing." },

  // INFRASTRUCTURE & CORE COMPONENTS (10)
  { id: "sd-33", q: "Design a URL Shortener (TinyURL)", cat: "Infrastructure & Core Components", db: "DynamoDB Store", gw: "API Gateway", cache: "Redis Redirect Cache", queue: "Kafka Sync", b: "ID collisions and low-latency redirects", s: "Distributed counter / range allocator (Snowflake or ZooKeeper) with Base-62." },
  { id: "sd-34", q: "Design an API Rate Limiter", cat: "Infrastructure & Core Components", db: "Redis Cluster Store", gw: "API Gateway", cache: "Redis Rate Cache", queue: "Kafka Log Queue", b: "Evaluating millions of requests with sub-millisecond overhead", s: "Sliding window counter algorithm using Redis Lua scripts for atomicity." },
  { id: "sd-35", q: "Design a Distributed ID Generator", cat: "Infrastructure & Core Components", db: "In-Memory Generator", gw: "API Gateway", cache: "Redis Machine Cache", queue: "Kafka Log", b: "Generating 64-bit unique ordered IDs without a central database", s: "Twitter Snowflake algorithm using timestamp, machine ID, and sequence bits." },
  { id: "sd-36", q: "Design a Key-Value Store", cat: "Infrastructure & Core Components", db: "LSM-Tree + SSTables", gw: "API Gateway", cache: "Redis Metadata Cache", queue: "Kafka Log Queue", b: "Data replication, write performance, and network partition recovery", s: "Consistent hashing, vector clocks, and Gossip protocol for node discovery." },
  { id: "sd-37", q: "Design Amazon S3 (Object Storage)", cat: "Infrastructure & Core Components", db: "Blob Storage", gw: "API Gateway", cache: "Redis Metadata Cache", queue: "Kafka Write Log", b: "Managing metadata lookup for billions of binary files", s: "LSM-Tree metadata index, data chunking, and erasure coding for durability." },
  { id: "sd-38", q: "Design a Distributed Cache (Redis clone)", cat: "Infrastructure & Core Components", db: "In-memory HashTable", gw: "API Gateway", cache: "Redis Memory Cache", queue: "Kafka Write Queue", b: "Consistent routing and memory exhaustion", s: "Consistent hashing ring, LRU eviction algorithm, and single-threaded event loop." },
  { id: "sd-39", q: "Design an API Gateway", cat: "Infrastructure & Core Components", db: "Reverse Proxy", gw: "API Gateway Engine", cache: "Redis Router Cache", queue: "Kafka Metric Queue", b: "Routing, authentication, and SSL decryption scaling", s: "Asynchronous non-blocking event loop (Netty/Envoy) with rate limit filter plugin." },
  { id: "sd-40", q: "Design a Layer 7 Load Balancer", cat: "Infrastructure & Core Components", db: "HAProxy / Nginx", gw: "LB Gateway Proxy", cache: "Session Stick Cache", queue: "Kafka Log Bus", b: "Routing traffic based on HTTP headers and maintaining session sticky state", s: "Consistent hashing of session cookie or source IP, async epoll socket loops." },
  { id: "sd-41", q: "Design a Distributed Message Queue (Kafka clone)", cat: "Infrastructure & Core Components", db: "Append-Only Commit Log", gw: "Broker Gateway", cache: "Zero-Copy Page Cache", queue: "Kafka Topic Log", b: "High-throughput sequential write performance and durability", s: "Append-only files, zero-copy socket transfers (OS sendfile), and partitioned logs." },
  { id: "sd-42", q: "Design a Distributed Cron Job Scheduler", cat: "Infrastructure & Core Components", db: "PostgreSQL + Redis", gw: "API Gateway", cache: "Redis Lock Store", queue: "Kafka Trigger Queue", b: "Ensuring exactly-once task execution across a clustered environment", s: "Distributed locking (ZooKeeper/Redis), priority queues, and task status machines." },

  // DATA, SEARCH & ANALYTICS (10)
  { id: "sd-43", q: "Design a Web Crawler", cat: "Data, Search & Analytics", db: "HBase URL Store", gw: "API Gateway", cache: "Bloom Filter Cache", queue: "Kafka Politeness Queue", b: "Avoiding duplicate crawling and DNS bottlenecks", s: "Bloom Filters for URL duplicate check, asynchronous DNS resolver, crawl politeness queue." },
  { id: "sd-44", q: "Design a Search Engine (Google Search)", cat: "Data, Search & Analytics", db: "Bigtable Postings List", gw: "API Gateway", cache: "Redis Search Cache", queue: "Kafka Event Stream", b: "Indexing billions of web pages and ranking search queries in milliseconds", s: "Inverted index (Postings List) partitioned by term, PageRank pipelines, query parser." },
  { id: "sd-45", q: "Design a Typeahead / Autocomplete system", cat: "Data, Search & Analytics", db: "Trie Tree + Redis", gw: "API Gateway", cache: "Redis Prefix Cache", queue: "Kafka Stream", b: "Latency under 50ms for query suggestions on each keystroke", s: "Prefix Trie stored in memory, pre-allocated top suggestions per node, CDN caching." },
  { id: "sd-46", q: "Design an Ad Click Aggregator", cat: "Data, Search & Analytics", db: "Cassandra Database", gw: "API Gateway", cache: "Redis Click Cache", queue: "Kafka Click Stream", b: "High-volume click-stream processing and prevent fraud duplication", s: "Kafka stream ingest, Apache Flink hourly sliding window aggregations, idempotency keys." },
  { id: "sd-47", q: "Design a centralized logging system (Splunk)", cat: "Data, Search & Analytics", db: "ClickHouse Database", gw: "Log Forwarder Proxy", cache: "Redis Stream Cache", queue: "Kafka Ingest Log", b: "Ingesting terabytes of logs with real-time index search speed", s: "Log-forwarder agent, Kafka ingest buffer, ClickHouse or indexless log storage." },
  { id: "sd-48", q: "Design an application monitoring/metrics system (Datadog)", cat: "Data, Search & Analytics", db: "InfluxDB (TSDB)", gw: "API Gateway", cache: "Redis Metric Cache", queue: "Kafka Metric Stream", b: "Heavy time-series write traffic and metric downsampling", s: "Time-series database partitioned by minute, async metric ingestion buffer." },
  { id: "sd-49", q: "Design a credit card fraud detection system", cat: "Data, Search & Analytics", db: "Neo4j Graph Database", gw: "API Gateway", cache: "Redis Feature Store", queue: "Kafka Event Queue", b: "Evaluating transactions against ML models in under 50ms", s: "Feature store in Redis, graph network analysis for ring fraud, online ML inference." },
  { id: "sd-50", q: "Design an e-commerce recommendation engine", cat: "Data, Search & Analytics", db: "Milvus (Vector DB)", gw: "API Gateway", cache: "Redis User Profile Cache", queue: "Kafka Action Stream", b: "Generating real-time purchase suggestions based on behavior", s: "Vector embeddings search, collaborative filtering model inference on click streams." },
  { id: "sd-51", q: "Design an A/B testing framework", cat: "Data, Search & Analytics", db: "PostgreSQL Database", gw: "API Gateway", cache: "Redis Config Cache", queue: "Kafka Event Bus", b: "Bucketing users consistently without database lookups", s: "Deterministic hashing of user_id + experiment_salt modulo 100 on client SDK." },
  { id: "sd-52", q: "Design a financial audit trail system (immutable logs)", cat: "Data, Search & Analytics", db: "Ledger Database", gw: "API Gateway", cache: "Redis Session Cache", queue: "Kafka Journal Bus", b: "Preventing ledger tampering and guaranteeing chronological logs", s: "Cryptographical block chaining (Merkle Tree hash chains) with write-once-read-many storage." },

  // PRODUCTIVITY & COLLABORATION (9)
  { id: "sd-53", q: "Design Google Docs (Collaborative editing)", cat: "Productivity & Collaboration", db: "MongoDB Store", gw: "WebSocket Gateway", cache: "Redis Operational Cache", queue: "Kafka Action stream", b: "Resolving conflicting keystrokes from concurrent editors", s: "Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDT)." },
  { id: "sd-54", q: "Design Slack", cat: "Productivity & Collaboration", db: "Cassandra DB", gw: "WebSocket Gateway", cache: "Redis Channel Cache", queue: "Kafka Message Bus", b: "Real-time message routing to massive active channels", s: "Pub/Sub socket clusters with channel state cache, offline notification workers." },
  { id: "sd-55", q: "Design Zoom (Video conferencing)", cat: "Productivity & Collaboration", db: "PostgreSQL (Metadata)", gw: "WebRTC SFU Gateway", cache: "Redis Connection Cache", queue: "Kafka Signal Stream", b: "Maintaining high-quality audio/video with low latency under low bandwidth", s: "Selective Forwarding Unit (SFU) servers, UDP-based RTP streams, dynamic bit-rate scaling." },
  { id: "sd-56", q: "Design Google Drive / Dropbox", cat: "Productivity & Collaboration", db: "MySQL Metadata + S3", gw: "API Gateway", cache: "Redis File Cache", queue: "Kafka Event Pipeline", b: "Efficiently sync massive file updates over bad networks", s: "Chunked file transfers (4MB blocks), delta-sync, upload resumption, content-addressable hash keying." },
  { id: "sd-57", q: "Design Jira / Trello", cat: "Productivity & Collaboration", db: "PostgreSQL Database", gw: "WebSocket Gateway", cache: "Redis Board Cache", queue: "Kafka Board Log", b: "Real-time board state updates across collaborating members", s: "WebSockets connection pool, optimistic locking on task cards, card index position lists." },
  { id: "sd-58", q: "Design Gmail", cat: "Productivity & Collaboration", db: "Bigtable / Cassandra", gw: "API Gateway", cache: "Redis Inbox Cache", queue: "Kafka Mail Routing Bus", b: "Searching petabytes of emails, spam filters, storage quotas", s: "Inverted search index per user, asynchronous spam classification queue, mail routing server." },
  { id: "sd-59", q: "Design GitHub", cat: "Productivity & Collaboration", db: "PostgreSQL + Git FS", gw: "API Gateway", cache: "Redis Pull Cache", queue: "Kafka Action Stream", b: "Hosting millions of repository branches and fast pull requests", s: "Distributed Git cluster, object storage deduplication, write-ahead commits, async diff analyzer." },
  { id: "sd-60", q: "Design a Pastebin service", cat: "Productivity & Collaboration", db: "MongoDB Store + S3", gw: "API Gateway", cache: "Redis Paste Cache", queue: "Kafka Sync", b: "Generating unique short text IDs and security expiry", s: "Base-62 ID generation, object expiration TTL indexes, raw text object storage." },
  { id: "sd-61", q: "Design a calendar scheduling system (Calendly)", cat: "Productivity & Collaboration", db: "PostgreSQL (ACID)", gw: "API Gateway", cache: "Redis Free/Busy Cache", queue: "Kafka Sync Log", b: "Double-booking prevention on shared calendars", s: "PostgreSQL transaction locks on time-slots, multi-source calendar syncing threads." },

  // FINANCE & PAYMENTS (9)
  { id: "sd-62", q: "Design a Payment Gateway (Stripe)", cat: "Finance & Payments", db: "PostgreSQL (ACID Ledger)", gw: "API Gateway", cache: "Redis Idempotency Store", queue: "Kafka Transaction Bus", b: "Ensuring exactly-once charging and third-party API reliability", s: "Idempotency keys locked in Redis, dual-entry ledger schema, retry queues with exponential backoff." },
  { id: "sd-63", q: "Design a Mobile Wallet (Venmo / CashApp)", cat: "Finance & Payments", db: "PostgreSQL Ledger", gw: "API Gateway", cache: "Redis Balance Cache", queue: "Kafka Ledger Queue", b: "Ensuring atomic balances during rapid peer-to-peer transfers", s: "Two-phase commits (2PC) or Saga orchestrator, double-entry ledger bookkeeping." },
  { id: "sd-64", q: "Design a Stock Exchange matching engine", cat: "Finance & Payments", db: "LMAX Disruptor In-Memory", gw: "TCP Gateway Node", cache: "In-Memory Book Cache", queue: "Kafka Market Feed", b: "Sub-microsecond order matching logic and market feed distribution", s: "In-memory order book, single-threaded ring buffer (Disruptor), non-blocking socket gateways." },
  { id: "sd-65", q: "Design a Cryptocurrency Exchange", cat: "Finance & Payments", db: "PostgreSQL + Ledger", gw: "API Gateway", cache: "Redis Order Cache", queue: "Kafka Settlement Bus", b: "High-concurrency coin ledger safety and order matching", s: "Distributed cold storage, hot wallet balance cache, asynchronous trade persistence." },
  { id: "sd-66", q: "Design a personal finance aggregator (Mint / Plaid)", cat: "Finance & Payments", db: "MongoDB Ledger", gw: "API Gateway", cache: "Redis Bank Cache", queue: "Kafka Scrape Queue", b: "Consolidating data from thousands of bank scrapers asynchronously", s: "Scraping worker pool with token vault rotation, scheduled scraping crons, standardized parsing layer." },
  { id: "sd-67", q: "Design a credit card authorization network", cat: "Finance & Payments", db: "PostgreSQL (Global)", gw: "API Gateway", cache: "Redis Approval Cache", queue: "Kafka Auth Log", b: "99.999% uptime authorization checks under 100ms globally", s: "Edge network proxies, pre-approved balance limit caching, fallback local approval rules." },
  { id: "sd-68", q: "Design a distributed ledger system for a bank", cat: "Finance & Payments", db: "Google Spanner (ACID)", gw: "API Gateway", cache: "Redis Balance Lock", queue: "Kafka Transaction Log", b: "Distributed transactions across global database regions", s: "Google Spanner TrueTime API, Paxos consensus, double-entry balance locks." },
  { id: "sd-69", q: "Design a high-frequency trading platform", cat: "Finance & Payments", db: "In-Memory Ring Buffer", gw: "L3 Direct Access Gateway", cache: "FPGA Packet Cache", queue: "Kafka Telemetry Log", b: "Nano-second level execution times and market feed parsing", s: "Bare-metal C++/Rust execution engine, kernel bypass network cards (Solarflare), FPGA parsers." },
  { id: "sd-70", q: "Design a recurring subscription billing system", cat: "Finance & Payments", db: "PostgreSQL (ACID)", gw: "API Gateway", cache: "Redis Invoice Lock", queue: "RabbitMQ Invoice Queue", b: "Processing millions of subscription invoices at midnight", s: "Slicing database scan partitions, async processing queue, transaction consolidation." },

  // GAMING & REAL-TIME INTERACTION (8)
  { id: "sd-71", q: "Design a global gaming leaderboard", cat: "Gaming & Real-Time Interaction", db: "Redis Sorted Sets", gw: "API Gateway", cache: "Redis Score Cache", queue: "Kafka Event Stream", b: "Real-time leaderboard updates with millions of concurrent score updates", s: "Redis Sorted Sets (ZADD/ZRANGE), clustered by game/region shard keys." },
  { id: "sd-72", q: "Design a real-time multiplayer game backend", cat: "Gaming & Real-Time Interaction", db: "DynamoDB (Metadata)", gw: "UDP Server Gateway", cache: "Redis Session Cache", queue: "Kafka Matchmaking", b: "State sync latency and dead reckoning player positions", s: "State authority server, client prediction, dead reckoning algorithms, UDP protocol." },
  { id: "sd-73", q: "Design an online Chess platform", cat: "Gaming & Real-Time Interaction", db: "PostgreSQL Database", gw: "WebSocket Gateway", cache: "Redis Move Cache", queue: "Kafka Match Queue", b: "Real-time move synchronization, chess clock state", s: "WebSocket state machine, in-memory active match locks, anti-cheat moves validator." },
  { id: "sd-74", q: "Design a matchmaking system for competitive e-sports", cat: "Gaming & Real-Time Interaction", db: "MongoDB Match Pool", gw: "API Gateway", cache: "Redis Match Queue", queue: "Kafka Event Bus", b: "Efficiently matching players of similar Elo rating in under 10 seconds", s: "Matchmaking pool service, Elo window expansion search, player queuing broker." },
  { id: "sd-75", q: "Design a high-throughput casino/sports betting platform", cat: "Gaming & Real-Time Interaction", db: "MySQL (ACID)", gw: "API Gateway", cache: "Redis Bet Cache", queue: "Kafka Ingestion Queue", b: "Massive concurrent bets on live sports with rapid odds updates", s: "Memory-based order match, odds feed streaming (WebSockets), lock-free bet-placement threads." },
  { id: "sd-76", q: "Design a fantasy sports platform (DraftKings)", cat: "Gaming & Real-Time Interaction", db: "PostgreSQL Database", gw: "API Gateway", cache: "Redis Stat Cache", queue: "Kafka Stat Bus", b: "Massive live stat recalculations for active user lineups", s: "Asynchronous stat calculation pipelines (Flink), real-time user team scoreboard cache." },
  { id: "sd-77", q: "Design a virtual economy/currency system for an MMO", cat: "Gaming & Real-Time Interaction", db: "DynamoDB Ledger", gw: "API Gateway", cache: "Redis Coin Lock", queue: "Kafka Transaction Bus", b: "Preventing gold duplication exploits and microtransaction safety", s: "Atomic DynamoDB operations, event audit logger, player inventory sync locks." },
  { id: "sd-78", q: "Design a live, synchronous trivia game (HQ Trivia)", cat: "Gaming & Real-Time Interaction", db: "Redis Server Cluster", gw: "WebSocket Gateway", cache: "Redis Live Cache", queue: "Kafka Event Log", b: "Pushing trivia questions and scoring answers for 1M concurrent users", s: "Massive scale WebSocket broadcast network, Redis atomic answer submission collection." },

  // IOT, LOCATION & SPECIALIZED OPERATIONS (10)
  { id: "sd-79", q: "Design a fleet tracking system for 100,000 delivery trucks", cat: "IoT, Location & Specialized Operations", db: "Cassandra (Time-Series)", gw: "API Gateway", cache: "Redis Location Index", queue: "Kafka Ping Buffer", b: "Handling continuous location streams without database overload", s: "Kafka buffer for location pings, Geohash spatial grouping, Cassandra wide-column partition." },
  { id: "sd-80", q: "Design a Smart Home IoT Hub", cat: "IoT, Location & Specialized Operations", db: "SQLite (Edge Sync) + DynamoDB", gw: "MQTT Broker", cache: "Redis State Cache", queue: "Kafka Event Bus", b: "Offline device capabilities and low-power message transport", s: "MQTT Broker protocol, local hub state machine cache, eventual cloud sync." },
  { id: "sd-81", q: "Design a Turn-by-Turn navigation system (Google Maps)", cat: "IoT, Location & Specialized Operations", db: "Graph Database", gw: "API Gateway", cache: "Redis Map Overlay Cache", queue: "Kafka Traffic Queue", b: "Dijkstra routing computation on a graph of millions of streets", s: "Hierarchical graph partitions (contraction hierarchies), real-time traffic overlay layer." },
  { id: "sd-82", q: "Design an airline reservation system", cat: "IoT, Location & Specialized Operations", db: "MySQL (ACID Shards)", gw: "API Gateway", cache: "Redis Seats Cache", queue: "Kafka Event Log", b: "Ensuring double booking prevention under heavy traffic", s: "Distributed transactions, pessimistic database row locks, temporary seat reservation timers." },
  { id: "sd-83", q: "Design a CAPTCHA verification system", cat: "IoT, Location & Specialized Operations", db: "Redis Session Store", gw: "API Gateway", cache: "Redis CAPTCHA Cache", queue: "Kafka Audit Stream", b: "Preventing bot generation and ensuring secure verification state", s: "Cryptographical signing of challenge answers, short-lived Redis session tokens." },
  { id: "sd-84", q: "Design an emergency alert broadcast system", cat: "IoT, Location & Specialized Operations", db: "Cell Broadcast Network", gw: "Emergency CBS API Gateway", cache: "Edge Broadcast Cache", queue: "Kafka Alert Queue", b: "Broadcasting messages to millions of phones in seconds without network congestion", s: "Cell Broadcast Service (CBS) infrastructure, geo-fenced radio towers, UDP notifications." },
  { id: "sd-85", q: "Design a smart parking lot management system", cat: "IoT, Location & Specialized Operations", db: "MongoDB database", gw: "API Gateway", cache: "Redis Parking Cache", queue: "Kafka Sensor Bus", b: "Real-time parking space detection and billing", s: "Sensor event streams, edge processors, parking spot state cache (Redis)." },
  { id: "sd-86", q: "Design a public transit live-tracking system", cat: "IoT, Location & Specialized Operations", db: "Cassandra Database", gw: "API Gateway", cache: "Redis Location Index", queue: "Kafka Ping Buffer", b: "GPS stream ingest and dynamic bus delay recalculations", s: "GTFS-RT feeds, time-series geolocation caches, dynamic schedule estimation engines." },
  { id: "sd-87", q: "Design an elevator control system for a 100-story skyscraper", cat: "IoT, Location & Specialized Operations", db: "Local PLC Controller", gw: "Elevator Gateway API", cache: "Queue State Cache", queue: "Kafka Telemetry Log", b: "Optimal elevator dispatching algorithms and safety priority", s: "Elevator dispatch algorithms (Scan/destination dispatch), queue state controller, PLC telemetry." },
  { id: "sd-88", q: "Design a global weather data aggregator", cat: "IoT, Location & Specialized Operations", db: "TimescaleDB", gw: "API Gateway", cache: "Redis Weather Grid Cache", queue: "Kafka Metric Queue", b: "Processing sensor feeds from millions of stations globally", s: "Time-series database partitioned by day and sensor type, caching of regional grids." },

  // ADVANCED ENGINEERING & AUTOMATION (12)
  { id: "sd-89", q: "Design a distributed web scraper to bypass anti-bot protections", cat: "Advanced Engineering & Automation", db: "MongoDB URL Store", gw: "API Gateway", cache: "Redis Proxy Ring Cache", queue: "Kafka Target Queue", b: "IP blocking, fingerprint detection, captchas", s: "IP proxy rotation pool, headless browser container mesh, crawling speed jitter." },
  { id: "sd-90", q: "Design a real-time collaborative whiteboard (Miro)", cat: "Advanced Engineering & Automation", db: "MongoDB Event Log", gw: "WebSocket Gateway", cache: "Redis Shapes Cache", queue: "Kafka Board Bus", b: "Syncing canvas shapes coordinates for thousands of editors", s: "WebSocket pub-sub channels, canvas action log, CRDT vectors for shape edits." },
  { id: "sd-91", q: "Design an email marketing platform (Mailchimp)", cat: "Advanced Engineering & Automation", db: "PostgreSQL + S3", gw: "API Gateway", cache: "Redis Bounce Cache", queue: "RabbitMQ Sender Queue", b: "Sending millions of scheduled emails without IP blacklisting", s: "Campaign sender queue, IP warmup throttle engine, email tracking pixel analyzer." },
  { id: "sd-92", q: "Design a remote desktop application", cat: "Advanced Engineering & Automation", db: "UDP Signalling Server", gw: "WebRTC Turn Gateway", cache: "Redis Signaling Cache", queue: "Kafka Log", b: "Achieving sub-50ms screen frame rendering and keyboard controls", s: "H.264/H.265 screen video encoding, WebRTC peer connections, UDP control channel." },
  { id: "sd-93", q: "Design a continuous integration/continuous deployment (CI/CD) pipeline", cat: "Advanced Engineering & Automation", db: "PostgreSQL + GCS", gw: "API Gateway", cache: "Redis Build Cache", queue: "RabbitMQ Runner Queue", b: "Isolating worker builds and high resource usage scaling", s: "Kubernetes runner pod sandbox, artifact storage caching, build pipeline state engine." },
  { id: "sd-94", q: "Design a feature flag management system", cat: "Advanced Engineering & Automation", db: "PostgreSQL DB", gw: "API Gateway", cache: "Redis Rules Cache", queue: "Kafka Target Queue", b: "Pushing flag updates instantly to millions of apps under 10ms", s: "Local file/SDK caching on client side, Server-Sent Events (SSE) push, hashing rules evaluator." },
  { id: "sd-95", q: "Design a distributed locking service (ZooKeeper clone)", cat: "Advanced Engineering & Automation", db: "Consensus Commit Log", gw: "API Gateway", cache: "Lease Memory Cache", queue: "Kafka Event Queue", b: "Maintaining strong lock consistency during leader election and split brain", s: "Raft/Paxos consensus algorithm, heartbeats, session leases with automatic lock expiry." },
  { id: "sd-96", q: "Design a plagiarism detection system for universities", cat: "Advanced Engineering & Automation", db: "Elasticsearch + Pinecone", gw: "API Gateway", cache: "Redis Doc Cache", queue: "Kafka Doc Queue", b: "Parsing and comparing text documents against massive academic archives", s: "Text tokenization, shingles/fingerprinting, vector similarity search, distributed map-reduce analyzer." },
  { id: "sd-97", q: "Design a reverse proxy server", cat: "Advanced Engineering & Automation", db: "C/Rust Event Loop", gw: "Reverse Proxy Engine", cache: "Edge Route Cache", queue: "Kafka Trace Log", b: "High-concurrency packet routing with low CPU and memory overhead", s: "Asynchronous epoll/kqueue socket loop, zero-copy buffers, HTTP/2/3 request parser." },
  { id: "sd-98", q: "Design an indexing system for a massive, unindexed dataset", cat: "Advanced Engineering & Automation", db: "ClickHouse Columnar", gw: "API Gateway", cache: "Redis Chunk Index", queue: "Kafka Ingestion Log", b: "Querying petabytes of logs without indexes under 10 seconds", s: "Map-Reduce cluster scan, columnar storage file chunks, directory bloom filters." },
  { id: "sd-99", q: "Design a highly accurate view-counting system for viral videos", cat: "Advanced Engineering & Automation", db: "Cassandra DB", gw: "API Gateway", cache: "Redis Counter Buffer", queue: "Kafka View Stream", b: "Double-counting prevention and high-throughput counter writes", s: "HyperLogLog for unique viewers count estimation, Redis buffered increments with asynchronous DB flush." },
  { id: "sd-100", q: "Design an auto-scaling orchestration engine (Kubernetes clone)", cat: "Advanced Engineering & Automation", db: "etcd Cluster (Raft)", gw: "Kube-API Gateway", cache: "Nodes State Cache", queue: "Kafka Controller Stream", b: "State consistency across thousands of nodes and scheduler latency", s: "Consensus store (etcd), controller loop watchers, scheduler queue with priority ranking." }
];

// Function to build high-quality, beginner-friendly analogies dynamically for all 100 questions
function getAnalogyAnswer(item: typeof SYSTEM_DESIGN_QNS_100[number]): string {
  let analogyHeading = "";
  let analogyText = "";
  let componentsAnalogy = "";

  switch (item.cat) {
    case "Social & Communication":
      analogyHeading = "📣 The Town Square & The Megaphone";
      analogyText = `Imagine this system like a **giant Town Square**. When an ordinary person posts something, they write it in a small personal diary. But when a superstar like a celebrity speaks, they shout into a **giant Megaphone** (celebrity fanout). If we tried to copy that superstar's message into every single citizen's mailbox instantly, our couriers would collapse from exhaustion! We solve this by pre-building mailboxes for active users, but making people pull messages from the celebrity's big billboard when they visit.`;
      componentsAnalogy = `
- **${item.gw} (The Town Security Gate)**: Checks guest IDs, rate-limits troublemakers, and directs them to the right street.
- **${item.cache} (The Hot-Topic Clipboard)**: A quick-access clipboard in the center of the square so people can read recent timelines without traveling to the archives.
- **${item.queue} (The Sorting Conveyor Belt)**: Buffers incoming posts and letters so we don't drop any during high-traffic surges.
- **${item.db} (The Master Filing Cabinet)**: The permanent, secure filing cabinet deep in the basement where all histories are saved forever.`;
      break;

    case "E-Commerce & Marketplaces":
      analogyHeading = "🛒 The Supermarket & The Ticketing Counter";
      analogyText = `Imagine this system like a **popular amusement park ticketing booth** or a **bakery flash sale**. If thousands of hungry customers run to the counter at the exact same millisecond, they might all try to grab the same last loaf of bread, leading to chaos and double-selling. We prevent this by placing people in a **neat single-file line** and handing out **temporary reservation tags** with a timer (locks/optimistic state). If they don't buy in 5 minutes, their tag goes back on the shelf.`;
      componentsAnalogy = `
- **${item.gw} (The Line Host)**: Guides customers to the correct counter and stops spam bots at the door.
- **${item.cache} (The LED Stock Display)**: Shows instant, microsecond-accurate stock levels so we don't waste time checking the main vault.
- **${item.queue} (The Order Conveyor)**: Buffers transactions safely, letting the cashiers process orders one by one.
- **${item.db} (The Official Ledger Vault)**: The highly secure, locked ledger book where every completed payment is recorded with double-entry precision.`;
      break;

    case "Media & Content Delivery":
      analogyHeading = "🍿 The Neighborhood Convenience Store";
      analogyText = `Imagine this system like a **global franchise of neighborhood convenience stores**. If every person in Singapore had to fly to a single factory in New York to buy a bottle of soda, the airports would clog and everyone would suffer massive delays (buffering!). Instead, we pre-stock popular soda bottles at **local store shelves** close to where people live. When a customer wants a video or song, they grab it from the local shelf (CDN). If the store runs out, they fetch it from the main factory once and save it for next time.`;
      componentsAnalogy = `
- **${item.gw} (The Ticket Gate)**: Authenticates your premium subscription and routes you to the correct stream.
- **${item.cache} (The Quick-Shelf)**: Holds small, hot metadata like your playlist index or watch history.
- **${item.queue} (The Video Slicer Assembly)**: A background assembly line that slices giant videos into small, 2-second bite-sized chunks for smooth streaming.
- **${item.db} (The Master Tape Archive)**: The primary database storage holding metadata, user accounts, and billing details securely.`;
      break;

    case "Infrastructure & Core Components":
      analogyHeading = "🚦 The Highway Toll & Post Office Counter";
      analogyText = `Imagine this system like a **post office counter** or a **highway toll gate** designed to handle millions of cars without a collision. If two cars get the exact same license plate or ID, it creates massive identity confusion. To solve this, we use a **central ticket dispenser** that allocates pre-approved ranges of numbers to different lanes so no two lanes ever hand out the same ID. For traffic, we use a **Token Bucket** where tickets drip into a bucket at a constant speed, stopping sudden speeders from crashing the system.`;
      componentsAnalogy = `
- **${item.gw} (The Toll Gate)**: Decrypts SSL, verifies request signatures, and keeps traffic flowing smoothly.
- **${item.cache} (The Speed Radar)**: In-memory tracker that evaluates speed rates and token counts in microseconds.
- **${item.queue} (The Traffic Buffer)**: Absorbs heavy spikes, holding messages in a safe, ordered line until downstream workers can handle them.
- **${item.db} (The Master Registry)**: The authoritative record-keeper that tracks persistent system rules and configuration.`;
      break;

    case "Data, Search & Analytics":
      analogyHeading = "🔍 The Library Card Index & Smart Detective";
      analogyText = `Imagine this system like a **librarian with a smart card index catalog**. If a guest asked a librarian to read every book page in the library to find the word "distributed", they would collapse from exhaustion. Instead, they use an **Inverted Index**: a special list where the word "distributed" points directly to Book #4, Book #12, and Book #99. For search typing, we build a **Word Tree (Trie)** that predicts the next letter as you type, keeping the top 10 most popular guesses in active memory.`;
      componentsAnalogy = `
- **${item.gw} (The Library Reception)**: Greets visitors, parses their search queries, and points them to the right room.
- **${item.cache} (The Hot-Search Desk)**: Caches the answers to the most common questions so we don't have to search the index again.
- **${item.queue} (The New-Arrivals Cart)**: An ingestion belt that buffers new articles and logs before they get indexed.
- **${item.db} (The Book Stacks)**: The massive columnar database or data lake designed to index and store petabytes of data.`;
      break;

    case "Productivity & Collaboration":
      analogyHeading = "✏️ The Shared Multi-Artist Blackboard";
      analogyText = `Imagine this system like a **massive shared blackboard** where ten people are drawing at the exact same millisecond. If two people try to draw over the exact same pixel, it would create messy conflicts. To solve this, we use a **smart referee** (Operational Transformation or CRDT) who translates every stroke into coordinates, automatically adjusting them so that everyone's boards look perfectly identical and synced without anyone's work getting deleted.`;
      componentsAnalogy = `
- **${item.gw} (The Active Phone Line)**: Deploys real-time WebSockets to keep an open, bidirectional connection with every collaborator's browser.
- **${item.cache} (The Erasable Draft Board)**: Keeps the active session state and shape lists in memory for instant drawing updates.
- **${item.queue} (The Stroke Conveyor)**: Streams and orders every single keystroke or cursor movement so the referee can process them sequentially.
- **${item.db} (The Master Art Gallery)**: The primary database that saves finalized boards, documents, and messages.`;
      break;

    case "Finance & Payments":
      analogyHeading = "💰 The Double-Entry Locked Vault Ledger";
      analogyText = `Imagine this system like a **highly secure bank vault** where money can never be created or destroyed out of thin air. We must use a **Double-Entry Ledger Book**—we never just edit a balance; we write 'Subtract $10 from Account A, Add $10 to Account B' in one atomic, locked transaction. If a customer clicks 'Pay' twice due to poor network, we hand them a **Unique Transaction Stamp** (Idempotency Key). If we see that stamp again, we immediately block the second charge and hand them the original receipt.`;
      componentsAnalogy = `
- **${item.gw} (The Bank Security Entrance)**: Handles API verification, rate limiting, and strictly verifies transaction request keys.
- **${item.cache} (The Active Stamp Locker)**: Stores used idempotency keys and active balance locks in-memory to prevent double-spending in microseconds.
- **${item.queue} (The Secure Deposit Bag)**: Decouples the charging steps and handles retries with exponential backoffs so transactions are never lost.
- **${item.db} (The Bulletproof Vault Ledger)**: A fully ACID-compliant transactional database that serves as the ultimate source of financial truth.`;
      break;

    case "Gaming & Real-Time Interaction":
      analogyHeading = "🎮 The High-Speed Air Hockey Referee";
      analogyText = `Imagine this system like a **fast-paced air hockey table** where the puck travels at lightning speed. If we sent player positions via regular mail (HTTP), the puck would be in the goal before the letter arrived! Instead, we use a **continuous walkie-talkie link** (UDP & WebSockets) with a **superfast referee** who broadcasts the exact puck coordinate 60 times a second. If a player lags, the client predicts where the puck is going (dead reckoning) to keep it smooth.`;
      componentsAnalogy = `
- **${item.gw} (The Game Lobby)**: Connects players, manages active match sockets, and routes game state packets.
- **${item.cache} (The Real-Time Scoreboard)**: Holds game rooms, active positions, and high scores in memory for microsecond updates.
- **${item.queue} (The Matchmaking Queue)**: Lines up players based on their skill rating (Elo) and matches them in balanced game rooms.
- **${item.db} (The Hall of Fame)**: Saves permanent player accounts, unlocked achievements, and match histories.`;
      break;

    case "IoT, Location & Specialized Operations":
      analogyHeading = "🛰️ The Castle Carrier Pigeon Hub";
      analogyText = `Imagine this system like a **castle with a flock of 100,000 carrier pigeons** constantly flying back from delivery trucks with tiny GPS coordinates tied to their legs. If all pigeons land on the castle roof at the exact same second, the castle will collapse from the weight. To solve this, we direct pigeons to a **Sorting Yard** (Kafka broker) that lines up messages neatly, allowing background scribes to write coordinates into a **Time-Series Ledger** designed for rapid sequential writing.`;
      componentsAnalogy = `
- **${item.gw} (The Pigeon Landing Deck)**: Accepts coordinate packets from lightweight devices and parses their coordinates.
- **${item.cache} (The Geo-Grid Map)**: Organizes active coordinates onto a grid (Geohash) so we can locate the closest trucks instantly in-memory.
- **${item.queue} (The Sorting Yard)**: Buffers millions of incoming location pings so they don't crash our storage engine during peak hours.
- **${item.db} (The Time-Series Scroll)**: A wide-column database that records the historical path of every truck sequentially.`;
      break;

    case "Advanced Engineering & Automation":
    default:
      analogyHeading = "🤖 The Autonomous Robot Assembly Line";
      analogyText = `Imagine this system like an **autonomous robot factory assembly line**. If a worker robot gets stuck or fails, a **Safety Inspector** (Controller loop) immediately notices, recycles the broken robot, and starts a fresh one to keep the target number of workers active. To make sure no two robots collide or write conflicting instructions, they check a **Master Shared Instruction Manual** (Raft consensus) before taking any action.`;
      componentsAnalogy = `
- **${item.gw} (The Factory Gate)**: Accepts automated API triggers, authenticates webhooks, and distributes commands.
- **${item.cache} (The State Display Board)**: Shows current running worker statuses and cluster health metrics in-memory.
- **${item.queue} (The Assembly Line Belt)**: Decouples tasks and triggers, holding jobs in queue until an idle robot can process them.
- **${item.db} (The Consensus Manual)**: A highly consistent key-value store (like etcd) that holds the single source of truth for all cluster states.`;
      break;
  }

  return `Question: How would you approach designing ${item.q.replace("Design ", "")}?

Answer: > **Analogy: ${analogyHeading}**
> 
> ${analogyText}

---

### **Architectural Blueprint & Components**

To implement this system at massive scale, we build a decoupled architecture:
${componentsAnalogy}

---

### **Primary Bottleneck & Mitigation Strategy**

- **The Bottleneck**: **${item.b}**
- **The Mitigation Plan**: **${item.s}** This separates high-traffic events from our slow primary database, ensuring a responsive, zero-lag experience.`;
}

// Append all 100 questions to our main question list
SYSTEM_DESIGN_QNS_100.forEach((item) => {
  INTERVIEW_QUESTIONS.push({
    id: item.id,
    category: item.cat,
    question: item.q,
    answer: getAnalogyAnswer(item),
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "Client Ingress", type: "client" },
        { id: "gw", label: item.gw, type: "gateway", role: "Verification & Rate Limit" },
        { id: "server", label: `${item.q.replace("Design ", "")} Svc`, type: "server", role: "Core Microservice" },
        { id: "cache", label: item.cache, type: "cache", role: "In-Memory Lookup" },
        { id: "db", label: item.db, type: "db", role: "Primary Persistence" },
        { id: "queue", label: item.queue, type: "queue", role: "Asynchronous Broker" }
      ],
      connections: [
        { from: "client", to: "gw", label: "Request Stream", animated: true },
        { from: "gw", to: "server", label: "Route RPC", animated: true },
        { from: "server", to: "cache", label: "Cache Read/Write", animated: false },
        { from: "server", to: "queue", label: "Enqueue Work", animated: true },
        { from: "server", to: "db", label: "ACID Commit", animated: false }
      ]
    }
  });
});

// Define Batch 1: Java Core Concepts Questions (10 Questions)
const JAVA_CORE_CONCEPTS_BATCH_1: InterviewQuestion[] = [
  {
    id: "java-core-1",
    category: "Java Core Concepts",
    question: "How does Java Memory Management (Heap vs. Stack) work?",
    answer: "**Analogy: The Worker's Desk vs. The Central Warehouse**\n\nImagine Java's memory as a busy corporate office.\n\n* **The Stack (The Worker's Desk):** This is a small, tightly organized desk used for fast, active tasks. When a method starts, a new block (\"stack frame\") is created on the desk to store temporary local variables. The moment the method finishes, the entire block is swiped clean instantly. It's incredibly fast, but has very limited space.\n* **The Heap (The Shared Warehouse):** This is the giant, shared central warehouse where all heavy boxes (Objects) are stored long-term. Anyone can request space in the warehouse at any time. Because it's so large, finding and cleaning up items is slower. It is kept tidy by a janitor called the **Garbage Collector** who periodically sweeps away unused boxes.\n\n---\n\n### **Core Code Mechanics**\n```java\npublic class MemoryDemo {\n    public static void main(String[] args) {\n        int size = 10;            // 'size' primitive is stored on the STACK\n        Person p = new Person();  // Reference 'p' is on the STACK, but the Person object is on the HEAP\n    }\n}\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "stack", label: "Stack (Fast)", type: "cache", role: "Local variables & references" },
        { id: "var-size", label: "size = 10", type: "text" },
        { id: "ref-p", label: "p (Pointer)", type: "text" },
        { id: "heap", label: "Heap (Large)", type: "db", role: "Long-term objects" },
        { id: "obj-p", label: "Person Object", type: "server" }
      ],
      connections: [
        { from: "ref-p", to: "obj-p", label: "Points to", animated: true }
      ]
    }
  },
  {
    id: "java-core-2",
    category: "Java Core Concepts",
    question: "What is the JVM (Java Virtual Machine) and how does it achieve platform independence?",
    answer: "**Analogy: The Universal Translator Earpiece**\n\nImagine writing a book. If you wanted people in Windows-land, Mac-island, and Linux-country to read it, you'd normally have to write three separate versions from scratch (compiling directly to native machine code).\n\nInstead, Java tells you to write your book in a special, middle-ground language called **Bytecode** (the `.class` file compiled by `javac`).\n\nThen, Java distributes a **Universal Translator Earpiece** called the **JVM (Java Virtual Machine)** to each region. The Windows earpiece translates Bytecode to Windows instructions, the Mac earpiece to Mac, and the Linux earpiece to Linux. You write the code *once*, and the local JVM translates it to native CPU instructions on the fly!\n\n---\n\n### **Compilation & Execution Flow**\n```bash\n[MyCode.java] --- (javac compiler) ---> [MyCode.class (Bytecode)] ---> [JVM (Interpreter/JIT)] ---> [Native OS Code]\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "src", label: "MyCode.java (Java Code)", type: "client" },
        { id: "comp", label: "javac (Compiler)", type: "proxy" },
        { id: "bc", label: "MyCode.class (Bytecode)", type: "queue" },
        { id: "jvm", label: "JVM Interpreter / JIT", type: "gateway" },
        { id: "cpu", label: "Native OS / CPU (Win/Mac)", type: "server" }
      ],
      connections: [
        { from: "src", to: "comp", label: "Compile" },
        { from: "comp", to: "bc", label: "Generate" },
        { from: "bc", to: "jvm", label: "Read" },
        { from: "jvm", to: "cpu", label: "Translate & Run", animated: true }
      ]
    }
  },
  {
    id: "java-core-3",
    category: "Java Core Concepts",
    question: "What is Garbage Collection in Java, and how does the Mark-and-Sweep algorithm work?",
    answer: "**Analogy: The Busy Restaurant Busboy**\n\nImagine you run a busy restaurant. The tables are Heap memory, the customers are active program threads, and the plates are allocated objects. When customers finish their meals and leave, they leave dirty plates behind (unreferenced objects).\n\nIf you run out of clean plates, your restaurant crashes. So, you hire a busboy called the **Garbage Collector (GC)**.\n\nIn the **Mark-and-Sweep** algorithm:\n1. **Mark Phase (Sticking green tags):** The busboy starts from active tables (the 'GC Roots' like running threads and local Stack variables) and places a green tag on every plate still being used.\n2. **Sweep Phase (Clearing untagged plates):** He walks through the entire restaurant. If a plate doesn't have a green tag, he throws it into the trash to reclaim memory!\n\n---\n\n### **GC Code Trigger (Best Practice: Avoid calling explicitly)**\n```java\n// Requests JVM to run Garbage Collector, but doesn't guarantee instant run\nSystem.gc(); \n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "gcroots", label: "GC Roots (Active References)", type: "client" },
        { id: "obj1", label: "Object A (Marked: Alive)", type: "server", role: "Tagged Active" },
        { id: "obj2", label: "Object B (Marked: Alive)", type: "server", role: "Tagged Active" },
        { id: "obj3", label: "Object C (Unmarked: Garbage!)", type: "alert", role: "No active reference" },
        { id: "gc", label: "Garbage Collector Sweep", type: "gateway" }
      ],
      connections: [
        { from: "gcroots", to: "obj1", label: "Referenced", animated: true },
        { from: "obj1", to: "obj2", label: "Referenced" },
        { from: "gc", to: "obj3", label: "Reclaim / Delete", animated: true }
      ]
    }
  },
  {
    id: "java-core-4",
    category: "Java Core Concepts",
    question: "What is a Java Thread, and how does Multithreading differ from Single-threading?",
    answer: "**Analogy: The Coffee Shop Baristas**\n\nImagine a busy coffee shop.\n\n* **Single-Threading (One Barista):** There is only one barista behind the counter. If a customer orders a complex espresso, the barista stops, grinds the beans, froths the milk, serves the cup, and only *then* greets the next customer in line. The line stalls completely during slow operations.\n* **Multithreading (Multiple Baristas):** You hire three baristas (threads) working behind the counter. They all share the same espresso machine, coffee beans, and cash register (shared process memory), but they handle tasks concurrently. Barista A rings up payments, Barista B steams milk, and Barista C pulls espresso shots. If one task is slow, other customers are still served!\n\n---\n\n### **Creating a Thread in Java**\n```java\n// Creating a thread using lambda runnable\nThread thread = new Thread(() -> {\n    System.out.println(\"Barista working in background thread!\");\n});\nthread.start(); // Triggers concurrent execution!\n```",
    visual: {
      type: "layers",
      nodes: [
        { id: "process", label: "Shared Process Memory (Shared Countertop)", type: "db", role: "Heap, static variables" },
        { id: "t1", label: "Thread 1 (Barista A)", type: "server", role: "Task: Take Payments" },
        { id: "t2", label: "Thread 2 (Barista B)", type: "server", role: "Task: Steam Milk" },
        { id: "t3", label: "Thread 3 (Barista C)", type: "server", role: "Task: Pull Espresso" }
      ],
      connections: [
        { from: "t1", to: "process", label: "Access Shared Memory", animated: true },
        { from: "t2", to: "process", label: "Access Shared Memory", animated: true },
        { from: "t3", to: "process", label: "Access Shared Memory", animated: true }
      ]
    }
  },
  {
    id: "java-core-5",
    category: "Java Core Concepts",
    question: "What is the difference between == and .equals() in Java?",
    answer: "**Analogy: Identical Physical Keys**\n\nImagine you have two separate keys in your pocket.\n\n* **The `==` Operator (Physical Identity):** This checks if the two variables hold the exact same *physical piece of metal*. If you compare your two keys using `==`, it returns `false` because they are two separate objects, even if they look identical and open the same door.\n* **The `.equals()` Method (Functional Equivalence):** This checks if the two keys *look the same and unlock the same door*. It compares the values inside the objects. If you call `key1.equals(key2)`, it returns `true` because their contents (cut patterns) are functionally equivalent.\n\n---\n\n### **Code Demonstration**\n```java\nString s1 = new String(\"Coffee\");\nString s2 = new String(\"Coffee\");\n\nSystem.out.println(s1 == s2);      // false (They point to different objects in Heap)\nSystem.out.println(s1.equals(s2)); // true (Their text content matches perfectly)\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "v1", label: "String s1", type: "client" },
        { id: "v2", label: "String s2", type: "client" },
        { id: "o1", label: "Heap Object A ('Coffee')", type: "server" },
        { id: "o2", label: "Heap Object B ('Coffee')", type: "server" }
      ],
      connections: [
        { from: "v1", to: "o1", label: "References" },
        { from: "v2", to: "o2", label: "References" },
        { from: "o1", to: "o2", label: ".equals() checks values", animated: true }
      ]
    }
  },
  {
    id: "java-core-6",
    category: "Java Core Concepts",
    question: "How does the Java String Pool save memory?",
    answer: "**Analogy: The Whiteboard Name Tag**\n\nImagine a primary school classroom where 30 kids all need to wear a name tag that says \"Explorer\".\n\nIf the teacher draws, cuts, and colors 30 separate identical name tags, they waste a lot of paper and desk space. Instead, the teacher draws *one* big master name tag on the central blackboard (the **String Pool**) and tells all 30 kids to point their finger at it.\n\nIn Java, because Strings are used everywhere, creating a new object every time is expensive. So, Java keeps a pool of unique String literals in memory. When you write `String s1 = \"Explorer\";`, Java checks the Pool. If \"Explorer\" is already there, your variable just points to the existing pooled instance, saving Heap space!\n\n---\n\n### **String Literals vs. New Objects**\n```java\nString s1 = \"Java\"; // Points to String Pool\nString s2 = \"Java\"; // Points to the SAME instance! (s1 == s2 is true)\n\nString s3 = new String(\"Java\"); // Forces a new object on the general heap!\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "s1", label: "s1 literal", type: "client" },
        { id: "s2", label: "s2 literal", type: "client" },
        { id: "s3", label: "s3 forced", type: "client" },
        { id: "pool", label: "String Pool (Blackboard)", type: "cache", role: "Holds one 'Java' instance" },
        { id: "heap", label: "General Heap", type: "server", role: "Holds separate custom object" }
      ],
      connections: [
        { from: "s1", to: "pool", label: "Reuses", animated: true },
        { from: "s2", to: "pool", label: "Reuses", animated: true },
        { from: "s3", to: "heap", label: "Creates New" }
      ]
    }
  },
  {
    id: "java-core-7",
    category: "Java Core Concepts",
    question: "What is the Difference Between HashMap and HashTable in Java?",
    answer: "**Analogy: The Locked Safe vs. The Fast Sorting Rack**\n\nImagine two ways to organize mail at a busy delivery station.\n\n* **HashTable (The Heavy Locked Safe):** A HashTable is like a mail safe with a heavy mechanical padlock. Only *one* mail clerk can touch it at any given second. If another clerk wants to store a letter, they must stand in a single-file line and wait (this is **Synchronization / Thread-safety**). It also strictly forbids empty items—if you try to put a blank letter or blank slot in, it throws a fit (no null keys or values allowed).\n* **HashMap (The Open Sorting Rack):** A HashMap is a fast, open sorting rack. Multiple clerks can toss letters in at the exact same time without waiting (not synchronized/not thread-safe). It is much faster, and it gladly accepts a blank slot (allows one null key and multiple null values).\n\n---\n\n### **Key Architectural Choice**\n```java\nMap<String, Integer> map = new HashMap<>(); // Standard choice for single-thread\nMap<String, Integer> syncMap = new ConcurrentHashMap(); // Modern thread-safe alternative!\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "ht", label: "HashTable (Locked)", type: "security", role: "Synchronized (Slow)" },
        { id: "hm", label: "HashMap (Open)", type: "cache", role: "Not Synchronized (Fast)" },
        { id: "clerk1", label: "Clerk A", type: "client" },
        { id: "clerk2", label: "Clerk B (Blocked)", type: "client" },
        { id: "clerk3", label: "Clerk C", type: "client" },
        { id: "clerk4", label: "Clerk D", type: "client" }
      ],
      connections: [
        { from: "clerk1", to: "ht", label: "Locks Access", animated: true },
        { from: "clerk2", to: "ht", label: "Waiting..." },
        { from: "clerk3", to: "hm", label: "Instant Put", animated: true },
        { from: "clerk4", to: "hm", label: "Instant Put", animated: true }
      ]
    }
  },
  {
    id: "java-core-8",
    category: "Java Core Concepts",
    question: "What are Checked vs. Unchecked Exceptions in Java?",
    answer: "**Analogy: The Airport Passport Gate vs. Slipping on a Sidewalk**\n\nImagine you are going on an overseas vacation.\n\n* **Checked Exceptions (Airport Passport Control):** Before boarding the plane, the security agent *checks* your passport and visa. If you don't have them, they physically block you from passing (the Compiler checks this at compile-time). In Java, if a method might throw an `IOException`, the compiler forces you to handle it (using try-catch or throws) before it compiles your code.\n* **Unchecked Exceptions (Slipping on a Sidewalk):** You are walking down the sidewalk and suddenly slip on an unexpected banana peel (e.g., a `NullPointerException` or `ArrayIndexOutOfBoundsException`). The town doesn't inspect you before you leave your house; this happens during execution (Runtime) because of a bad code logic step.\n\n---\n\n### **Code Comparison**\n```java\n// Checked: Will not compile unless surrounded by try-catch or declared throws\nFileReader file = new FileReader(\"doc.txt\"); \n\n// Unchecked: Compiles perfectly, but crashes at runtime if str is null\nString str = null;\nstr.length(); // Throws NullPointerException!\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "compiler", label: "Java Compiler (Gate)", type: "gateway" },
        { id: "checked", label: "Checked (IOException)", type: "security", role: "Must try-catch or throws" },
        { id: "runtime", label: "JVM Executor (Sidewalk)", type: "server" },
        { id: "unchecked", label: "Unchecked (NullPointer)", type: "alert", role: "Runtime logic bug" }
      ],
      connections: [
        { from: "checked", to: "compiler", label: "Enforced at Compile" },
        { from: "runtime", to: "unchecked", label: "Crashes dynamically", animated: true }
      ]
    }
  },
  {
    id: "java-core-9",
    category: "Java Core Concepts",
    question: "How do Java Generics prevent Runtime Type-Cast Crashes?",
    answer: "**Analogy: Laser-Etched Shipment Labels**\n\nImagine shipping items across the country in plain brown boxes.\n\nWithout **Generics** (pre-Java 5), your boxes are generic containers that can hold absolutely anything: a cake, a puppy, or a heavy bowling ball. When your warehouse worker reaches inside a box expecting to pull out a fluffy cake, they grab a heavy 15-pound bowling ball instead, dropping it and breaking their foot (this is a `ClassCastException` crashing your app at Runtime).\n\nWith **Generics**, the compiler forces you to print a clear, laser-etched label on the box, like `List<Cake>`. The warehouse supervisor (the Compiler) checks every item. If someone tries to slip a bowling ball into that box, the supervisor intercepts them instantly at compile-time. Now, when you pull items out, you are guaranteed to get a Cake safely!\n\n---\n\n### **Generics in Action**\n```java\n// Non-Generic (Dangerous):\nList list = new ArrayList();\nlist.add(\"Hello\");\nInteger num = (Integer) list.get(0); // Runtime ClassCastException!\n\n// Generic (Safe):\nList<String> list2 = new ArrayList<>();\nlist2.add(\"Hello\");\n// list2.add(123); // Compiler BLOCKS this instantly!\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "gen", label: "Generic List<Cake>", type: "cache", role: "Holds only Cake instances" },
        { id: "cake", label: "Cake Object", type: "server" },
        { id: "comp", label: "Compiler Guard", type: "gateway" },
        { id: "ball", label: "Bowling Ball Object", type: "alert", role: "Compile error trigger!" }
      ],
      connections: [
        { from: "cake", to: "gen", label: "Fits label perfectly" },
        { from: "ball", to: "comp", label: "Attempts entry" },
        { from: "comp", to: "ball", label: "Blocks instantly!", animated: true }
      ]
    }
  },
  {
    id: "java-core-10",
    category: "Java Core Concepts",
    question: "What is the difference between ArrayList and LinkedList in Java?",
    answer: "**Analogy: Auditorium Seats vs. A Conga Line**\n\nImagine organizing 100 students in a room.\n\n* **ArrayList (Auditorium Seats):** You place students in numbered auditorium seats (contiguous memory block). If you want to find the student in seat #45, you can point directly there and call their name instantly (**O(1) random access**). However, if you want to squeeze a new student into seat #5, everyone from seat 5 to 100 has to stand up and slide over one seat (expensive **O(N) shift operation**).\n* **LinkedList (A Conga Line):** Every student stands in a chain. Each student holds a piece of paper pointing to the shoulders of the next person. If you want to add a new person, you just tell two people to break hands, place the new student, and point (fast **O(1) insertion**). But if you want to find student #45, you can't jump directly there; you have to walk from the very front of the line, asking each person who they are pointing to until you reach #45 (**O(N) search time**).\n\n---\n\n### **Key Guidelines**\n* Use **ArrayList** by default for fast reads and iteration.\n* Use **LinkedList** if your application is constantly inserting or removing elements at the edges.\n\n```java\nList<String> arrayList = new ArrayList<>(); // Contiguous array\nList<String> linkedList = new LinkedList<>(); // Chained nodes\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "al", label: "ArrayList (Auditorium)", type: "cache", role: "Contiguous Array Slots" },
        { id: "al-slot", label: "[0] [1] [2] [3] [4] [5]", type: "text" },
        { id: "ll", label: "LinkedList (Conga Line)", type: "queue", role: "Doubly-Chained Nodes" },
        { id: "ll-0", label: "Head Node", type: "server" },
        { id: "ll-1", label: "Middle Node", type: "server" },
        { id: "ll-2", label: "Tail Node", type: "server" }
      ],
      connections: [
        { from: "ll-0", to: "ll-1", label: "Linked Reference", animated: true },
        { from: "ll-1", to: "ll-2", label: "Linked Reference", animated: true }
      ]
    }
  }
];

// Append all Java Core Concepts questions to our main question list
JAVA_CORE_CONCEPTS_BATCH_1.forEach((q) => {
  INTERVIEW_QUESTIONS.push(q);
});

// Define Batch 2: Java OOP Concepts (8 Questions)
const JAVA_OOP_CONCEPTS: InterviewQuestion[] = [
  {
    id: "java-oop-1",
    category: "Java OOP Concepts",
    question: "What is Abstraction and how does it differ from Encapsulation?",
    answer: "**Analogy: Driving a Car (Abstraction) vs. Locking the Engine Hood (Encapsulation)**\n\nImagine you are driving a sedan.\n\n* **Abstraction (Simplification for Use):** When you drive, you interact with simple controls: a steering wheel, a gas pedal, and a brake pedal. You don't need to understand thermodynamics, fuel injectors, or how the pistons move to go forward. Abstraction **hides the complex implementation details** and only shows the essential features.\n* **Encapsulation (Security & Protection):** The car's engine, battery, and intricate gears are safely sealed under a locked metal hood. You can't reach in and mess with the spark plugs while driving. It **bundles the data and the methods that operate on that data** into a single unit (the class), and restricts direct access to protect the system's integrity.\n\n---\n\n### **Code Example**\n```java\npublic class Car {\n    private int fuelLevel; // Encapsulated variable (hidden from outside)\n\n    public void drive() {  // Abstract action (easy to call)\n        if (fuelLevel > 0) {\n            igniteEngine();\n            System.out.println(\"Driving forward!\");\n        }\n    }\n\n    private void igniteEngine() { // Hidden helper detail\n        // Complex internal wiring...\n    }\n}\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "driver", label: "User / Driver", type: "client" },
        { id: "abs", label: "Abstraction Barrier (Controls)", type: "gateway", role: "Steering, Pedals (Public Methods)" },
        { id: "enc", label: "Encapsulated Core (Engine Hood)", type: "security", role: "Pistons, Fuel Level (Private Variables)" }
      ],
      connections: [
        { from: "driver", to: "abs", label: "Interacts with", animated: true },
        { from: "abs", to: "enc", label: "Triggers inside", animated: false }
      ]
    }
  },
  {
    id: "java-oop-2",
    category: "Java OOP Concepts",
    question: "What is Polymorphism, and what is the difference between Compile-time (Overloading) and Runtime (Overriding) Polymorphism?",
    answer: "**Analogy: The \"Speak\" Button on Different Toys**\n\nPolymorphism means \"many forms.\" It allows you to perform a single action in different ways.\n\n* **Compile-Time Polymorphism (Method Overloading - \"Same Name, Different Signature\"):** Imagine a walkie-talkie with a sound effect knob. If you turn it once, it plays a short beep. If you turn it and hold the button, it plays a siren. It's the same physical button, but the actions differ based on *how many inputs* or *what types of inputs* you provide. The Compiler resolves which method to call at compile-time.\n* **Runtime Polymorphism (Method Overriding - \"Same Signature, Different Species\"):** Imagine a generic plush toy with a squeeze-activated speaker box inside. If you put the box inside a plush Dog, it barks. If you put the exact same box design inside a plush Cat, it meows. The code looks like `toy.speak()`, but the actual action is decided at **Runtime** based on the specific type of object that was created.\n\n---\n\n### **Code Implementation**\n```java\n// Runtime Polymorphism (Overriding)\nclass Animal {\n    void speak() { System.out.println(\"Generic noise\"); }\n}\nclass Dog extends Animal {\n    @Override\n    void speak() { System.out.println(\"Woof!\"); }\n}\n\nAnimal animal = new Dog(); // Parent reference pointing to child object\nanimal.speak(); // Prints \"Woof!\" resolved at RUNTIME\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "ref", label: "Animal animal", type: "client", role: "Parent Reference" },
        { id: "dog", label: "new Dog() Object", type: "server", role: "Actual Child Type" },
        { id: "speak", label: "speak() -> 'Woof!'", type: "text", role: "Runtime Resolution" }
      ],
      connections: [
        { from: "ref", to: "dog", label: "Points to", animated: true },
        { from: "dog", to: "speak", label: "Executes overridden", animated: true }
      ]
    }
  },
  {
    id: "java-oop-3",
    category: "Java OOP Concepts",
    question: "What is the difference between an Interface and an Abstract Class in Java?",
    answer: "**Analogy: The Universal Power Specification vs. A Semi-built House Blueprint**\n\n* **Interface (The Universal Specification - \"What it can do\"):** An interface is like a blueprint for a wall outlet. It says: \"Any plug that wants power must have exactly these three copper prongs.\" It doesn't care how the power station generates electricity—it just enforces a contract. Classes **implement** interfaces to declare capabilities (e.g., \"I can run\", \"I can print\").\n* **Abstract Class (The Semi-built House - \"What it is\"):** An abstract class is a partially completed house. It has a real concrete roof, a real concrete floor, and real plumbing (implemented methods), but is missing windows and paint (abstract methods). You cannot live in it directly (cannot instantiate it). A child class must inherit it, paint the walls, and insert the windows to make it a livable home.\n\n---\n\n### **Quick Selection Rule**\n* Use an **Interface** when you want to define a common behavior across completely unrelated classes (e.g., a `Plane` and a `Bird` both implement `Flyable`).\n* Use an **Abstract Class** when classes share a strong family relationship and you want to share common code (e.g., `Dog` and `Cat` both extend `Mammal`).\n\n```java\ninterface Flyable { void fly(); } // Pure specification\n\nabstract class Mammal {\n    void breathe() { System.out.println(\"Inhaling oxygen...\"); } // Shared concrete behavior\n    abstract void makeSound(); // Abstract spec\n}\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "int", label: "Interface (Specification)", type: "gateway", role: "Contract of behavior" },
        { id: "ac", label: "Abstract Class (Template)", type: "server", role: "Has shared state + methods" },
        { id: "impl1", label: "Bird (Class)", type: "client" },
        { id: "impl2", label: "Dog (Class)", type: "client" }
      ],
      connections: [
        { from: "impl1", to: "int", label: "implements Flyable" },
        { from: "impl2", to: "ac", label: "extends Mammal", animated: true }
      ]
    }
  },
  {
    id: "java-oop-4",
    category: "Java OOP Concepts",
    question: "What is Encapsulation, and why do we use private variables with public getters/setters?",
    answer: "**Analogy: The Snack Vending Machine**\n\nImagine a snack vending machine.\n\n* If the machine's front glass door is wide open (public fields), anyone can walk up, snatch ten bags of potato chips, change the price tags to $0.00, or jam dirt into the bill acceptor. The machine's state would be corrupted instantly.\n* Instead, the vending machine is safely locked inside a metal container with a glass view (private variables). You can only interact with it by pushing buttons, dropping coins, and checking the small LCD panel (public getters and setters). If you try to input a negative price, the internal code rejects your request immediately!\n\n---\n\n### **Code Implementation with Validation**\n```java\npublic class VendingMachine {\n    private int balance; // Hidden private state\n\n    public int getBalance() { // Controlled getter\n        return this.balance;\n    }\n\n    public void insertCoin(int amount) { // Controlled setter (validation)\n        if (amount > 0) {\n            this.balance += amount;\n        } else {\n            System.out.println(\"Invalid coin!\");\n        }\n    }\n}\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "hacker", label: "External Code", type: "client" },
        { id: "gate", label: "Setter: insertCoin()", type: "gateway", role: "Validates inputs > 0" },
        { id: "state", label: "private int balance", type: "security", role: "Protected State" }
      ],
      connections: [
        { from: "hacker", to: "gate", label: "Passes coin", animated: true },
        { from: "gate", to: "state", label: "Updates state securely" }
      ]
    }
  },
  {
    id: "java-oop-5",
    category: "Java OOP Concepts",
    question: "Why is Composition preferred over Inheritance in Java?",
    answer: "**Analogy: Building a PC (Composition) vs. Being Born with a Permanent Third Arm (Inheritance)**\n\n* **Inheritance (Is-A Relationship):** This is a rigid, birthright relationship. If you design a `SmartPhone` class to extend a `DigitalCamera` class, the smartphone is permanently locked into everything the camera does. If the camera changes its focus engine, your smartphone might break or gain useless baggage. It represents a tight coupling.\n* **Composition (Has-A Relationship):** This is a loose, modular assembly. Instead of *being* a camera, the `SmartPhone` simply **has** a `Camera` module slotted inside its casing. If you want to upgrade the smartphone's camera, you just plug in a new `Camera` object! It is incredibly flexible, makes testing easy, and prevents your class hierarchies from collapsing.\n\n---\n\n### **Composition Code Example**\n```java\nclass Processor { void compute() {} }\nclass Memory { void load() {} }\n\n// Computer HAS-A Processor and Memory\npublic class Computer {\n    private Processor processor = new Processor();\n    private Memory memory = new Memory();\n\n    public void run() {\n        memory.load();\n        processor.compute();\n    }\n}\n```",
    visual: {
      type: "layers",
      nodes: [
        { id: "comp", label: "Computer (Outer Wrapper)", type: "server" },
        { id: "proc", label: "Processor (Injected)", type: "cache", role: "Loose dependency" },
        { id: "mem", label: "Memory (Injected)", type: "cache", role: "Loose dependency" }
      ],
      connections: [
        { from: "comp", to: "proc", label: "Delegates to", animated: true },
        { from: "comp", to: "mem", label: "Delegates to", animated: true }
      ]
    }
  },
  {
    id: "java-oop-6",
    category: "Java OOP Concepts",
    question: "What does the 'final' keyword do when applied to variables, methods, and classes?",
    answer: "**Analogy: The Permanently Sealed Jar**\n\nThe `final` keyword in Java acts as a permanent seal or lock.\n\n* **Final Variable (The Locked Vault):** Once you place a value inside, you can never replace it. It becomes a read-only constant. (e.g., `final double PI = 3.14159;`)\n* **Final Method (The Protected Secret Recipe):** If a parent class has a final method, child classes are allowed to use it, but are strictly forbidden from rewriting it (cannot override it). It prevents anyone from changing core business rules.\n* **Final Class (The End of the Evolutionary Line):** A final class can never be inherited (cannot be extended). It is a complete, sealed species. (For example, Java's `String` class is final to guarantee security and immutability).\n\n---\n\n### **Code Examples**\n```java\npublic final class ProtectedTool { // Cannot be extended\n    public final void performCoreTask() { // Cannot be overridden\n        final int MAX_ATTEMPTS = 3; // Cannot be reassigned\n    }\n}\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "child", label: "Subclass attempt", type: "client" },
        { id: "finalclass", label: "final class Security", type: "security", role: "Cannot be inherited!" },
        { id: "finalmethod", label: "final void verify()", type: "security", role: "Cannot be overridden!" }
      ],
      connections: [
        { from: "child", to: "finalclass", label: "Blocks Extends", animated: true },
        { from: "child", to: "finalmethod", label: "Blocks Overriding" }
      ]
    }
  },
  {
    id: "java-oop-7",
    category: "Java OOP Concepts",
    question: "What is Method Overriding, and how do Covariant Return Types work?",
    answer: "**Analogy: Family Restaurant Overhaul**\n\n* **Method Overriding:** Imagine inheriting your parent's traditional steakhouse restaurant. The menu has a method called `serveMeal()`. Since you want to adapt to modern times, you override `serveMeal()` to serve a modern vegan selection instead. The menu item name is identical, but the dish served is different.\n* **Covariant Return Type:** In Java, when you override a method, you are allowed to change the return type to a more specific subclass of the original return type. If your parent's menu returns a generic `Food` object, your overridden menu is allowed to return a specific `VeganSalad` (which is a subclass of `Food`). It makes the code much cleaner and prevents messy casting!\n\n---\n\n### **Code Implementation**\n```java\nclass Food {}\nclass Salad extends Food {}\n\nclass ParentRestaurant {\n    Food cookMeal() { return new Food(); }\n}\n\nclass ModernBistro extends ParentRestaurant {\n    @Override\n    Salad cookMeal() { // Covariant Return Type (Salad is a Food)\n        return new Salad();\n    }\n}\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "parent", label: "ParentRestaurant", type: "server", role: "Returns: Food" },
        { id: "child", label: "ModernBistro", type: "server", role: "Overrides cookMeal()" },
        { id: "salad", label: "Salad (Subclass of Food)", type: "cache", role: "Specific Covariant Type" }
      ],
      connections: [
        { from: "child", to: "parent", label: "Inherits" },
        { from: "child", to: "salad", label: "Returns specifically", animated: true }
      ]
    }
  },
  {
    id: "java-oop-8",
    category: "Java OOP Concepts",
    question: "What is the 'super' keyword in Java and how is it used?",
    answer: "**Analogy: Calling the Main Office for Help**\n\nImagine you are running a local franchise of a shipping office.\n\nSometimes, a customer asks for a service that is too complex for your local branch to handle alone. To resolve it, you lift the phone and call the parent office's staff to execute their standard procedure. This is what `super` does.\n\nIn Java, `super` is a reference variable used to refer to immediate parent class objects:\n1. **Invoke Parent Constructors:** Calling `super()` inside a child constructor boots up the parent class's setup logic first.\n2. **Access Parent Methods:** If you override a parent method but still want to run the parent's original code inside it, you write `super.parentMethod()`.\n\n---\n\n### **Code Usage**\n```java\nclass Parent {\n    Parent() { System.out.println(\"Parent Setup\"); }\n    void work() { System.out.println(\"Parent working\"); }\n}\n\nclass Child extends Parent {\n    Child() {\n        super(); // 1. Invokes parent constructor\n    }\n    void work() {\n        super.work(); // 2. Invokes parent's original method\n        System.out.println(\"Child adding special tasks\");\n    }\n}\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "child", label: "Child Instance", type: "client" },
        { id: "supercall", label: "super.work() Call", type: "gateway" },
        { id: "parent", label: "Parent Class Logic", type: "server" }
      ],
      connections: [
        { from: "child", to: "supercall", label: "Requests Parent help", animated: true },
        { from: "supercall", to: "parent", label: "Delegates Upward", animated: true }
      ]
    }
  }
];

// Define Batch 3: Java Design Patterns & Architecture (7 Questions)
const JAVA_DESIGN_PATTERNS: InterviewQuestion[] = [
  {
    id: "java-dp-1",
    category: "Java Design Patterns",
    question: "What is the Singleton Design Pattern, and how do you implement thread-safe Lazy Initialization in Java?",
    answer: "**Analogy: The Single Royal Palace Stamp**\n\nImagine a medieval kingdom with one supreme royal stamp. If every local lord carved their own identical stamp, it would lead to fraud, chaos, and double-spent taxes. Instead, there is exactly *one* master physical stamp kept in a locked glass case inside the Royal Palace. Anyone who needs a document approved must bring it to this single master stamp.\n\nIn Software, a **Singleton** ensures that a class has **only one active instance** globally in memory and provides a single global access point to it (e.g., a database connection pool or configuration manager).\n\nTo make it thread-safe and lazy (only loaded when first requested), we use **Double-Checked Locking** with the `volatile` keyword.\n\n---\n\n### **Thread-Safe Lazy Singleton Implementation**\n```java\npublic class DatabaseConnection {\n    // Volatile prevents CPU instruction reordering bugs\n    private static volatile DatabaseConnection instance;\n\n    private DatabaseConnection() { // Private constructor prevents new instances!\n    }\n\n    public static DatabaseConnection getInstance() {\n        if (instance == null) { // First check (no synchronization overhead if initialized)\n            synchronized (DatabaseConnection.class) {\n                if (instance == null) { // Second check under lock\n                    instance = new DatabaseConnection();\n                }\n            }\n        }\n        return instance;\n    }\n}\n```",
    visual: {
      type: "cycle",
      nodes: [
        { id: "t1", label: "Thread A", type: "client" },
        { id: "t2", label: "Thread B", type: "client" },
        { id: "lock", label: "Synchronized Lock Gate", type: "security" },
        { id: "single", label: "Single Master Instance", type: "db", role: "DatabaseConnection" }
      ],
      connections: [
        { from: "t1", to: "lock", label: "Checks null", animated: true },
        { from: "t2", to: "lock", label: "Blocks / Waits" },
        { from: "lock", to: "single", label: "Instantiates once", animated: true }
      ]
    }
  },
  {
    id: "java-dp-2",
    category: "Java Design Patterns",
    question: "What is the Factory Design Pattern, and how does it decouple object creation?",
    answer: "**Analogy: Ordering Coffee at a Barista Counter**\n\nImagine you want a cup of coffee. If you had to grow coffee beans, roast them, grind them, steam the milk, and pull the shot yourself, you would be tightly coupled to the hardware of the coffee makers.\n\nInstead, you walk up to a barista counter (The **Factory**) and simply say \"Give me a Latte\". The barista takes your order, handles the grinders and steam valves in the background, and hands you a hot cup. You don't know or care which specific espresso machine or coffee brand was used—you just get a finished product that conforms to the `Coffee` interface!\n\nThis completely decouples your application code from the concrete classes and constructors.\n\n---\n\n### **Decoupled Factory Implementation**\n```java\ninterface Coffee { void drink(); }\nclass Latte implements Coffee { public void drink() { System.out.println(\"Drinking latte!\"); } }\nclass Espresso implements Coffee { public void drink() { System.out.println(\"Drinking espresso!\"); } }\n\npublic class CoffeeFactory {\n    public static Coffee createCoffee(String type) {\n        if (type.equalsIgnoreCase(\"latte\")) return new Latte();\n        if (type.equalsIgnoreCase(\"espresso\")) return new Espresso();\n        throw new IllegalArgumentException(\"Unknown coffee type\");\n    }\n}\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "client", label: "Client Code", type: "client", role: "Requests 'Latte'" },
        { id: "factory", label: "CoffeeFactory", type: "gateway", role: "Decoupled Creator" },
        { id: "latte", label: "Latte Instance", type: "server", role: "Implements Coffee" },
        { id: "espresso", label: "Espresso Instance", type: "server", role: "Implements Coffee" }
      ],
      connections: [
        { from: "client", to: "factory", label: "createCoffee('latte')", animated: true },
        { from: "factory", to: "latte", label: "Returns new Latte()", animated: true }
      ]
    }
  },
  {
    id: "java-dp-3",
    category: "Java Design Patterns",
    question: "What is the Strategy Design Pattern, and how does it allow swapping behaviors at runtime?",
    answer: "**Analogy: Swapping Navigation Routes on Google Maps**\n\nImagine you are using a navigation app on your phone to travel from your house to downtown.\n\n* If you click **Driving**, the map highlights highways.\n* If you click **Walking**, the map highlights pedestrian shortcuts and sidewalks.\n* If you click **Cycling**, the map highlights bike paths.\n\nYour phone screen and start/end locations remain exactly the same. The app doesn't have a massive, messy `if-else` block inside its map rendering engine. Instead, it has a slot for a `RouteStrategy`. When you click a transportation button, it simply swaps the active strategy object at runtime, changing the underlying calculation instantly!\n\n---\n\n### **Strategy Code Implementation**\n```java\ninterface RouteStrategy { void buildRoute(); }\n\nclass DriveStrategy implements RouteStrategy {\n    public void buildRoute() { System.out.println(\"Building highway route\"); }\n}\nclass WalkStrategy implements RouteStrategy {\n    public void buildRoute() { System.out.println(\"Building sidewalk shortcut\"); }\n}\n\n// Context holding the strategy\npublic class NavigationApp {\n    private RouteStrategy strategy;\n\n    public void setStrategy(RouteStrategy strategy) { this.strategy = strategy; }\n    public void calculate() { strategy.buildRoute(); }\n}\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "app", label: "NavigationApp", type: "client", role: "Context" },
        { id: "strat-drive", label: "DriveStrategy", type: "server", role: "Calculates Highways" },
        { id: "strat-walk", label: "WalkStrategy", type: "server", role: "Calculates Sidewalks" }
      ],
      connections: [
        { from: "app", to: "strat-drive", label: "Set active strategy", animated: true }
      ]
    }
  },
  {
    id: "java-dp-4",
    category: "Java Design Patterns",
    question: "What is the Observer Design Pattern, and how is it used in event-driven systems?",
    answer: "**Analogy: Subscribing to a YouTube Channel**\n\nImagine a popular YouTube channel (The **Subject** or **Publisher**).\n\nIf the creator forced all 100,000 fans to refresh the page every 5 minutes to check for a new video, it would overwhelm the server and exhaust the users. Instead, fans simply click the \"Subscribe\" button (registering as **Observers**). The channel maintains a list of these subscribed users. The moment a new video is uploaded, the channel automatically sends an push alert (broadcasts a notification) directly to every single subscriber on the list instantly!\n\n---\n\n### **Observer Code Implementation**\n```java\nimport java.util.ArrayList;\nimport java.util.List;\n\ninterface Subscriber { void update(String videoTitle); }\n\nclass Fan implements Subscriber {\n    private String name;\n    public Fan(String name) { this.name = name; }\n    public void update(String title) { System.out.println(name + \" received: \" + title); }\n}\n\nclass Channel {\n    private List<Subscriber> subs = new ArrayList<>();\n    public void subscribe(Subscriber s) { subs.add(s); }\n    public void uploadVideo(String title) {\n        for (Subscriber s : subs) { s.update(title); } // Broadcast notify\n    }\n}\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "pub", label: "YouTube Channel (Subject)", type: "gateway", role: "Holds Observer List" },
        { id: "sub1", label: "Subscriber A (Fan)", type: "client" },
        { id: "sub2", label: "Subscriber B (Fan)", type: "client" },
        { id: "sub3", label: "Subscriber C (Fan)", type: "client" }
      ],
      connections: [
        { from: "pub", to: "sub1", label: "Push Notification", animated: true },
        { from: "pub", to: "sub2", label: "Push Notification", animated: true },
        { from: "pub", to: "sub3", label: "Push Notification", animated: true }
      ]
    }
  },
  {
    id: "java-dp-5",
    category: "Java Design Patterns",
    question: "What is the Builder Design Pattern, and how does it solve the Telescoping Constructor anti-pattern?",
    answer: "**Analogy: Building a Custom Subway Sandwich**\n\nImagine walking into a Subway sandwich shop.\n\n* If the restaurant used a traditional constructor, you'd have to buy pre-made sandwiches with fixed combinations (e.g., `Sandwich(bread, cheese, meat, lettuce, tomato, onions, mayo, mustard)`). If you didn't want onions or mustard, you'd have to pass `null` or `false` in a confusing, long line of arguments (`new Sandwich(\"wheat\", \"cheddar\", \"turkey\", true, true, false, true, false)`). This is the **Telescoping Constructor** problem!\n* Instead, the sandwich maker uses the **Builder Pattern**. They hand you an empty tray. You guide them step-by-step: `addBread(\"wheat\")`, `addMeat(\"turkey\")`, `addCheese(\"cheddar\")`, and then you say `build()`. You get exactly what you wanted, the parameters are completely readable, and the object is constructed cleanly and safely.\n\n---\n\n### **Builder Code Implementation**\n```java\npublic class Sandwich {\n    private String bread; private String meat; private boolean hasCheese;\n\n    private Sandwich(Builder builder) { // Private constructor forced\n        this.bread = builder.bread;\n        this.meat = builder.meat;\n        this.hasCheese = builder.hasCheese;\n    }\n\n    public static class Builder {\n        private String bread; private String meat; private boolean hasCheese;\n\n        public Builder bread(String b) { this.bread = b; return this; }\n        public Builder meat(String m) { this.meat = m; return this; }\n        public Builder cheese(boolean c) { this.hasCheese = c; return this; }\n        public Sandwich build() { return new Sandwich(this); }\n    }\n}\n\n// Usage:\nSandwich s = new Sandwich.Builder().bread(\"wheat\").meat(\"turkey\").cheese(true).build();\n```",
    visual: {
      type: "layers",
      nodes: [
        { id: "builder", label: "Sandwich.Builder", type: "gateway", role: "Step-by-step collector" },
        { id: "step1", label: ".bread('wheat')", type: "text" },
        { id: "step2", label: ".meat('turkey')", type: "text" },
        { id: "final", label: "new Sandwich() Object", type: "server", role: "Completed Product" }
      ],
      connections: [
        { from: "builder", to: "step1", animated: true },
        { from: "step1", to: "step2", animated: true },
        { from: "step2", to: "final", label: "build() method", animated: true }
      ]
    }
  },
  {
    id: "java-dp-6",
    category: "Java Design Patterns",
    question: "What is the Adapter Design Pattern, and when should you use it?",
    answer: "**Analogy: European-to-US Wall Plug Adapter**\n\nImagine you travel from Singapore to New York with your favorite hair dryer. The Singapore wall plug has three large rectangular prongs, but the New York hotel outlet only accepts two flat prongs. You cannot plug your dryer directly into the wall—the interfaces are incompatible, even though both handle electricity.\n\nTo solve this, you pull out a small travel **Adapter**. You plug your Singapore dryer into the adapter's socket, and plug the adapter's flat prongs into the New York wall. The adapter doesn't generate electricity; it simply translates or routes the incompatible plugs so they can work together cleanly!\n\nIn Software, the **Adapter** pattern makes two incompatible interfaces work together.\n\n---\n\n### **Adapter Code Implementation**\n```java\ninterface USPlug { void powerOn110V(); }\nclass SGHairDryer { void powerOn240V() { System.out.println(\"Dryer spinning at 240V\"); } }\n\n// Adapter translates USPlug requests to SGHairDryer calls\nclass PlugAdapter implements USPlug {\n    private SGHairDryer dryer;\n    public PlugAdapter(SGHairDryer dryer) { this.dryer = dryer; }\n\n    @Override\n    public void powerOn110V() {\n        System.out.println(\"Adapter stepping up current...\");\n        dryer.powerOn240V();\n    }\n}\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "wall", label: "US Wall Outlet (110V)", type: "client" },
        { id: "adapt", label: "PlugAdapter", type: "gateway", role: "Translates Interface" },
        { id: "dryer", label: "SG Hair Dryer (240V)", type: "server" }
      ],
      connections: [
        { from: "wall", to: "adapt", label: "powerOn110V()", animated: true },
        { from: "adapt", to: "dryer", label: "powerOn240V()", animated: true }
      ]
    }
  },
  {
    id: "java-dp-7",
    category: "Java Design Patterns",
    question: "What is the Decorator Design Pattern, and how does it dynamically add behavior without subclassing?",
    answer: "**Analogy: Adding Toppings to a Cup of Coffee**\n\nImagine ordering a basic cup of black coffee at a premium coffee lounge.\n\nIf you wanted to support every possible combination of toppings using subclassing (Inheritance), you'd have to write dozens of redundant classes: `CoffeeWithMilk`, `CoffeeWithWhippedCream`, `CoffeeWithMilkAndSprinkles`, and so on. This leads to a class explosion!\n\nInstead, you order a basic `BlackCoffee` object. When you want milk, the barista wraps your coffee in a `MilkDecorator`. If you want sprinkles, they wrap that wrapped mug in a `SprinklesDecorator`. Each decorator class **implements the same Coffee interface** and **holds a reference to a Coffee object**, adding its own cost and taste behavior dynamically before passing the call to the inner drink!\n\n---\n\n### **Decorator Code Implementation**\n```java\ninterface Coffee { double getCost(); }\nclass BasicCoffee implements Coffee { public double getCost() { return 2.0; } }\n\nabstract class CoffeeDecorator implements Coffee {\n    protected Coffee tempCoffee;\n    public CoffeeDecorator(Coffee c) { this.tempCoffee = c; }\n    public double getCost() { return tempCoffee.getCost(); }\n}\n\nclass MilkDecorator extends CoffeeDecorator {\n    public MilkDecorator(Coffee c) { super(c); }\n    public double getCost() { return super.getCost() + 0.50; } // Add milk cost!\n}\n```",
    visual: {
      type: "layers",
      nodes: [
        { id: "milk", label: "MilkDecorator (Outer Layer)", type: "gateway", role: "+$0.50" },
        { id: "inner", label: "BasicCoffee (Inner Core)", type: "server", role: "$2.00" }
      ],
      connections: [
        { from: "milk", to: "inner", label: "Wraps & Delegates", animated: true }
      ]
    }
  }
];

// Define Batch 4: Advanced Java Engineering Articles (Legacy Code, Performance, OutOfMemoryError)
const ADVANCED_JAVA_ENGINEERING_ARTICLES: InterviewQuestion[] = [
  {
    id: "java-legacy-1",
    category: "Java Design Patterns",
    question: "How do you safely inherit and add features to a legacy Java service with zero existing tests?",
    answer: "**Analogy: The Legacy Surgeon**\n\nRefactoring without tests is like performing surgery without a heart monitor. Before you cut open the patient, you first attach **Characterization Tests** (the monitor) to capture the living, breathing state of the system right now. Then, you carve out **Seams** (interfaces and dependency injection) to create safe boundaries, perform tiny micro-incisions (incremental refactors), and safely stitch in your new feature.\n\n---\n\n### **The Step-by-Step Modernization Strategy**\n\n1. **Build a Safety Net (Characterization Tests):** These are 'golden master' tests. They don't check what the code *should* do; they record and lock in what the code *actually* does under specific inputs.\n2. **Introduce Seams:** Break tight dependencies. Extract hard-coded database creations or API singletons into interfaces, and inject them via constructors.\n3. **Refactor Incrementally:** Change one variable or small method at a time. Run your safety tests after every single change. If the tests pass, you are safe; if they fail, revert immediately.\n4. **Add the New Feature with Full Unit Tests:** Write your clean, modern feature in its own isolated class, then wire it up under a **Feature Flag** for gradual production rollout.\n\n---\n\n### **Creating a Seam with Dependency Injection**\n\n*Before (Tight Coupling - Untestable):*\n```java\npublic class InvoiceService {\n    public void processInvoice() {\n        Database db = new Database(); // Hard dependency! Hard to mock.\n        db.saveRecord();\n    }\n}\n```\n\n*After (Constructor Injection - High Testability):*\n```java\npublic class InvoiceService {\n    private final Database db;\n    // Dependency injection creates a \"seam\" where we can mock the DB!\n    public InvoiceService(Database db) {\n        this.db = db;\n    }\n    public void processInvoice() {\n        db.saveRecord();\n    }\n}\n```",
    visual: {
      type: "flow",
      nodes: [
        { id: "legacy", label: "Legacy Service (Untested)", type: "alert", role: "Hard-coded dependencies" },
        { id: "char-tests", label: "Characterization Tests", type: "security", role: "Lock-in current behavior" },
        { id: "seams", label: "Extract Interfaces / Seams", type: "gateway", role: "Create testable boundaries" },
        { id: "refactor", label: "Incremental Refactoring", type: "cache", role: "Small, reversible changes" },
        { id: "feature", label: "New Verified Feature", type: "server", role: "Tested & feature-flagged" }
      ],
      connections: [
        { from: "legacy", to: "char-tests", label: "1. Capture Golden Master", animated: true },
        { from: "char-tests", to: "seams", label: "2. Introduce Seams", animated: true },
        { from: "seams", to: "refactor", label: "3. Surgical Splits" },
        { from: "refactor", to: "feature", label: "4. Confidently Deploy", animated: true }
      ]
    }
  },
  {
    id: "java-perf-1",
    category: "Java Core Concepts",
    question: "When a 200 ms Request suddenly takes 20 s under load, how do you diagnose and tune the JVM?",
    answer: "**Analogy: The Coffee Shop Traffic Jam**\n\nWhen a coffee shop's average customer wait time jumps from 1 minute to 1 hour, guessing doesn't help. You must measure and locate the exact bottleneck:\n* **Database Bottleneck:** Is there a single-lane cashier with no fast-indexing lanes? (Missing database indexes, N+1 query patterns, or unoptimized joins).\n* **Thread Pool Starvation:** Are all 20 baristas blocked waiting for a delayed milk truck, queuing up new orders indefinitely? (Threads waiting on slow external APIs, blocked JDBC pools, or global synchronized locks).\n* **Garbage Collection (GC) Pressure:** Is the cleaning robot pausing all customer service every 5 seconds to sweep the entire shop floor? (Excessive temporary object creation triggering massive Stop-The-World Full GC pauses).\n\n---\n\n### **The Performance Diagnostics Checklist**\n\n1. **Measure, Don't Guess:** Use Spring Boot Actuator, Micrometer, and Distributed Tracing (OpenTelemetry) to track latency per layer.\n2. **Check CPU vs. Thread State:** High CPU means compute bottlenecks or GC loops; low CPU but high latency means threads are WAITING or BLOCKED.\n3. **Tune Thread and JDBC Pools:** Ensure your JDBC connections match your concurrent thread capacity. Use asynchronous/non-blocking calls for external integrations.\n4. **Optimize GC & Heap Allocations:** Avoid reading massive payloads directly into memory; use streaming parsers (like Jackson Streaming API) and tune the JVM limits cleanly.\n\n---\n\n### **Spring Boot JVM Sizing Defaults (Recommended baseline)**\n```bash\n# Enable G1GC and configure heap sizing to prevent frequent full sweeps\njava -Xms512m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar\n```",
    visual: {
      type: "comparison",
      nodes: [
        { id: "traffic", label: "Heavy User Traffic", type: "client", role: "Spike under load" },
        { id: "threads", label: "Thread Pool Starvation", type: "queue", role: "All threads BLOCKED / WAITING" },
        { id: "db-slow", label: "DB Lock / Slow Queries", type: "db", role: "No indexes / Connection pool full" },
        { id: "gc-pause", label: "Stop-The-World GC", type: "alert", role: "Frequent CPU-heavy full sweep" }
      ],
      connections: [
        { from: "traffic", to: "threads", label: "Enters queue", animated: true },
        { from: "threads", to: "db-slow", label: "Blocks JDBC", animated: true },
        { from: "threads", to: "gc-pause", label: "Triggers pause" }
      ]
    }
  },
  {
    id: "java-oom-1",
    category: "Java Core Concepts",
    question: "What causes an OutOfMemoryError in Spring Boot, and how do you systematically fix it?",
    answer: "**Analogy: The Locked Storage Apartment**\n\nYour JVM is like an apartment. The **Heap** is the floor space where you unpack new delivery boxes (Java Objects). The **Metaspace** is a bookshelf holding assembly manuals (Class Metadata). The **Garbage Collector** is a cleaning robot that sweeps empty boxes.\n\nAn `OutOfMemoryError: Java heap space` occurs when you keep piling boxes in the center of the apartment (reaching reachable memory) without ever clearing them. Even if the cleaning robot sweeps repeatedly (Full GC), it is forbidden from throwing away any boxes you have actively registered or cached. Eventually, you run out of floor space, and the system crashes!\n\n---\n\n### **Systematic Debugging Workflow**\n\n1. **Determine OOM Type:**\n   * *Heap space:* Too many active objects (caches, leaks, huge uploads).\n   * *Metaspace:* Too many dynamic classes loaded.\n   * *Container OOMKill (Exit Code 137):* Kubernetes killed the pod because the JVM exceeded its overall container RAM limit.\n2. **Capture Evidence (Heap Dumps & Logs):** Configure your Spring Boot app to generate dumps automatically on crash:\n   ```bash\n   -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap.hprof\n   ```\n3. **Analyze the Heap Dump:** Load the `.hprof` file in Eclipse MAT (Memory Analyzer). Look at the **Dominator Tree** to identify which variables or collections hold the majority of the Heap memory.\n4. **Fix the Leak:** Limit unbounded caches (use Caffeine Cache with `maximumSize`), stream large database records or file payloads, and clean up any thread-local states inside a `finally` block.\n\n---\n\n### **Safe Bounded Cache Implementation**\n```java\n// Unbounded static lists/maps grow forever! Always use bounded, self-expiring caches.\nCache<String, UserSession> sessionCache = Caffeine.newBuilder()\n    .maximumSize(10000)                      // Protects Heap from infinite growth\n    .expireAfterWrite(Duration.ofMinutes(15)) // Auto-cleans expired entries\n    .build();\n```",
    visual: {
      type: "layers",
      nodes: [
        { id: "leaking-ref", label: "Unbounded Static Cache / ThreadLocals", type: "alert", role: "GC cannot collect" },
        { id: "heap-space", label: "JVM Heap Memory Space", type: "db", role: "Heap grows continuously" },
        { id: "gc-robot", label: "Garbage Collector Loop", type: "gateway", role: "Struggles to find reclaimable memory" },
        { id: "oom-crash", label: "OutOfMemoryError: Java heap space", type: "security", role: "Crash & System Outage" }
      ],
      connections: [
        { from: "leaking-ref", to: "heap-space", label: "Retains objects", animated: true },
        { from: "heap-space", to: "gc-robot", label: "Demands cleanup" },
        { from: "gc-robot", to: "oom-crash", label: "Fails & Crashes", animated: true }
      ]
    }
  }
];

// Append OOP and Design Pattern questions to the main list
JAVA_OOP_CONCEPTS.forEach((q) => {
  INTERVIEW_QUESTIONS.push(q);
});

JAVA_DESIGN_PATTERNS.forEach((q) => {
  INTERVIEW_QUESTIONS.push(q);
});

ADVANCED_JAVA_ENGINEERING_ARTICLES.forEach((q) => {
  INTERVIEW_QUESTIONS.push(q);
});

// Define Batch 5: Advanced System Design Articles
const ADVANCED_SYSTEM_DESIGN_ARTICLES: InterviewQuestion[] = [
  {
    id: "system-design-beginners-to-advanced-part-1",
    category: "System Design Basics",
    question: "System Design for Beginners to Advanced: The Core Idea, Building Blocks, and Why It Matters (Part 1)",
    answer: "**Analogy: The Global Restaurant Scale-Up**\n\nImagine running a cozy, single-location diner. You can personally greet guests, take orders, cook food, and handle payments (Single Machine Setup). But what happens if your restaurant suddenly becomes a global phenomenon overnight with millions of hungry diners? \n* If you try to serve everyone in that single diner, the doors will jam and the kitchen will crash (**Single Point of Failure / Compute Bottleneck**).\n* To scale, you must open multiple dining halls (**Horizontal Scaling**), install a host at the door to distribute diners to different tables (**Load Balancing**), keep pre-cooked side dishes warm and ready (**Caching**), and coordinate between different kitchen stations using a robust order ticket rail (**APIs & Message Queues**).\n\n---\n\n### **The Foundation: Why System Design Matters**\n\nWhen millions of requests pour into an app simultaneously, running on a single computer is impossible. System design is the art of engineering distributed systems where hundreds of servers, databases, and microservices work in harmony to deliver high-speed, secure, and resilient user experiences.\n\n---\n\n### **The Six Core Building Blocks**\n\n1. **Clients and Servers (The Diners & The Kitchen):** Clients (browsers/mobile apps) make requests; servers process them. They communicate via **APIs**—strict contracts defining input and output format.\n2. **Databases (The Pantry):** \n   * *SQL (Relational):* Structured, transaction-safe (ACID), great for order billing, user identity, and banking.\n   * *NoSQL (Non-Relational):* Flexible, highly-scalable, append-only, excellent for social posts, chat history, and log streams.\n3. **Load Balancers (The Front-of-House Host):** Devices that intercept incoming traffic and distribute the load across multiple backend servers to prevent overload.\n4. **Caching (The Fast-Access Sideboard):** Storing hot, frequently accessed data close to the user (e.g., Redis, CDNs) to eliminate expensive database queries and lower latency.\n5. **Scalability (Growing the Capacity):**\n   * *Vertical Scaling (Scaling Up):* Upgrading a single server with more CPU/RAM (limited by hardware physics).\n   * *Horizontal Scaling (Scaling Out):* Adding more individual servers to a cluster (unlimited potential).\n6. **Fault Tolerance & Reliability (Continuing to Serve):** Ensuring the system gracefully degrades or fails over to backup systems if primary components crash, ensuring 24/7 uptime.",
    visual: {
      type: "comparison",
      nodes: [
        { id: "vertical", label: "Vertical Scaling (Scale Up)", type: "server", role: "One giant server with high cost & hardware limits" },
        { id: "horizontal", label: "Horizontal Scaling (Scale Out)", type: "gateway", role: "Cluster of stateless standard servers behind a Load Balancer" }
      ],
      connections: [
        { from: "vertical", to: "horizontal", label: "Recommended for modern high-scale apps", animated: true }
      ]
    }
  },
  {
    id: "system-design-beginners-to-advanced-part-2",
    category: "Social & Communication",
    question: "System Design for Beginners to Advanced: Requirements, Scale, and Architecture for a WhatsApp-like System (Part 2)",
    answer: "**Analogy: The Town Square and The Message Conveyor**\n\nDesigning a system for 500M+ active users is like organizing communications for a global mega-city. If citizens shouted directly to each other, the streets would turn to chaos (Tight Coupling). Instead, we use **API Gateways** (City Toll gates), **Chat Servers** (Local Post Offices keeping open connections), **Message Queues** like Kafka (The sorting conveyor belt), and **NoSQL databases** (Rapid append-only ledger logs) to route messages and media seamlessly.\n\n---\n\n### **The Systematic Design Flow (6 Steps)**\n\n#### **Step 1: How to Think About System Design**\nGood architects never jump straight to drawing boxes. They follow a rigorous, structured flow:\n1. **Clarify requirements:** Define functional (what) and non-functional (how well) specifications.\n2. **Estimate scale:** Back-of-the-envelope calculations for traffic, storage, and throughput.\n3. **Sketch high-level design:** Identify clients, gateways, servers, caches, and storage hubs.\n4. **Dive into detailed architecture:** Storage schemas, caching patterns, and retry mechanisms.\n5. **Discuss critical trade-offs:** Consistency vs availability, CAP Theorem, and database choices.\n\n---\n\n#### **Step 2: Requirements for Our WhatsApp-Like System**\n* **Functional Requirements:**\n  * Send and receive text messages in real time.\n  * Support 1-to-1 and group chats.\n  * Show online/offline presence status.\n  * Allow media sharing (images, voice notes, videos).\n  * Provide delivery and read receipts.\n  * Notifications for new messages.\n* **Non-Functional Requirements (NFRs):**\n  * **Low Latency:** Messages should appear in under 1 second.\n  * **High Availability:** 99.99% uptime (24/7 communications).\n  * **Durability:** Messages should never be lost once acknowledged.\n  * **Scalability:** Handle 1B+ daily active users seamlessly.\n  * **Security:** Support end-to-end encryption (E2EE).\n\n---\n\n#### **Step 3: Scale Estimates (Back-of-the-Envelope Math)**\n* **Assumptions:** 500M daily active users (DAU), with each sending ~50 messages/day.\n* **Message Throughput:**\n  * Total Messages: $500\\text{M} \\times 50 = 25\\text{B messages per day}$\n  * Average Throughput: $\\approx 290\\text{K messages/second}$\n  * Peak Traffic: $\\approx 2\\text{M messages/second}$\n* **Payload Size:** Average text is 1 KB; media uploads can reach 10 MB.\n* **Implication:** This extreme throughput rules out single servers or a standard SQL instance. It demands distributed hashing, NoSQL databases, and robust caching.\n\n---\n\n#### **High-Level Architecture Blueprint**\n* **Clients:** Mobile apps (iOS/Android) connected via internet protocols (WebSockets/TCP).\n* **Load Balancer & API Gateway:** Distribute incoming traffic and enforce rate limits.\n* **Chat Servers:** Maintain active user sessions, process delivery logic, and track presence status.\n* **Message Queue (Kafka / RabbitMQ):** Decouple sender/receiver and buffer incoming bursts reliably.\n* **Database Layer:** SQL for relational user accounts/metadata; NoSQL (e.g., Cassandra/HBase) for append-only message logs to enable high-throughput writes.\n* **Blob Storage & CDN:** Handle media files separately to prevent database congestion.\n* **Notification Service:** Send push notifications (FCM/APNs) to offline recipients.\n\n---\n\n#### **Step 5: Applying the \"-ilities\" to WhatsApp**\n* **Scalability:** Spin up stateless chat servers; partition user records across Cassandra shards.\n* **Reliability:** Message queues buffer spikes; masterless databases replicate records across multiple zones.\n* **Latency:** Cache active chat sessions and recent messages in-memory (Redis).\n* **Fault Tolerance:** Multi-Availability Zone deployment with automatic routing failover.\n* **Durability:** Messages are written to append-only commit logs across replicas before dispatch acknowledgement.\n* **Security:** End-to-end keys generated and handled strictly client-side.\n* **Observability:** Metric alerts tracking delivery times, queue lag, and error rates.\n\n---\n\n#### **Step 6: Critical Architectural Trade-Offs**\n* **Consistency vs Availability:** During network partitions, WhatsApp chooses **Availability + Eventual Consistency (AP)**. Messages are delivered immediately to active replicas, with background replication syncing offline users later.\n* **Storage Selection:** Messages are strictly append-only. **NoSQL wide-column stores** (Cassandra) are chosen over relational databases because they enable fast sequential writes, massive horizontal scaling, and efficient query range scans per conversation.\n* **Media Handling:** Media payloads are large. Instead of storing images in the transactional database, clients upload files directly to **Blob Storage (S3)**, receiving a CDN link that is sent as a lightweight text payload in the chat stream.",
    visual: {
      type: "flow",
      nodes: [
        { id: "client-a", label: "Client A (Sender)", type: "client", role: "Uploads Media & Sends Text" },
        { id: "gateway", label: "API Gateway / LB", type: "gateway", role: "Auth & Rate Limiting" },
        { id: "chat-srv", label: "Chat Server (WebSockets)", type: "server", role: "Active Connections & Presence" },
        { id: "redis-cache", label: "Redis Session Cache", type: "cache", role: "Session Routing & Active Users" },
        { id: "msg-queue", label: "Kafka Broker Queue", type: "queue", role: "2M/s Message Ingestion Buffer" },
        { id: "cassandra-db", label: "Cassandra NoSQL Store", type: "db", role: "Wide-Column Append-Only Chat Log" },
        { id: "s3-cdn", label: "S3 Blob Storage + CDN", type: "db", role: "Large Media Assets (Images/Videos)" },
        { id: "notif-svc", label: "Notification Svc", type: "server", role: "Triggers FCM / APNs for Offline Users" },
        { id: "client-b", label: "Client B (Receiver)", type: "client", role: "Online check or Offline Push" }
      ],
      connections: [
        { from: "client-a", to: "gateway", label: "1. HTTP / WS Session", animated: true },
        { from: "client-a", to: "s3-cdn", label: "Media Upload", animated: false },
        { from: "gateway", to: "chat-srv", label: "Route WS Connection", animated: true },
        { from: "chat-srv", to: "redis-cache", label: "Lookup active routing", animated: false },
        { from: "chat-srv", to: "msg-queue", label: "2. Queue Message Event", animated: true },
        { from: "msg-queue", to: "cassandra-db", label: "Async persist write", animated: true },
        { from: "msg-queue", to: "notif-svc", label: "Offline check fallback", animated: false },
        { from: "notif-svc", to: "client-b", label: "Push notification alert", animated: true },
        { from: "chat-srv", to: "client-b", label: "3. Direct Push (Online)", animated: true }
      ]
    }
  },
  {
    id: "system-design-ilities-guide",
    category: "System Design Basics",
    question: "System Design “-ilities” — A Practical, Interview-Ready Guide to Non-Functional Requirements (NFRs)",
    answer: "**Analogy: The Structure of a High-Performance Bridge**\n\nWhen designing a bridge, you don't just ask if cars can cross it (**Functional Requirement**). You must ask: How many tons can it support simultaneously (**Scalability**)? How long does a crossing take (**Latency**)? What happens during an earthquake (**Fault Tolerance**)? How expensive is it to build and repair (**Cost & Maintainability**)?\n\nIn System Design, the \"-ilities\" (quality attributes or Non-Functional Requirements) are the engineering lenses we use to evaluate, justify, and trade off our architectural decisions under real-world constraints.\n\n---\n\n### **1. Core Performance & Scale**\n* **Scalability:** The ability of a system to handle growth in traffic, data, or workload. *Design Levers:* Horizontal scaling, stateless services, sharding, caching, asynchronous queues.\n* **Latency:** Time to serve a single request (e.g., p50/p95/p99 tail latency). *Design Levers:* Hot path caching, denormalization, localization, connection pooling.\n* **Throughput:** Work completed per unit time (RPS, QPS, MB/s). *Design Levers:* Batching, streaming, back-pressure, efficient serialization.\n* **Efficiency & Elasticity:** Efficiency measures resource usage vs. work done. Elasticity measures how quickly a system scales up/down smoothly with diurnal demand.\n\n---\n\n### **2. Reliability & Continuity**\n* **Reliability:** Probability the system works correctly over time. *Design Levers:* Retries with jitter, idempotency, graceful degradation, circuit breakers.\n* **Availability:** Uptime when users need it (e.g., 'three nines' = 99.9%). *Design Levers:* Multi-AZ redundancy, health checks, active-active regional deployments.\n* **Fault Tolerance & Resilience:** Fault tolerance continues operating when parts fail (replica sets, quorum). Resilience is recovering quickly and gracefully (self-healing, automated rollbacks).\n* **Redundancy & Failover:** Removing single points of failure with standby replicas and DNS/GSLB failover routers.\n* **Disaster Recovery (DR):** Restoring service after catastrophic events based on **RPO (Recovery Point Objective)** and **RTO (Recovery Time Objective)** targets.\n\n---\n\n### **3. Data Correctness & Consistency**\n* **Consistency (CAP Theorem):** Do clients see the same data at the same time? Trade off strong Consistency (CP) or high Availability (AP) during partitions.\n* **Durability:** Acknowledged data survives crashes. *Design Levers:* Write-ahead logs (WAL), replication, durable disk flush policies (`fsync`).\n* **Atomicity & Isolation (ACID):** All-or-nothing transactions and isolation levels. Distributed sagas coordinate across microservice partitions.\n* **Idempotency:** Ensuring repeating an operation has the same effect. Handled via idempotency keys or PUT semantics.\n\n---\n\n### **4. Operability, Security & Cost**\n* **Maintainability & Testability:** Ease of modifying, fixing, testing, and evolving cleanly-bounded services.\n* **Deployability:** Safely releasing updates using CI/CD pipelines, canary builds, and blue-green environments.\n* **Observability:** Inferring internal state via **Logs** (with correlation IDs), **Metrics** (RED/USE frameworks), and **Traces** (OpenTelemetry).\n* **Configurability & Extensibility:** Decoupling code from behavior via dynamic configuration and stable API gateways.\n* **Security:** Protecting confidentiality, integrity, and availability (OAuth2, TLS, encryption at rest, WAF shields).\n* **Cost-Effectiveness & Sustainability:** Delivering targets within budget while minimizing regional carbon footprint and resource wastes.",
    visual: {
      type: "layers",
      nodes: [
        { id: "performance", label: "Performance: Scalability, Latency, Throughput", type: "cache", role: "Fast user response & elastic sizing" },
        { id: "reliability", label: "Reliability: Availability, Failover, Fault Tolerance", type: "server", role: "Redundancy & self-healing uptime" },
        { id: "data", label: "Data Quality: Consistency, Durability, Idempotency", type: "db", role: "Durable WAL logs & quorum writes" },
        { id: "operations", label: "Operations: Observability, Maintainability, Security", type: "security", role: "TLS encryption, structured metrics & tracing" }
      ],
      connections: [
        { from: "performance", to: "reliability", label: "Complicates failovers" },
        { from: "reliability", to: "data", label: "CAP Theorem tradeoff", animated: true },
        { from: "data", to: "operations", label: "Aids troubleshooting" }
      ]
    }
  }
];

ADVANCED_SYSTEM_DESIGN_ARTICLES.forEach((q) => {
  INTERVIEW_QUESTIONS.push(q);
});

// Define Batch 6: Blind 75 Coding Interview Prep Articles
const BLIND_75_PREP_ARTICLES: InterviewQuestion[] = [
  {
    id: "blind-75-interview-guide",
    category: "Coding & Algorithms",
    question: "Mastering Coding Interviews: The Ultimate Blind 75 Questions Guide for Big Tech Prep",
    answer: "**Analogy: The Coding Karate Kata**\n\nPreparing for Big Tech coding interviews (Google, Meta, Amazon, Netflix) by solving thousands of random LeetCode questions is like trying to learn self-defense by street-brawling with random people. It is chaotic, inefficient, and leads to burnout.\n\nInstead, top engineers use **The Blind 75** — a highly-curated, strategic list of 75 essential coding problems. It is like practicing the **75 perfect martial arts katas**. Each problem is selected not to test memorization, but to train your muscle memory for **pattern recognition** (e.g., when you see a subarray, think Sliding Window; when you see sorted inputs, think Binary Search or Two Pointers).\n\n---\n\n### **The Blind 75 Categories & Pattern Blueprint**\n\n#### **1. Array & Sliding Window Patterns**\n* **Problems:** Two Sum, Valid Anagram, Product of Array Except Self, Best Time to Buy and Sell Stock, Longest Substring Without Repeating Characters.\n* **Core Patterns:** Hashing for $O(1)$ lookups, Two Pointers for converging ranges, and Sliding Windows for continuous subarray tracking.\n\n#### **2. Lists, Trees & Heap Patterns**\n* **Problems:** Reverse Linked List, Merge Two Sorted Lists, Invert Binary Tree, Binary Tree Level Order Traversal, Implement Trie, Merge K Sorted Lists.\n* **Core Patterns:** Pointer manipulation (slow/fast pointers for cycle detection), recursive Depth-First Search (DFS) or Iterative Breadth-First Search (BFS) for trees, and Min/Max Heaps for dynamic sorting.\n\n#### **3. Advanced Graph & Backtracking Patterns**\n* **Problems:** Number of Islands, Clone Graph, Course Schedule, Subsets, Combination Sum, Word Search.\n* **Core Patterns:** DFS/BFS on grids or adjacency lists, cycle detection algorithms (topological sort), and backtracking with pruning to explore combinations.\n\n#### **4. Dynamic Programming (DP) Patterns**\n* **Problems:** Climbing Stairs, Coin Change, Longest Increasing Subsequence, Longest Common Subsequence, Word Break, House Robber.\n* **Core Patterns:** Overlapping subproblems. Decide between **Memoization (Top-down)** using recursion + hashmap, or **Tabulation (Bottom-up)** using an iterative 1D/2D DP array.\n\n---\n\n### **Strategic Big Tech Preparation Checklist**\n1. **Learn the Core Patterns First:** Never write code before identifying the underlying pattern.\n2. **Timebox Your Solutions:** Give yourself 25–30 minutes max. If stuck, review the optimal solution, understand the pattern, and rewrite it from scratch.\n3. **Explain Your Code Out Loud:** Big Tech interviewers evaluate your communication, not just your syntax. Use the **STAR method** (Situation, Task, Action, Result) to talk through your algorithmic complexity ($O(N)$ time, $O(1)$ auxiliary space) before coding.\n4. **Build a Revision Log:** Note down the core trick or 'aha!' moment for every question you solve so you can quickly review them before your onsite loop.",
    visual: {
      type: "layers",
      nodes: [
        { id: "level-1", label: "Foundations: Arrays, Two Pointers, Sliding Window", type: "cache", role: "Linear scans & hash table lookups" },
        { id: "level-2", label: "Structures: Linked Lists, Stacks, Trees, Heaps", type: "server", role: "Pointers, recursions, and priority queues" },
        { id: "level-3", label: "Advanced: Graphs, Backtracking, Dynamic Programming", type: "db", role: "DFS/BFS, State transitions & Memoization" },
        { id: "success", label: "Big Tech Offer (Google, Meta, Amazon)", type: "security", role: "Pattern mastery & elegant communication" }
      ],
      connections: [
        { from: "level-1", to: "level-2", label: "Master Linear structures", animated: true },
        { from: "level-2", to: "level-3", label: "Scale to Non-Linear graphs", animated: true },
        { from: "level-3", to: "success", label: "Onsite Loop Cleared", animated: true }
      ]
    }
  }
];

BLIND_75_PREP_ARTICLES.forEach((q) => {
  INTERVIEW_QUESTIONS.push(q);
});

// Define Batch 7: Coding Interview Blueprint Articles
const CODING_INTERVIEW_BLUEPRINT_ARTICLES: InterviewQuestion[] = [
  {
    id: "blueprint-dsa-foundations",
    category: "Coding & Algorithms",
    question: "Coding Interview Blueprint: Master Core Data Structures and Problem-Solving Patterns (Part 1)",
    answer: "**Analogy: The Master Carpenter's Toolbox**\n\nApproaching a coding interview without solid data structure foundations is like attempting to build a house using only a hammer. A master carpenter knows exactly when to use a measuring tape (**Array index**), a plumb line (**Linked List pointer**), or a level (**Stack**). \n\nThis guide outlines the absolute essential data structures and algorithms patterns necessary to clear top-tier phone screens and onsite interviews.\n\n---\n\n### **1. Array & String Patterns**\n* **Sliding Window:** Avoids nested $O(N^2)$ recalculations on continuous subarrays by dynamically shifting a window range.\n  * *Use case:* Finding the maximum average or sum of a subarray of size $k$.\n  ```javascript\n  function maxSum(arr, k) {\n      let maxSum = 0, windowSum = 0;\n      for (let i = 0; i < k; i++) windowSum += arr[i];\n      maxSum = windowSum;\n      for (let i = k; i < arr.length; i++) {\n          windowSum += arr[i] - arr[i - k];\n          maxSum = Math.max(maxSum, windowSum);\n      }\n      return maxSum;\n  }\n  ```\n* **Two Pointers:** Decreases search space dynamically in a sorted array by moving pointers from opposite ends inward.\n  * *Use case:* Determining if a sorted array contains two elements that sum to a target.\n  ```javascript\n  function twoSum(arr, target) {\n      let left = 0, right = arr.length - 1;\n      while (left < right) {\n          let sum = arr[left] + arr[right];\n          if (sum === target) return true;\n          if (sum < target) left++; else right--;\n      }\n      return false;\n  }\n  ```\n* **Greedy Techniques (Jump Game):** Make locally optimal decisions at each step to reach a global goal.\n  ```javascript\n  function canJump(nums) {\n      let maxReach = 0;\n      for (let i = 0; i < nums.length; i++) {\n          if (i > maxReach) return false;\n          maxReach = Math.max(maxReach, i + nums[i]);\n      }\n      return true;\n  }\n  ```\n\n---\n\n### **2. Linked Lists, Stacks & Queues**\n* **Fast and Slow Pointers:** Tracks elements moving at different rates ($1x$ vs $2x$) to find middle elements or detect structural cycles.\n  ```javascript\n  function hasCycle(head) {\n      let slow = head, fast = head;\n      while (fast && fast.next) {\n          slow = slow.next; fast = fast.next.next;\n          if (slow === fast) return true;\n      }\n      return false;\n  }\n  ```\n* **Parentheses Matching (Monotonic Stack):** Ideal for managing nested syntax structures using Last-In, First-Out (LIFO) tracking.\n  ```javascript\n  function isValid(s) {\n      const stack = [], map = { ')': '(', '}': '{', ']': '[' };\n      for (let ch of s) {\n          if (ch in map) { if (stack.pop() !== map[ch]) return false; }\n          else stack.push(ch);\n      }\n      return stack.length === 0;\n  }\n  ```\n* **Breadth-First Search (Queue BFS):** Explores hierarchical structures level-by-level using First-In, First-Out (FIFO) queuing.\n  ```javascript\n  function levelOrder(root) {\n      if (!root) return [];\n      let queue = [root], result = [];\n      while (queue.length) {\n          let levelSize = queue.length, level = [];\n          for (let i = 0; i < levelSize; i++) {\n              let node = queue.shift();\n              level.push(node.val);\n              if (node.left) queue.push(node.left);\n              if (node.right) queue.push(node.right);\n          }\n          result.push(level);\n      }\n      return result;\n  }\n  ```",
    visual: {
      type: "grid",
      nodes: [
        { id: "arr-window", label: "Array: Sliding Window", type: "cache", role: "Consecutive subarray scans" },
        { id: "two-ptrs", label: "Array: Two Pointers", type: "client", role: "Sorted range convergence" },
        { id: "cycle-ptr", label: "List: Fast & Slow Pointer", type: "gateway", role: "Cycle & mid-point identification" },
        { id: "stack-parentheses", label: "Stack: LIFO Matching", type: "security", role: "Validating balanced syntax" },
        { id: "queue-bfs", label: "Queue: BFS Level-Order", type: "queue", role: "Level-by-level traversing" }
      ],
      connections: [
        { from: "arr-window", to: "two-ptrs", label: "Linear Techniques" },
        { from: "cycle-ptr", to: "stack-parentheses", label: "Linked structures" },
        { from: "stack-parentheses", to: "queue-bfs", label: "LIFO vs FIFO" }
      ]
    }
  },
  {
    id: "blueprint-dp-graphs",
    category: "Coding & Algorithms",
    question: "Coding Interview Blueprint: Master Dynamic Programming and Graph Algorithms (Part 2)",
    answer: "**Analogy: The Route Planner and the Task Registry**\n\nDynamic Programming (DP) is like a ledger that records expensive calculations so you never have to solve them twice (No Redundancy). Graph algorithms are like route planning across a metropolitan transit network: you can traverse level-by-level (**BFS**), travel deep into a single line (**DFS**), order dependencies topological style (**Topological Sort**), or find the absolute shortest pathway under weights (**Dijkstra & Bellman-Ford**).\n\n---\n\n### **1. Dynamic Programming (DP)**\n* **Fibonacci top-down (Memoization) vs bottom-up (Tabulation):**\n  ```javascript\n  // Top-Down with Memoization\n  function fibMemo(n, memo = {}) {\n      if (n <= 1) return n;\n      if (memo[n]) return memo[n];\n      memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);\n      return memo[n];\n  }\n  // Bottom-Up with Tabulation\n  function fibTab(n) {\n      if (n <= 1) return n;\n      const dp = [0, 1];\n      for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];\n      return dp[n];\n  }\n  ```\n* **Classic DP Paradigms:**\n  * **Climbing Stairs ($O(N)$):** Equivalent to Fibonacci, counting total paths to the top.\n  * **House Robber ($O(N)$):** Deciding whether to rob the current house (`prev + num`) or skip it (`curr`).\n  * **Coin Change ($O(Amount \\times Coins)$):** Finding the minimum coins using dynamic state accumulation.\n  * **Longest Increasing Subsequence (LIS):** Tracking length of LIS for each preceding node.\n  * **0/1 Knapsack:** Maximizing value inside fixed weight storage constraints.\n\n---\n\n### **2. Graph Algorithms**\n* **Breadth-First Search (BFS):** Explores neighbors level-by-level. Ideal for finding the shortest path on unweighted graphs.\n* **Depth-First Search (DFS):** Explores as far as possible down a path before backtracking. Use a stack (explicit or call stack via recursion).\n* **Topological Sort:** Arranges vertices in a Directed Acyclic Graph (DAG) such that for every edge $u \\to v$, $u$ comes before $v$ (e.g., prerequisite scheduling).\n* **Union-Find (Disjoint Set):** Dynamic connectivity structure supporting path compression.\n  ```javascript\n  class UnionFind {\n      constructor(size) { this.root = Array(size).fill(0).map((_, i) => i); }\n      find(x) {\n          if (x === this.root[x]) return x;\n          return this.root[x] = this.find(this.root[x]); // Path compression\n      }\n      union(x, y) {\n          const rootX = this.find(x), rootY = this.find(y);\n          if (rootX !== rootY) this.root[rootY] = rootX;\n      }\n  }\n  ```\n* **Dijkstra's Algorithm:** Finds the shortest path in graphs with non-negative edge weights.\n* **Bellman-Ford:** Finds shortest paths and easily flags negative weight cycles.",
    visual: {
      type: "layers",
      nodes: [
        { id: "subproblems", label: "Overlapping Subproblems", type: "cache", role: "Solve sub-calculations once" },
        { id: "memo-tab", label: "Memoization (Top-Down) / Tabulation (Bottom-Up)", type: "db", role: "State Ledger Lookup" },
        { id: "graphs", label: "Graph Traversals (BFS / DFS)", type: "server", role: "Pathfinding & dependency sorting" },
        { id: "shortest-path", label: "Shortest Path (Dijkstra / Bellman-Ford)", type: "security", role: "Weighted node distance relaxation" }
      ],
      connections: [
        { from: "subproblems", to: "memo-tab", label: "Store calculated states", animated: true },
        { from: "memo-tab", to: "graphs", label: "State graph relationship" },
        { from: "graphs", to: "shortest-path", label: "Optimize traversals", animated: true }
      ]
    }
  },
  {
    id: "blueprint-system-design",
    category: "System Design Basics",
    question: "Coding Interview Blueprint: Foundations of High-Level and Low-Level System Design (Part 3)",
    answer: "**Analogy: The Town Planning Blueprint**\n\nHigh-Level Design (HLD) is like drawing the zoning laws, transport hubs, and main highways of a modern city (**Load Balancers, CDN Nodes, API Gateways, NoSQL Databases**). Low-Level Design (LLD) is like drafting the interior wiring and plumbing plans of individual buildings (**SOLID principles, Design Patterns, Class Interfaces**).\n\nBoth levels are critical to ensure that individual services are modular and maintainable, and the overall system scales smoothly to billions of daily active users.\n\n---\n\n### **1. High-Level Design (HLD) Fundamentals**\n* **Core Components:** Client $\\to$ Load Balancer $\\to$ API Server $\\to$ Caching Layer (Redis) $\\to$ Database (SQL for metadata, NoSQL for high throughput writes).\n* **Horizontal vs Vertical Scaling:** Horizontal (adding more stateless servers behind a load balancer) is infinitely scalable and cheaper compared to vertical (upgrading a single node's CPU/RAM).\n* **The NFR Toolkit:**\n  * **Sharding:** Partitioning datasets across multiple database servers (e.g., Shard A: A-M names, Shard B: N-Z names).\n  * **Replication:** Making duplicate copies of data to eliminate single points of failure (Active-Passive or Active-Active).\n  * **CDNs (Content Delivery Network):** Edge caching large media files closer to the user to lower latency.\n  * **Rate Limiting:** Guarding services from API abuse or DDoS attempts (Token Bucket or Leaky Bucket).\n  * **CAP Theorem:** Balancing Consistency, Availability, and Partition Tolerance during network splits.\n\n---\n\n### **2. Low-Level Design (LLD) & SOLID Rules**\n* **Single Responsibility (SRP):** A class should have exactly one reason to change.\n* **Open/Closed (OCP):** Open for extension, closed for modification (use polymorphism).\n* **Liskov Substitution (LSP):** Subclasses must be completely substitutable for their base classes.\n* **Interface Segregation (ISP):** Keep interfaces lean so clients aren't forced to implement unused methods.\n* **Dependency Inversion (DIP):** Depend upon abstractions, not concrete implementations.\n\n---\n\n### **3. Creational & Structural Design Patterns**\n* **Singleton:** Guarantees only one instance of a class exists across the application.\n  ```javascript\n  class Singleton {\n      constructor() {\n          if (Singleton.instance) return Singleton.instance;\n          Singleton.instance = this;\n      }\n  }\n  ```\n* **Factory:** Creates object instances without exposing the exact creation logic.\n* **Observer:** Implements subscription relationships where changes in one subject automatically notify observers (e.g., chat notifications).",
    visual: {
      type: "comparison",
      nodes: [
        { id: "hld", label: "High-Level Design (HLD)", type: "cloud", role: "Architecture of systems (Load Balancers, CDN, Sharding)" },
        { id: "lld", label: "Low-Level Design (LLD)", type: "server", role: "Code organization & SOLID modular patterns" }
      ],
      connections: [
        { from: "hld", to: "lld", label: "Decouples big blocks into clean code classes", animated: true }
      ]
    }
  },
  {
    id: "blueprint-behavioral-strategy",
    category: "Behavioral & Strategy",
    question: "Coding Interview Blueprint: Master Behavioral Interviews using the STAR Method (Part 4)",
    answer: "**Analogy: The Hollywood Storyboard**\n\nWhen a movie director pitches a screenplay, they don't just say, 'The hero was cool and everything worked out.' They outline the dramatic conflict, the stakes, the exact choices made, and the spectacular finale. \n\nSimilarly, answering behavioral questions with vague statements like 'we fixed the database and it was much faster' falls completely flat. You must storyboard your engineering achievements using the structured **STAR Method** to prove ownership, self-awareness, and technical impact.\n\n---\n\n### **The STAR Storyboarding Framework**\n* **Situation (S):** Briefly set the stage. What was the context, the team size, the system, or the deadline? Keep this under 30 seconds.\n* **Task (T):** State the explicit problem or challenge. What was the goal? What were the stakes if you failed?\n* **Action (A):** The core of your answer. What did **YOU** do? How did you research, prototype, lead, or coordinate? Use 'I' instead of 'We'. Highlight trade-offs and engineering reasoning.\n* **Result (R):** The payout. What was the outcome? Always use **concrete metrics** (e.g., 'reduced checkout errors by 95%', 'shaved latency by 40%', 'increased test coverage from 60% to 90%').\n\n---\n\n### **Core Stories to Prepare Ahead**\n1. **The Technical Challenge:** Solving a highly complex bug or implementing a scale-sensitive module.\n2. **The Team Conflict:** Navigating a technical disagreement with a peer or stakeholder constructively.\n3. **The Failure/Mistake:** A situation where something went wrong, what you did to remediate it, and how it shaped your growth.\n4. **The Leadership/Ownership:** Taking initiative beyond your core scope to improve system maintainability or onboarding guides.\n\n---\n\n### **Behavioral Interview Checklist**\n* **Be Metric-Driven:** Reframe 'it got faster' to 'our 95th percentile latency decreased by 300ms'.\n* **Show Growth:** Emphasize post-mortem learning and how you adapted your design processes going forward.\n* **Prepare Thoughtful Questions for the Interviewer:** \n  * *'What does success look like in this role in the first 90 days?'*\n  * *'What is the biggest operational headache or scaling pain-point the team currently faces?'*",
    visual: {
      type: "cycle",
      nodes: [
        { id: "situation", label: "Situation", type: "client", role: "Context & Stakes" },
        { id: "task", label: "Task", type: "queue", role: "Goal & Requirements" },
        { id: "action", label: "Action", type: "server", role: "Your direct engineering steps" },
        { id: "result", label: "Result", type: "security", role: "Concrete metrics & outcomes" }
      ],
      connections: [
        { from: "situation", to: "task", label: "1. Define scope", animated: true },
        { from: "task", to: "action", label: "2. Design & build", animated: true },
        { from: "action", to: "result", label: "3. Deliver & evaluate", animated: true },
        { from: "result", to: "situation", label: "4. Continuous loop" }
      ]
    }
  }
];

CODING_INTERVIEW_BLUEPRINT_ARTICLES.forEach((q) => {
  INTERVIEW_QUESTIONS.push(q);
});


