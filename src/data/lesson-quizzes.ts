export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const LESSON_QUIZZES: Record<string, QuizQuestion[]> = {
  "system-design-basics": [
    {
      question: "Which of the following is the key difference between vertical scaling (scaling up) and horizontal scaling (scaling out)?",
      options: [
        "Vertical scaling adds more machines, while horizontal scaling adds more CPU/RAM to a single machine.",
        "Vertical scaling adds more CPU/RAM to a single machine, while horizontal scaling adds more machine instances to a cluster.",
        "Vertical scaling is always cheaper than horizontal scaling.",
        "Vertical scaling has no upper limits, while horizontal scaling does."
      ],
      answerIndex: 1,
      explanation: "Vertical scaling means upgrading the capacity (CPU, RAM, Storage) of an existing server. Horizontal scaling means adding more independent servers to the resource pool. Horizontal scaling has virtually unlimited scale potential, whereas a single machine has hard hardware limits."
    },
    {
      question: "What is a Single Point of Failure (SPOF) in system design?",
      options: [
        "A bug that crashes the frontend application.",
        "Any single component in a system whose failure will cause the entire system to stop functioning.",
        "A user who enters bad credentials multiple times.",
        "A database backup that takes too long to complete."
      ],
      answerIndex: 1,
      explanation: "An SPOF is any component in an architecture that has no redundancy. If that single component fails, it brings down the entire system. Good design eliminates SPOFs by introducing load balancers, replicas, and failover mechanisms."
    },
    {
      question: "Why do we introduce redundancy in a distributed system?",
      options: [
        "To make the code compile faster.",
        "To ensure high availability and fault tolerance by running duplicates of critical components.",
        "To reduce the storage space required by the system.",
        "To bypass the need for automated backups."
      ],
      answerIndex: 1,
      explanation: "Redundancy means having backup/duplicate components (like multiple web servers or database read replicas) active in the system. If one node fails, another can take over instantly, preventing downtime and maintaining high availability."
    }
  ],
  "load-balancing": [
    {
      question: "What is the primary role of a Load Balancer in a scalable web architecture?",
      options: [
        "To encrypt all database traffic.",
        "To act as a reverse proxy, distributing incoming network traffic across a fleet of backend servers.",
        "To speed up CSS rendering in the browser.",
        "To compress image uploads automatically."
      ],
      answerIndex: 1,
      explanation: "A Load Balancer receives all incoming traffic and distributes it across multiple backend web or application servers using routing algorithms. This prevents any single server from becoming overloaded and provides high availability."
    },
    {
      question: "Which of the following describes a key disadvantage of the simple 'Round Robin' load balancing algorithm?",
      options: [
        "It is extremely complex to implement.",
        "It doesn't take into account the current load or capacity of the destination servers.",
        "It can only route traffic over UDP, not TCP.",
        "It requires a persistent database lookup for every request."
      ],
      answerIndex: 1,
      explanation: "Round Robin routes requests strictly in order (Server A, then B, then C, then A...). It is simple and lightweight but does not check if Server B is currently struggling with high CPU or if Server C has double the RAM of the others. 'Weighted Round Robin' or 'Least Connections' solves this."
    },
    {
      question: "What are 'Sticky Sessions' (Session Affinity) in load balancing, and why can they be problematic for horizontal scaling?",
      options: [
        "They permanently lock the user's browser, preventing logout.",
        "They route all requests from a specific user to the exact same backend server for the duration of their session, which can cause uneven load distribution and limit fault tolerance.",
        "They store session data on the load balancer itself, exhausting its disk space.",
        "They require users to re-login every time they load a new page."
      ],
      answerIndex: 1,
      explanation: "Sticky Sessions route a user back to the same server to preserve local state. However, this causes 'hot spots' where one server gets overloaded. It also breaks if that server crashes, losing the user's session. Modern cloud architectures prefer stateless servers and a shared session cache (like Redis)."
    }
  ],
  "caching": [
    {
      question: "What is the 'Cache Aside' (Lazy Loading) pattern?",
      options: [
        "The cache is loaded with all database records on startup.",
        "The application checks the cache first; if it's a hit, it returns the data. If it's a miss, it queries the database, writes the result to the cache, and then returns it.",
        "The database automatically writes data to the cache in the background.",
        "Data is only written to the cache, never to the database."
      ],
      answerIndex: 1,
      explanation: "Cache Aside is the most common caching pattern. Data is lazy-loaded into the cache only when requested. This ensures the cache only contains active data, though the first request for any key will always incur a database lookup (cache miss)."
    },
    {
      question: "What is a 'Cache Stampede' (Thundering Herd) and how can you mitigate it?",
      options: [
        "When the cache runs out of memory and crashes the host OS.",
        "When a highly popular cache key expires, and thousands of concurrent requests miss the cache at the same instant, overwhelming the database. It is mitigated using locking or background pre-warming.",
        "When too many developers clear the cache at the same time.",
        "When data is written to the cache faster than it can be read."
      ],
      answerIndex: 1,
      explanation: "A cache stampede occurs when a high-traffic key (e.g., home page feed) expires. Suddenly, thousands of threads find a cache miss and hit the database simultaneously. Mitigation strategies include using distributed locking (mutexes) so only one thread queries the database, or background worker threads that pre-warm keys before they expire."
    },
    {
      question: "What is the Cache Eviction policy 'LRU'?",
      options: [
        "Least Recently Used: Discards the items that have not been accessed for the longest time when the cache is full.",
        "Last Received Unit: Evicts the very last item written to the cache.",
        "Low Resource Utility: Evicts items that take up the most memory space.",
        "Least Random Unit: Evicts randomly selected items."
      ],
      answerIndex: 0,
      explanation: "Least Recently Used (LRU) is a standard eviction algorithm. It keeps track of when items are accessed. When the cache reaches its memory limit, it discards the item that has gone the longest without being requested, as it is the least likely to be needed soon."
    }
  ],
  "message-queues": [
    {
      question: "What is the primary benefit of introducing a Message Queue (like RabbitMQ) between two services?",
      options: [
        "It guarantees that requests are processed instantly with zero latency.",
        "It decouples the services, allowing them to communicate asynchronously and buffer spikes in traffic.",
        "It completely replaces the need for a database.",
        "It secures the communication using SSL certificates."
      ],
      answerIndex: 1,
      explanation: "Message queues allow a 'producer' to send a task and return immediately, without waiting for the 'consumer' to finish. This decouples the services, protects the consumer from spikes in traffic (rate leveling), and ensures tasks aren't lost if the consumer goes offline temporarily."
    },
    {
      question: "What does it mean for an operation to be 'Idempotent' in a distributed consumer system?",
      options: [
        "The operation can only be executed by one thread at a time.",
        "No matter how many times the same message is processed, the system ends up in the exact same state as if it were processed once.",
        "The operation is guaranteed to fail if the network drops.",
        "The operation deletes the message from the queue before processing it."
      ],
      answerIndex: 1,
      explanation: "In distributed queues, messages can occasionally be delivered more than once (At-Least-Once delivery). If a payment or order-processing consumer is idempotent, processing the same transaction ID twice will not charge the user twice or duplicate the order. This is a critical safety constraint."
    },
    {
      question: "What is a 'Dead Letter Queue' (DLQ)?",
      options: [
        "A queue where deleted messages are stored for archiving.",
        "A specialized queue where messages that repeatedly fail processing (e.g. due to bad formats, bugs, or exceptions) are routed for isolation and manual debugging.",
        "A queue that automatically shuts down if the server runs out of memory.",
        "A queue used exclusively for email notification services."
      ],
      answerIndex: 1,
      explanation: "A Dead Letter Queue holds messages that cannot be processed successfully by workers. Instead of letting a corrupted message block the queue forever (poison pill) or retrying it endlessly, the broker moves it to the DLQ. Engineers can then inspect the DLQ, fix the root bug, and safely re-queue the messages."
    }
  ],
  "database-sharding": [
    {
      question: "What is Database Sharding?",
      options: [
        "Encrypting table columns for security.",
        "Splitting a single large database horizontally across multiple physically distinct database servers based on a sharding key.",
        "Converting relational tables into NoSQL collections.",
        "Creating a read replica of the master database."
      ],
      answerIndex: 1,
      explanation: "Sharding is a horizontal partitioning strategy. It physically splits database rows across multiple database engines. For example, users with IDs 1-1000 go to Shard A, and 1001-2000 go to Shard B. This allows scaling writes and storage horizontally beyond the capacity of a single machine."
    },
    {
      question: "What is a major risk when choosing an uneven Sharding Key?",
      options: [
        "The database will automatically revert to a monolith.",
        "It can lead to 'Hot Shards', where a single shard receives 90% of the traffic and storage demand, while other shards remain idle.",
        "It will prevent any write transactions.",
        "It requires changing the database schema every week."
      ],
      answerIndex: 1,
      explanation: "A bad sharding key (e.g. sharding by 'country' when 95% of your users are in the US) causes 'Hot Shards'. Shard 'US' will be overwhelmed and crash, while other shards sit empty. A good sharding key distributes read/write traffic and storage size perfectly evenly across all shards."
    },
    {
      question: "Which of the following operations is the hardest to perform efficiently on a sharded database?",
      options: [
        "Inserting a new record by primary key.",
        "Performing queries that require joins, aggregation (e.g., COUNT, SUM), or sorting across multiple shards.",
        "Backing up an individual shard's data.",
        "Running a simple update statement with the sharding key."
      ],
      answerIndex: 1,
      explanation: "Because the data is spread across completely different servers, doing a standard SQL JOIN or sorting all users globally requires fetching data from all shards over the network and joining them in the application layer. This is extremely slow and complex."
    }
  ],
  "cdn-edge": [
    {
      question: "What does a CDN (Content Delivery Network) primarily cache to reduce latency?",
      options: [
        "Highly sensitive real-time database transactions.",
        "Static assets like images, videos, CSS, and client JavaScript files at edge locations closer to the user.",
        "User credentials and passwords.",
        "Internal server-side configuration files."
      ],
      answerIndex: 1,
      explanation: "CDNs are globally distributed networks of proxy servers (Edge nodes). They cache static files close to users geographically. A user in Tokyo downloading an image cached on a Tokyo CDN edge server receives it in milliseconds, avoiding the need to traverse oceans to fetch it from an origin server in New York."
    },
    {
      question: "What is the difference between a 'Push CDN' and a 'Pull CDN'?",
      options: [
        "Push CDNs only support text files, while Pull CDNs only support binary files.",
        "Push CDNs require the application to upload content directly to the CDN when updated, while Pull CDNs automatically fetch content from the origin server on the first cache miss.",
        "Push CDNs are faster, but Pull CDNs are more secure.",
        "Push CDNs bypass the DNS system completely."
      ],
      answerIndex: 1,
      explanation: "In a Push CDN, you proactively upload files to the CDN (like a deployment step). It's great for content that doesn't change often. In a Pull CDN, you point the CDN to your origin server. On a cache miss, the CDN automatically downloads the asset from your origin, caches it for future users, and returns it. Pull is much easier to manage."
    }
  ],
  "cap-theorem": [
    {
      question: "What are the three core trade-offs defined by the CAP Theorem in distributed databases?",
      options: [
        "Cache, API, Performance",
        "Consistency, Availability, Partition Tolerance",
        "Cost, Accuracy, Portability",
        "Concurrency, Authorization, Partitioning"
      ],
      answerIndex: 1,
      explanation: "CAP stands for Consistency (all nodes see the same data), Availability (every healthy node returns a non-error response), and Partition Tolerance (the system continues to operate despite network messages being dropped between nodes)."
    },
    {
      question: "According to the CAP Theorem, when a network partition (P) occurs, what choice must a distributed system make?",
      options: [
        "It must choose both Consistency and Availability (CA) and eliminate the partition.",
        "It must choose either Consistency (CP - block the request or return an error) or Availability (AP - return stale local data). Choose one.",
        "It must shut down all database servers immediately.",
        "It must switch from SQL to NoSQL."
      ],
      answerIndex: 1,
      explanation: "Network partitions (P) are an unavoidable reality of physical networking. Therefore, when a partition occurs, a system MUST choose either: CP (sacrifices availability to guarantee that no user ever reads out-of-sync or incorrect data) or AP (sacrifices consistency to ensure the system always responds, even if some nodes serve older/stale data)."
    }
  ],
  "pacelc-theorem": [
    {
      question: "How does the PACELC theorem expand upon the original CAP theorem?",
      options: [
        "It adds 'Cost' and 'Efficiency' to the distributed trade-offs.",
        "It describes the system's trade-offs under normal conditions (no partitions), specifically balancing Latency (L) vs Consistency (C).",
        "It proves that relational databases are mathematically superior to NoSQL.",
        "It replaces Partition Tolerance with Load Balancing."
      ],
      answerIndex: 1,
      explanation: "PACELC says: If there is a Partition (P), how does the system choose between Availability (A) and Consistency (C)? ELSE (E), when the network is running perfectly, how does the system choose between Latency (L) and Consistency (C)? For example, does it return data instantly (Low Latency) or wait for replicas to sync (High Consistency)?"
    }
  ],
  "microservices": [
    {
      question: "What is the 'Database-per-Service' pattern in microservices, and why is it recommended?",
      options: [
        "Every microservice must use the exact same relational database engine.",
        "Each microservice has its own private database that can only be accessed via its API, preventing tight coupling and data leaks.",
        "The database is deployed on the user's local machine.",
        "It eliminates the need for any database schema design."
      ],
      answerIndex: 1,
      explanation: "In microservices, sharing a single database across multiple services is an anti-pattern. If Service A queries Service B's tables directly, they are tightly coupled—schema changes in B will break A. Database-per-service ensures services are decoupled; they must communicate strictly via public API endpoints."
    },
    {
      question: "What is a major organizational and technical challenge when migrating from a Monolith to Microservices?",
      options: [
        "Microservices use too much compiler memory.",
        "Handling distributed data, managing network overhead, tracing errors across multiple servers, and coordinating deployments.",
        "Microservices are not supported on cloud servers.",
        "You cannot run microservices using Docker containers."
      ],
      answerIndex: 1,
      explanation: "While microservices solve organizational scaling issues (letting separate teams work independently), they introduce huge distributed systems complexity: network latency, distributed transactions (Saga pattern), eventual consistency, complex distributed tracing, and massive infrastructure overhead."
    }
  ],
  "api-gateway": [
    {
      question: "What is the primary role of an API Gateway in a microservices architecture?",
      options: [
        "To act as a single entry point for all clients, handling request routing, protocol translation, rate limiting, and authentication.",
        "To store the master database backups.",
        "To compile TypeScript code in production.",
        "To directly write SQL statements to the database."
      ],
      answerIndex: 0,
      explanation: "An API Gateway is a reverse proxy that sits in front of your microservices. It intercepts all client calls and routes them to the correct backend services. It also handles common cross-cutting concerns like JWT token validation, SSL termination, and rate limiting in a single centralized layer."
    }
  ],
  "websockets": [
    {
      question: "Which of the following scenarios is WebSockets BEST suited for?",
      options: [
        "Downloading a 5GB video file.",
        "A real-time collaborative document editor or chat application with highly frequent, low-latency bidirectional updates.",
        "Submitting a one-off contact form on a static website.",
        "Loading static images for an e-commerce feed."
      ],
      answerIndex: 1,
      explanation: "WebSockets establish a single, persistent, stateful TCP connection between client and server. This allows bidirectional real-time communication with virtually no overhead per message (unlike HTTP which requires headers, handshakes, and connections for every request). It is perfect for chat, live dashboards, and multiplayer games."
    }
  ],
  "kafka-vs-rabbitmq": [
    {
      question: "What is a core architectural difference between RabbitMQ and Apache Kafka?",
      options: [
        "RabbitMQ is written in Python, while Kafka is written in PHP.",
        "RabbitMQ is a traditional message queue that deletes messages once they are acknowledged; Kafka is a distributed, append-only log that persists events on disk, allowing replaying.",
        "RabbitMQ is much faster than Kafka in every possible scenario.",
        "Kafka can only handle text data, while RabbitMQ can handle video."
      ],
      answerIndex: 1,
      explanation: "RabbitMQ is a 'smart broker' that tracks message delivery state and deletes messages once consumers confirm receipt (ACK). Kafka is a high-throughput, sequential 'dumb broker' that keeps messages on disk for a set retention period. Consumers track their own offsets, allowing multiple consumers to replay or read history independently."
    }
  ],
  "rate-limiting": [
    {
      question: "How does the 'Token Bucket' rate-limiting algorithm work?",
      options: [
        "It deletes user accounts if they send too many requests.",
        "A bucket holds a maximum number of tokens. Each incoming request consumes a token. Tokens are refilled at a constant rate. If the bucket is empty, requests are rejected (429).",
        "It forces users to enter a CAPTCHA code for every single page reload.",
        "It uses machine learning to slow down database reads."
      ],
      answerIndex: 1,
      explanation: "The Token Bucket algorithm allows brief bursts of traffic (up to the bucket size) while strictly limiting the sustained rate of requests over time. It is highly memory efficient and widely used in systems like API gateways and Redis rate limiters."
    }
  ],
  "dns": [
    {
      question: "What is the primary function of a DNS (Domain Name System)?",
      options: [
        "To block malicious malware on user devices.",
        "To translate human-readable domain names (like google.com) into machine-readable IP addresses (like 142.250.190.46).",
        "To serve HTML files directly to the client.",
        "To encrypt database passwords over the network."
      ],
      answerIndex: 1,
      explanation: "DNS acts as the phonebook of the Internet. Computers communicate using numeric IP addresses. When you type a URL, DNS translates that domain name into the destination server's IP address so your browser knows where to send the HTTP requests."
    }
  ],
  "advanced-networking": [
    {
      question: "What is a key performance advantage of gRPC over standard REST/JSON for internal service-to-service communication?",
      options: [
        "gRPC is much easier to test using standard browser developer tools.",
        "gRPC compiles code directly into database tables.",
        "gRPC uses Protocol Buffers (a highly compressed binary format) instead of text-based JSON, and reuses TCP connections via HTTP/2 multiplexing.",
        "gRPC is completely stateless and does not require a server."
      ],
      answerIndex: 2,
      explanation: "gRPC uses Protocol Buffers, which serializes data into a compact binary stream that is 7-10x smaller and significantly faster to parse than verbose JSON text. Since it runs over HTTP/2, it supports multiplexed, bidirectional streams over a single persistent TCP connection, dramatically reducing CPU and network overhead in microservices."
    }
  ],
  "kubernetes": [
    {
      question: "What is the main benefit of containers (like Docker) compared to traditional Virtual Machines (VMs)?",
      options: [
        "Containers have no security boundaries.",
        "Containers share the host operating system's kernel instead of running an entire guest OS, making them far lighter, faster to boot, and highly dense.",
        "Containers can only run Python code.",
        "Containers completely eliminate the need for load balancers."
      ],
      answerIndex: 1,
      explanation: "Virtual Machines package an entire guest operating system, which consumes gigabytes of RAM and takes minutes to boot. Containers isolate applications but share the host OS kernel. This makes them extremely lightweight (megabytes in size), allows them to boot in milliseconds, and lets you pack far more applications on a single physical server."
    }
  ],
  "saga-pattern": [
    {
      question: "What problem does the Saga Pattern solve in a microservices architecture?",
      options: [
        "It accelerates frontend React rendering.",
        "It manages distributed transactions across multiple independent services, ensuring eventual data consistency without locking databases.",
        "It converts relational SQL data into NoSQL graphs.",
        "It secures user passwords on the gateway."
      ],
      answerIndex: 1,
      explanation: "In microservices, you cannot use a single SQL `BEGIN TRANSACTION` across separate databases. The Saga pattern manages this by executing a sequence of local transactions across services. If one service fails (e.g. out of stock), the Saga coordinator runs 'compensating transactions' (like refunds or rollbacks) in reverse order to restore data integrity."
    }
  ],
  "cqrs-pattern": [
    {
      question: "What is the CQRS (Command Query Responsibility Segregation) pattern?",
      options: [
        "It splits your code into separate directories for frontend and backend.",
        "It segregates database read operations (Queries) from write operations (Commands), allowing you to scale and optimize them completely independently.",
        "It requires using SQL for writes and NoSQL for reads.",
        "It forces all services to run synchronously."
      ],
      answerIndex: 1,
      explanation: "CQRS separates write logic (commands, which enforce business rules and update state) from read logic (queries, which fetch read-optimized views). This lets you scale reads independently (e.g., using a fast read-only replica or Elasticsearch) from the complex write path."
    }
  ],
  "real-time-chat": [
    {
      question: "In a scalable chat system like WhatsApp, why do we use a persistent caching cluster (like Redis Pub/Sub or a message broker) to route messages?",
      options: [
        "To encrypt the chat attachments.",
        "To locate which specific WebSocket server instance a target user is currently connected to, and push the message to that specific node in real time.",
        "To convert text messages into voice files.",
        "To compress the size of the messages."
      ],
      answerIndex: 1,
      explanation: "At scale, you run thousands of WebSocket servers to handle millions of active users. User A is connected to Server 1, and User B is connected to Server 100. When User A sends a message to B, Server 1 doesn't know where B is. By publishing to a shared broker (like Redis or Kafka), Server 100 (which holds B's connection) receives the message and pushes it directly to B."
    }
  ],
  "bloom-filters": [
    {
      question: "What is the core guarantee of a Bloom Filter?",
      options: [
        "It is 100% accurate for finding files on disk.",
        "It guarantees 0% false negatives (if it says a key does not exist, it definitely does not), though it may return a small rate of false positives.",
        "It compresses video files with no loss of quality.",
        "It acts as a secondary persistent backup database."
      ],
      answerIndex: 1,
      explanation: "A Bloom Filter is a highly memory-efficient probabilistic data structure. It checks if an item is a member of a set. It is guaranteed to never have false negatives: if it says a key does not exist, it is mathematically impossible for it to exist. It can have false positives, which you handle by falling back to a database lookup."
    }
  ],
  "distributed-locks": [
    {
      question: "Why is an expiration time (TTL) absolutely critical when establishing a distributed lock?",
      options: [
        "To speed up the network packets.",
        "To prevent deadlock if the worker crashes or loses connection while holding the lock.",
        "To encrypt the key payload.",
        "To format the JSON correctly."
      ],
      answerIndex: 1,
      explanation: "If a microservice pod acquires a lock on a shared resource (like an seat booking) and then crashes before completing, the lock would be held forever (deadlock). A Time-To-Live (TTL) ensures that the locking server (like Redis or ZooKeeper) will automatically release the lock after a safe timeout window."
    }
  ],
  "gossip-protocol": [
    {
      question: "How does a Gossip Protocol disseminate state or health updates across a large cluster?",
      options: [
        "By routing all updates through a single central master node.",
        "By having each node periodically select random peers and share state, spreading information exponentially like a rumor.",
        "By writing all updates to a shared SQL database.",
        "By using physical satellite clocks."
      ],
      answerIndex: 1,
      explanation: "Gossip protocol is decentralized and masterless. Nodes periodically pick 1-3 random peers and share their membership lists. If a node fails or joins, the update spreads peer-to-peer across thousands of nodes in logarithmic time, ensuring high fault tolerance and eliminating master bottlenecks."
    }
  ]
};

export const GENERAL_QUIZ_FALLBACK: QuizQuestion[] = [
  {
    question: "When designing for high availability, what is the best way to handle database reads for a read-heavy application?",
    options: [
      "Increase the size of the database server's CPU.",
      "Introduce database read replicas and load balance the read queries across them.",
      "Store all data in local server memory instead.",
      "Convert all tables to a single text file."
    ],
    answerIndex: 1,
    explanation: "Read replicas are duplicates of the main database that stay synced in the background. In a read-heavy app, routing all read queries to these replicas reduces the load on the primary (write) database, increasing availability and read speeds."
  },
  {
    question: "What does 'Eventual Consistency' mean in a distributed system?",
    options: [
      "The system will never be consistent.",
      "If no new updates are made, all replicas will eventually sync and contain the exact same data, though they may temporarily differ.",
      "The system is only consistent during leap years.",
      "Updates are guaranteed to reach all databases instantly."
    ],
    answerIndex: 1,
    explanation: "In highly scalable distributed systems, replicating data across nodes takes time. Eventual consistency means the system allows nodes to temporarily serve slightly out-of-date data to keep response times low, but guarantees they will catch up and sync as soon as possible."
  },
  {
    question: "Why do we use asynchronous background processing for heavy operations like report generation or video encoding?",
    options: [
      "To prevent blocking the main web server threads, keeping the application fast and responsive for other users.",
      "To reduce the cost of the cloud server bills.",
      "Because background threads run 10x faster than web threads.",
      "To bypass the browser's security rules."
    ],
    answerIndex: 0,
    explanation: "If a user requests a heavy report, running it in the HTTP request thread makes the user wait and blocks server resources. Offloading it to a background worker queue allows the web server to immediately return a 'Processing...' status and stay free to handle other traffic."
  }
];

export function getQuizForLesson(lessonId: string): QuizQuestion[] {
  return LESSON_QUIZZES[lessonId] || GENERAL_QUIZ_FALLBACK;
}
