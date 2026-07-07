export const ARCHITECTURE_GALLERY = [
  {
    id: 'url-shortener',
    title: 'URL Shortener (e.g., TinyURL)',
    description: 'A highly available system that generates short aliases for long URLs.',
    difficulty: 'Beginner',
    tags: ['Databases', 'Hashing', 'Caching'],
    design: {
      nodes: [
        { id: 'client', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Client', defId: 'net-client', color: 'bg-blue-500', iconName: 'Laptop' } },
        { id: 'lb', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Load Balancer', defId: 'net-load-balancer', color: 'bg-sky-500', iconName: 'Layers' } },
        { id: 'api', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'API Gateway', defId: 'net-api-gateway', color: 'bg-fuchsia-500', iconName: 'Route' } },
        { id: 'app', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Shortener Service', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Box' } },
        { id: 'cache', type: 'custom', position: { x: 750, y: 300 }, data: { label: 'Redis Cache', defId: 'db-cache', color: 'bg-rose-500', iconName: 'HardDrive' } },
        { id: 'db', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Database', defId: 'db-nosql-wide', color: 'bg-red-500', iconName: 'Database' } },
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'lb', animated: true },
        { id: 'e2', source: 'lb', target: 'api', animated: true },
        { id: 'e3', source: 'api', target: 'app', animated: true },
        { id: 'e4', source: 'app', target: 'cache', animated: true },
        { id: 'e5', source: 'app', target: 'db', animated: true },
      ]
    },
    explanations: {
       overall: 'A URL shortener is heavily read-heavy. It needs to be extremely fast for redirects (reads) while handling a moderate amount of writes (creating short URLs). The core challenge is generating unique short hashes without collisions at scale.',
       components: {
          'db': 'We use a NoSQL Wide-Column store like DynamoDB or Cassandra because the schema is simple (short_url -> long_url) and requires massive horizontal scaling and fast reads.',
          'cache': 'Redis caches the most frequently accessed short URLs to minimize database reads and provide sub-millisecond redirects.',
          'app': 'The shortener service handles hash generation (e.g., Base62 encoding) and collision resolution.'
       },
       detailed: {
          overview: "A URL shortener like TinyURL provides a short alias for a long URL. When a user visits the short alias, the system redirects them to the original URL. This is a classic System Design interview question that covers read-heavy workloads, hashing, and scaling databases.",
          functionalRequirements: [
            "Given a long URL, the system should generate a unique short alias.",
            "When a user accesses a short link, the system should redirect them to the original URL.",
            "Links should eventually expire (e.g., after 10 years).",
            "Users should optionally be able to pick custom aliases."
          ],
          nonFunctionalRequirements: [
            "Highly Available: The system must never be down (if redirect fails, service is useless).",
            "Low Latency: Redirection should happen in sub-100ms.",
            "Scalable: Support millions of new links and billions of redirects daily.",
            "Reliable: Short links should never be lost."
          ],
          capacityEstimation: {
            dau: "100 Million",
            rps: "20,000 requests/sec",
            storage: "15 TB over 5 years",
            bandwidth: "40 MB/sec",
            calculations: [
              "Read/Write Ratio: 100:1 (Heavy Read)",
              "New URLs per month: 100M * 0.01 = 1M",
              "Storage per URL: ~500 bytes",
              "5-year storage estimate for 30 billion links: 30B * 500 bytes ≈ 15 TB"
            ]
          },
          architectureWalkthrough: [
            "1. User sends a POST request with a Long URL.",
            "2. Load Balancer forwards request to an available API Gateway.",
            "3. Shortener Service generates a hash (e.g., Base62) of the URL.",
            "4. Service checks if hash exists in DB (collision resolution).",
            "5. Service stores the mapping in DB and caches it in Redis.",
            "6. For redirects: User visits short URL -> Service checks Redis -> If miss, checks DB -> 302 Redirect to Long URL."
          ],
          dataFlow: [
            "Creation: User (POST) -> LB -> App -> DB -> 201 Created",
            "Redirection: User (GET) -> LB -> App -> Redis (Hit) -> 302 Redirect"
          ],
          designDecisions: [
            { question: "Why NoSQL (Cassandra/DynamoDB)?", answer: "The data is flat (ShortURL, LongURL, UserID, CreatedAt). We don't need complex JOINs. NoSQL scales horizontally much better for simple Key-Value lookups at this scale." },
            { question: "Why 302 Redirect vs 301?", answer: "301 is permanent (cached by browser). 302 is temporary. Use 302 if you want to track analytics for every single click and maintain control over redirection." }
          ],
          scalingStrategy: [
            "Read Replicas: Use many read-only DB replicas to handle the 100x read load.",
            "Caching: Cache the 'Top 20%' of URLs to handle 80% of traffic (Pareto Principle).",
            "Database Sharding: Shard by the hash of the short URL to distribute write load."
          ],
          failureScenarios: [
            { scenario: "Redis node fails", recovery: "Traffic falls back to DB. DB load spikes. Need to over-provision DB or use a Redis cluster for high availability." },
            { scenario: "Hash collision", recovery: "Append a random string to long URL and re-hash, or use a Key Generation Service (KGS) to pre-allocate unique keys." }
          ],
          security: [
            "Rate Limiting: Prevent automated bots from exhausting the URL hash space.",
            "HTTPS Enforced: Ensure all redirects and API calls are encrypted."
          ],
          realWorldUsage: "Bit.ly, TinyURL, and Twitter's t.co all use variants of this architecture to handle billions of redirects.",
          interviewPerspective: {
            howToExplain: "Start with clarifying requirements. Estimate scale (Read vs Write). Design a simple version, then identify bottlenecks (DB speed) and add Redis/Load Balancers.",
            followUps: ["How do you handle link expiration?", "How would you design a Key Generation Service?", "How do you handle custom aliases?"],
            commonMistakes: ["Focusing on the hashing algorithm for too long.", "Ignoring database scaling.", "Not mentioning caching."]
          },
          keyTakeaways: [
            "Heavy read workloads require aggressive caching.",
            "Horizontal scaling is easier with NoSQL for simple K-V data.",
            "Key Generation Services can eliminate collision checks."
          ],
          interactiveLinks: [
            { label: "High Availability vs High Consistency", type: "LESSON", targetId: "ha-vs-hc" },
            { label: "Distributed Rate Limiter", type: "ARCHITECTURE", targetId: "rate-limiter" },
            { label: "Caching Strategies", type: "LESSON", targetId: "caching-101" },
            { label: "API Gateway Component", type: "COMPONENT", targetId: "net-api-gateway" }
          ]
       }
    }
  },
  {
    id: 'chat-app',
    title: 'Chat Application (e.g., WhatsApp)',
    description: 'A real-time messaging system with low latency and delivery guarantees.',
    difficulty: 'Advanced',
    tags: ['WebSockets', 'Queueing', 'Databases'],
    design: {
      nodes: [
        { id: 'client1', type: 'custom', position: { x: 0, y: 50 }, data: { label: 'User A', defId: 'net-client', color: 'bg-blue-500', iconName: 'Smartphone' } },
        { id: 'client2', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'User B', defId: 'net-client', color: 'bg-blue-500', iconName: 'Smartphone' } },
        { id: 'lb', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Load Balancer', defId: 'net-load-balancer', color: 'bg-sky-500', iconName: 'Layers' } },
        { id: 'ws1', type: 'custom', position: { x: 500, y: 50 }, data: { label: 'Chat Server 1 (WS)', defId: 'comp-server', color: 'bg-emerald-500', iconName: 'Server' } },
        { id: 'ws2', type: 'custom', position: { x: 500, y: 250 }, data: { label: 'Chat Server 2 (WS)', defId: 'comp-server', color: 'bg-emerald-500', iconName: 'Server' } },
        { id: 'redis', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Redis Pub/Sub', defId: 'db-cache', color: 'bg-rose-500', iconName: 'Activity' } },
        { id: 'queue', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'Message Queue', defId: 'msg-queue', color: 'bg-yellow-500', iconName: 'MessageSquare' } },
        { id: 'db', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Cassandra DB', defId: 'db-nosql-wide', color: 'bg-red-500', iconName: 'Database' } },
      ],
      edges: [
        { id: 'e1', source: 'client1', target: 'lb', animated: true },
        { id: 'e2', source: 'client2', target: 'lb', animated: true },
        { id: 'e3', source: 'lb', target: 'ws1', animated: true },
        { id: 'e4', source: 'lb', target: 'ws2', animated: true },
        { id: 'e5', source: 'ws1', target: 'redis', animated: true, style: { strokeDasharray: '5 5' } },
        { id: 'e6', source: 'ws2', target: 'redis', animated: true, style: { strokeDasharray: '5 5' } },
        { id: 'e7', source: 'ws1', target: 'queue', animated: true },
        { id: 'e8', source: 'ws2', target: 'queue', animated: true },
        { id: 'e9', source: 'queue', target: 'db', animated: true },
      ]
    },
    explanations: {
       overall: 'A chat application requires persistent stateful connections (WebSockets) for real-time delivery, and robust message routing when users are connected to different chat servers.',
       components: {
          'ws1': 'Chat servers hold thousands of concurrent WebSocket connections. When User A sends a message to User B, if User B is on a different server, the message must be routed.',
          'redis': 'Redis Pub/Sub is used to route messages between different Chat Servers. Chat servers subscribe to channels for users they are currently hosting.',
          'queue': 'A message queue asynchronously handles persisting chat history to the database, so the WebSocket servers aren\'t blocked by slow database writes.',
          'db': 'Cassandra is often used for chat history because it handles massive write volume efficiently.'
       },
       detailed: {
          overview: "Modern chat applications like WhatsApp or Slack handle billions of messages daily. The core architecture centers on maintaining long-lived connections (WebSockets) and providing a reliable, searchable message history. This design focuses on a 'Message Gateway' approach using WebSockets and a scalable NoSQL backend.",
          functionalRequirements: [
            "One-to-one and group messaging.",
            "Real-time message delivery (Low latency).",
            "Message delivery status (Sent, Delivered, Read).",
            "Persistent message history and search.",
            "Online/Offline status (Presence)."
          ],
          nonFunctionalRequirements: [
            "High Availability: Users expect chat to be always available.",
            "Low Latency: Message delivery should feel instantaneous.",
            "Scalability: Support millions of concurrent WebSocket connections.",
            "Reliability: Messages must never be lost, even if a server crashes."
          ],
          capacityEstimation: {
            dau: "500 Million",
            rps: "1 Million messages/sec (Peak)",
            storage: "1 PB over 5 years",
            bandwidth: "10 GB/sec",
            calculations: [
              "Messages per user/day: 40",
              "Total messages per day: 500M * 40 = 20 Billion",
              "Storage per message: ~100 bytes (metadata + text)",
              "Daily storage: 20B * 100 bytes = 2 TB",
              "5-year storage: 2 TB * 365 * 5 ≈ 3.6 PB (with replication)"
            ]
          },
          architectureWalkthrough: [
            "1. User A connects to a Chat Server via a Load Balancer (Upgrade to WebSocket).",
            "2. User A sends a message. The Chat Server receives it over the socket.",
            "3. Server saves the message to Cassandra for persistence via a Queue.",
            "4. Server publishes the message to Redis Pub/Sub.",
            "5. Chat Server 2 (connected to User B) is subscribed to User B's channel in Redis.",
            "6. Chat Server 2 receives the event from Redis and pushes it to User B over their WebSocket."
          ],
          dataFlow: [
            "Online: User A -> WS Server -> Redis Pub/Sub -> WS Server -> User B",
            "Offline: User A -> WS Server -> Message Queue -> Push Notification Service -> User B"
          ],
          designDecisions: [
            { question: "Why WebSockets?", answer: "HTTP is request-response. WebSockets allow the server to 'push' messages to the client instantly without the client polling, reducing latency and overhead." },
            { question: "Why Cassandra for Messages?", answer: "Cassandra is optimized for high write loads and efficient retrieval of messages by (chat_id, timestamp). It scales horizontally with zero downtime." },
            { question: "Why Redis Pub/Sub?", answer: "It provides a very low-latency way to broadcast messages across a cluster of chat servers. Servers subscribe to the 'Presence' or 'ID' of connected users." }
          ],
          scalingStrategy: [
            "Connection Management: Use a Load Balancer that supports sticky sessions for the initial handshake.",
            "Partitioning: Partition Cassandra data by `conversation_id` so all messages for one chat are physically together.",
            "Presence Service: Use a distributed cache like Redis to store the 'Last Seen' status of millions of users."
          ],
          failureScenarios: [
            { scenario: "WebSocket server crashes", recovery: "Clients automatically reconnect to a different server. The system must update the Presence map to point to the new server." },
            { scenario: "Redis Pub/Sub loss", recovery: "Redis Pub/Sub is fire-and-forget. If a server is down, the message is still in the DB. Clients can resync missing messages on reconnect." }
          ],
          security: [
            "End-to-End Encryption (E2EE): Messages are encrypted on the client and decrypted on the receiver client.",
            "Authentication: Secure WebSocket handshakes using JWT or similar tokens with short expiry."
          ],
          realWorldUsage: "WhatsApp uses Erlang to handle millions of connections per node. Discord uses a similar gateway pattern with Elixir and Rust.",
          interviewPerspective: {
            howToExplain: "Focus on real-time delivery and routing. Explain how messages reach users on different servers. Mention 'Presence' and 'Push Notifications' for offline users.",
            followUps: ["How do you handle group chats with 10k members?", "How do you implement read receipts?", "How do you handle large file transfers?"],
            commonMistakes: ["Using polling instead of WebSockets.", "Ignoring the problem of routing messages between multiple servers.", "Not handling the offline state."]
          },
          keyTakeaways: [
            "WebSockets are essential for real-time responsiveness.",
            "Routing messages across servers is the biggest scaling challenge.",
            "NoSQL is preferred for the massive volume of chat history."
          ]
       }
    }
  },
  {
    id: 'netflix-pipeline',
    title: 'Netflix Video Pipeline (Event-Driven)',
    description: 'A massively scalable event-driven architecture for video transcoding and delivery.',
    difficulty: 'Expert',
    tags: ['Kafka', 'Microservices', 'S3', 'CDN'],
    design: {
      nodes: [
        { id: 'upload', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Content Upload', defId: 'net-client', color: 'bg-blue-500', iconName: 'CloudRain' } },
        { id: 's3-raw', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Raw Storage (S3)', defId: 'store-object', color: 'bg-cyan-500', iconName: 'Cloud' } },
        { id: 'kafka', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Event Bus (Kafka)', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'transcoder', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Transcoder Svc', defId: 'comp-worker', color: 'bg-emerald-500', iconName: 'Cpu' } },
        { id: 'metadata', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'Metadata Svc', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Box' } },
        { id: 's3-encoded', type: 'custom', position: { x: 1000, y: 50 }, data: { label: 'Encoded Storage', defId: 'store-object', color: 'bg-cyan-600', iconName: 'Cloud' } },
        { id: 'cdn', type: 'custom', position: { x: 1250, y: 150 }, data: { label: 'CDN (Open Connect)', defId: 'net-cdn', color: 'bg-indigo-500', iconName: 'Network' } },
      ],
      edges: [
        { id: 'e1', source: 'upload', target: 's3-raw', animated: true },
        { id: 'e2', source: 's3-raw', target: 'kafka', animated: true, label: 'Upload Complete' },
        { id: 'e3', source: 'kafka', target: 'transcoder', animated: true, label: 'Trigger Encoding' },
        { id: 'e4', source: 'kafka', target: 'metadata', animated: true, label: 'Update Catalog' },
        { id: 'e5', source: 'transcoder', target: 's3-encoded', animated: true },
        { id: 'e6', source: 's3-encoded', target: 'cdn', animated: true },
      ]
    },
    explanations: {
       overall: 'Netflix uses a microservices-based, event-driven architecture to process petabytes of video. When a file is uploaded, an event is fired that triggers multiple parallel workflows like transcoding into different bitrates and updating search indices.',
       components: {
          'kafka': 'Acts as the central nervous system. It ensures that transcoding and metadata updates happen reliably and asynchronously.',
          'cdn': 'Netflix uses "Open Connect", their own custom CDN appliances placed inside ISPs globally to minimize latency and bandwidth costs.',
          'transcoder': 'Massively parallel compute workers that turn one raw file into hundreds of different versions for every device type.'
       },
       detailed: {
          overview: "Netflix's content ingestion pipeline is a massive event-driven system. When a production studio uploads a high-quality movie file, it must be transformed into thousands of variants (bitrates, resolutions, codecs) for every possible device and network condition. This architecture uses Kafka to orchestrate these long-running tasks reliably.",
          functionalRequirements: [
            "Support uploading of multi-terabyte raw video files.",
            "Transcode video into different formats (AVC, HEVC, VP9).",
            "Generate subtitles and audio tracks for multiple languages.",
            "Distribute processed content to global CDN nodes.",
            "Update the content catalog for search and discovery."
          ],
          nonFunctionalRequirements: [
            "Scalability: Handle thousands of uploads and massive processing peaks.",
            "Reliability: The pipeline must be fault-tolerant (long-running jobs shouldn't restart from zero).",
            "Efficiency: Optimize for storage and bandwidth costs.",
            "Observability: Track every stage of the pipeline for thousands of concurrent jobs."
          ],
          capacityEstimation: {
            dau: "200 Million+",
            rps: "Varies (Batch heavy)",
            storage: "Exabytes of raw and processed content",
            bandwidth: "Tbps of outbound traffic",
            calculations: [
              "Netflix accounts for ~15% of global internet traffic.",
              "A single movie can result in 1,000+ file variants.",
              "Storage is optimized using layered S3 buckets (Standard, IA, Glacier)."
            ]
          },
          architectureWalkthrough: [
            "1. Studio uploads raw content to the 'Inflow' S3 bucket.",
            "2. S3 triggers an event that is sent to the central Kafka cluster.",
            "3. Multiple consumer services (Microservices) react to the 'Upload Complete' event.",
            "4. Transcoder Workers pull the raw file and begin massive parallel encoding jobs.",
            "5. Metadata Service updates the internal database with movie details and asset paths.",
            "6. Once all variants are ready, they are pushed to the Open Connect CDN nodes."
          ],
          dataFlow: [
            "Ingest: Studio -> S3 -> Kafka",
            "Process: Kafka -> Transcoder -> S3-Encoded",
            "Distribute: S3-Encoded -> CDN -> End User"
          ],
          designDecisions: [
            { question: "Why Kafka?", answer: "Kafka handles high-throughput events and provides durable ordering. It allows different teams (Encoding, Personalization, Search) to build services that react to the same events independently." },
            { question: "Why Custom CDN (Open Connect)?", answer: "Standard CDNs are expensive at Netflix's scale. By placing their own hardware inside ISP networks, Netflix reduces bandwidth costs and improves streaming quality for users." }
          ],
          scalingStrategy: [
            "Worker Auto-scaling: Use Kubernetes to scale transcoder workers based on the length of the Kafka backlog.",
            "Tiered Storage: Store raw source files in cheaper storage after processing.",
            "Regional Isolation: Run independent pipeline clusters in different AWS regions for global availability."
          ],
          failureScenarios: [
            { scenario: "Transcoder worker dies mid-job", recovery: "Kafka tracks offsets. A new worker takes over the partition. The encoding engine (e.g., Archer) supports checkpointing to resume progress." },
            { scenario: "Kafka cluster goes down", recovery: "Highly unlikely with multi-AZ replication. If it happens, S3 events are buffered or the ingestion process is paused." }
          ],
          security: [
            "DRM: Widevine, FairPlay, and PlayReady encryption applied during transcoding.",
            "Access Control: IAM roles and signed URLs for S3 access."
          ],
          realWorldUsage: "Netflix's 'Cosmos' platform is the real-world implementation of this pattern, managing microservices that handle media processing.",
          interviewPerspective: {
            howToExplain: "Highlight the scale and the decoupling. Explain how Kafka allows parallel processing of a single upload. Mention the complexity of managing thousands of encoding variants.",
            followUps: ["How do you handle a 'hot' movie release?", "How do you optimize for storage across exabytes?", "How does the CDN know which file to serve?"],
            commonMistakes: ["Focusing too much on the web app and not the pipeline.", "Ignoring the scale of the data.", "Suggesting a simple synchronous API for transcoding."]
          },
          keyTakeaways: [
            "Event-driven architectures are perfect for long-running pipelines.",
            "Kafka enables massive decoupling across many engineering teams.",
            "CDN placement is critical for performance at global scale."
          ]
       }
    }
  },
  {
    id: 'uber-matching',
    title: 'Uber/Lyft Ride Matching',
    description: 'Real-time geospatial system for matching riders with the nearest available drivers.',
    difficulty: 'Expert',
    tags: ['Geospatial', 'Redis', 'Kafka', 'WebSockets'],
    design: {
      nodes: [
        { id: 'rider', type: 'custom', position: { x: 0, y: 50 }, data: { label: 'Rider App', defId: 'net-client', color: 'bg-blue-500', iconName: 'Smartphone' } },
        { id: 'driver', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Driver App', defId: 'net-client', color: 'bg-emerald-500', iconName: 'Smartphone' } },
        { id: 'ws', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'WebSocket Server', defId: 'comp-server', color: 'bg-indigo-500', iconName: 'Activity' } },
        { id: 'geospatial', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Geo Service (H3/S2)', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Globe' } },
        { id: 'geoidx', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Redis (Geo Index)', defId: 'db-cache', color: 'bg-rose-500', iconName: 'HardDrive' } },
        { id: 'kafka', type: 'custom', position: { x: 750, y: 300 }, data: { label: 'Supply/Demand Stream', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
      ],
      edges: [
        { id: 'e1', source: 'rider', target: 'ws', animated: true, label: 'Request Ride' },
        { id: 'e2', source: 'driver', target: 'ws', animated: true, label: 'Update Location' },
        { id: 'e3', source: 'ws', target: 'geospatial', animated: true },
        { id: 'e4', source: 'geospatial', target: 'geoidx', animated: true, label: 'Query/Update' },
        { id: 'e5', source: 'geospatial', target: 'kafka', animated: true, label: 'Log Events' },
      ]
    },
    explanations: {
       overall: 'Ride sharing apps rely on "Quadtrees", "Google S2", or "Uber H3" to partition the globe into small cells for efficient spatial querying. Driver locations are updated every few seconds via WebSockets.',
       components: {
          'geoidx': 'Redis is used for fast geospatial indexing (GEOADD/GEORADIUS) to find the nearest drivers in milliseconds.',
          'geospatial': 'The matching service calculates the best driver-rider pair based on ETAs, ride types, and pricing.',
          'kafka': 'Streams location data to analytics engines for dynamic surge pricing calculations.'
       },
       detailed: {
          overview: "Matching millions of riders with nearby drivers in real-time is a high-concurrency geospatial problem. Uber and Lyft use hexagonal (H3) or hierarchical (S2) indexing to divide the world into cells. This architecture focuses on low-latency driver location updates and efficient neighbor searches to minimize rider wait times.",
          functionalRequirements: [
            "Riders should be able to request a ride from their current location.",
            "Drivers should update their GPS location every 3-5 seconds.",
            "The system should find the 'best' (usually nearest) available driver.",
            "Notify the driver and rider once a match is made.",
            "Support surge pricing based on real-time supply and demand."
          ],
          nonFunctionalRequirements: [
            "High Availability: Ride matching is mission-critical.",
            "Scalability: Support millions of concurrent riders and drivers.",
            "Low Latency: Matching should happen within 1-2 seconds.",
            "Accuracy: Geospatial queries must be precise to avoid 'ghost' drivers."
          ],
          capacityEstimation: {
            dau: "50 Million",
            rps: "500,000 location updates/sec",
            storage: "TB level for historical trip data",
            bandwidth: "High (Persistent WebSocket traffic)",
            calculations: [
              "1M active drivers * update every 4s = 250k updates/sec.",
              "Matching queries: 50k requests/sec at peak.",
              "Redis memory for 1M drivers: 1M * 100 bytes = 100MB (Very small, fits in RAM)."
            ]
          },
          architectureWalkthrough: [
            "1. Driver app opens a persistent WebSocket connection to the WS Server.",
            "2. Every 4 seconds, the Driver app sends its Lat/Long coordinates.",
            "3. WS Server passes coordinates to the Geo Service.",
            "4. Geo Service converts Lat/Long to an H3/S2 cell ID.",
            "5. Geo Service updates the Redis Geo Index with the driver's current cell.",
            "6. Rider requests a ride -> Geo Service queries Redis for available drivers in nearby cells."
          ],
          dataFlow: [
            "Supply: Driver -> WS -> Geo Service -> Redis (GEOADD)",
            "Demand: Rider -> WS -> Geo Service -> Redis (GEORADIUS) -> Match Found"
          ],
          designDecisions: [
            { question: "Why Redis for Geo Index?", answer: "Redis has built-in geospatial commands (GEOADD, GEORADIUS) that are extremely fast and memory-efficient for real-time location tracking." },
            { question: "Why WebSockets for Drivers?", answer: "HTTP overhead is too high for updates every 4 seconds. WebSockets provide a low-latency, low-overhead way to stream GPS data." },
            { question: "Why H3/S2 Hexagons/Cells?", answer: "Searching by precise Lat/Long is slow. By mapping coordinates to discrete cell IDs, you can find neighbors using simple string or integer lookups." }
          ],
          scalingStrategy: [
            "Sharding by Region: Shard the Geo Index and matching logic by city or region (e.g., 'San Francisco', 'New York').",
            "WebSocket Load Balancing: Use a distributed gateway to handle millions of connections.",
            "Surge Pricing Engine: Decouple the matching logic from the pricing engine using Kafka to process supply/demand streams asynchronously."
          ],
          failureScenarios: [
            { scenario: "Redis Geo Index node fails", recovery: "Use Redis Sentinel or Cluster for high availability. If data is lost, it is rebuilt within seconds as drivers send their next location update." },
            { scenario: "Matching takes too long", recovery: "Expand the search radius incrementally or fallback to a simpler matching algorithm (e.g., first available instead of strictly nearest)." }
          ],
          security: [
            "Driver Privacy: Obfuscate driver locations in the app until a match is confirmed.",
            "Fraud Detection: Detect spoofed GPS locations using historical velocity checks."
          ],
          realWorldUsage: "Uber created the H3 hexagonal grid system. Google uses S2 cells for Maps and Niantic uses it for Pokémon GO.",
          interviewPerspective: {
            howToExplain: "Start with the 'driver location update' flow. Explain why a standard database isn't enough (write load). Introduce Redis and Geospatial indexing. Discuss how you scale it for millions of users.",
            followUps: ["How do you handle 'surge' pricing?", "How do you match for pooled rides?", "How do you handle drivers at city borders?"],
            commonMistakes: ["Using a relational DB for location updates.", "Not mentioning sharding by city.", "Ignoring the frequency of GPS updates."]
          },
          keyTakeaways: [
            "Geospatial indexing (H3/S2) is the heart of ride matching.",
            "Redis is the standard for high-frequency location tracking.",
            "Decouple stateful connections (WebSockets) from stateless logic (Matching)."
          ]
       }
    }
  },
  {
    id: 'rate-limiter',
    title: 'Distributed Rate Limiter',
    description: 'Protect your APIs from being overwhelmed by too many requests.',
    difficulty: 'Intermediate',
    tags: ['Redis', 'Algorithms', 'Security'],
    design: {
      nodes: [
        { id: 'client', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Client', defId: 'net-client', color: 'bg-blue-500', iconName: 'Laptop' } },
        { id: 'gw', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Gateway', defId: 'net-api-gateway', color: 'bg-fuchsia-500', iconName: 'Route' } },
        { id: 'limiter', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Rate Limiter Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Shield' } },
        { id: 'redis', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Redis (Token Bucket)', defId: 'db-cache', color: 'bg-rose-500', iconName: 'HardDrive' } },
        { id: 'app', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'App Service', defId: 'comp-server', color: 'bg-teal-500', iconName: 'Box' } },
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'gw', animated: true },
        { id: 'e2', source: 'gw', target: 'limiter', animated: true },
        { id: 'e3', source: 'limiter', target: 'redis', animated: true, label: 'Check/Decr Tokens' },
        { id: 'e4', source: 'limiter', target: 'app', animated: true, label: 'Allow Request' },
      ]
    },
    explanations: {
       overall: 'A distributed rate limiter uses a shared data store (like Redis) to track request counts across multiple application nodes.',
       components: {
          'redis': 'Stores counters for each user or API key. Algorithms like "Token Bucket" or "Leaky Bucket" are implemented here using Atomic operations (INCR/EXPIRE) or Lua scripts.',
          'limiter': 'The service that decides whether to allow a request or return a 429 Too Many Requests response.'
       },
       detailed: {
          overview: "A distributed rate limiter prevents APIs from being overwhelmed by too many requests from a single user or IP. Unlike a local rate limiter, a distributed one ensures that limits are enforced consistently across a cluster of thousands of servers. This design uses the 'Token Bucket' algorithm backed by Redis.",
          functionalRequirements: [
            "Limit requests based on IP, UserID, or API Key.",
            "Support different limits for different API endpoints.",
            "Return HTTP 429 'Too Many Requests' when limit is exceeded.",
            "Return remaining quota in response headers (X-RateLimit-Remaining)."
          ],
          nonFunctionalRequirements: [
            "Low Latency: The check must be extremely fast (<5ms) as it's in the critical path of every request.",
            "Scalability: Handle millions of requests per second.",
            "High Availability: If the rate limiter is down, it should ideally 'fail open' (allow requests) to avoid breaking the service.",
            "Distributed: Work accurately across multiple data centers."
          ],
          capacityEstimation: {
            dau: "10 Million users",
            rps: "100,000 requests/sec",
            storage: "Memory for millions of keys",
            bandwidth: "Negligible",
            calculations: [
              "Key size: 32 bytes (UserID) + 4 bytes (Counter) = ~40 bytes.",
              "1M active users * 40 bytes = 40MB of Redis RAM.",
              "Even with 10M users, it fits easily in a small Redis instance."
            ]
          },
          architectureWalkthrough: [
            "1. Client sends an HTTP request to the API Gateway.",
            "2. Gateway calls the Rate Limiter Service before forwarding to the App.",
            "3. Limiter Service checks the UserID in Redis.",
            "4. If tokens exist: Decrement token count in Redis and return 'Allow'.",
            "5. If no tokens: Return 'Block' (429).",
            "6. Redis automatically refills tokens based on the configured rate (using TTL or separate job)."
          ],
          dataFlow: [
            "Allow: Client -> Gateway -> Limiter (Redis: -1) -> Gateway -> App -> 200 OK",
            "Block: Client -> Gateway -> Limiter (Redis: 0) -> Gateway -> 429 Too Many Requests"
          ],
          designDecisions: [
            { question: "Why Redis?", answer: "Redis is an in-memory store with atomic operations (INCR, DECR). It provides the sub-millisecond latency required for a check that happens on every single request." },
            { question: "Token Bucket vs Fixed Window?", answer: "Fixed Window has a 'spike' problem at the edge of time boundaries. Token Bucket allows for short bursts while maintaining a steady average rate." },
            { question: "Why 'Fail Open'?", answer: "It is better to occasionally allow an over-limit request than to block all legitimate traffic if the rate limiter itself is having issues." }
          ],
          scalingStrategy: [
            "Client-side Rate Limiting: Implement basic limits in the client app to reduce server load.",
            "Hierarchical Rate Limiting: Apply broad limits at the Edge (CDN) and granular limits at the Service level.",
            "Redis Sharding: Shard Redis by UserID to distribute the load of checking millions of counters."
          ],
          failureScenarios: [
            { scenario: "Redis is slow/down", recovery: "The Gateway should have a timeout (e.g., 5ms). If it times out, allow the request and log the event for monitoring." },
            { scenario: "Race condition in Redis", recovery: "Use Lua scripts in Redis to ensure that the 'Check then Decrement' operation is atomic." }
          ],
          security: [
            "Protection against DoS: The rate limiter is the first line of defense against volumetric attacks.",
            "Internal Limits: Apply different limits for internal vs external API consumers."
          ],
          realWorldUsage: "Stripe, GitHub, and Twitter use distributed rate limiters to protect their public APIs and ensure fair usage among developers.",
          interviewPerspective: {
            howToExplain: "Start by explaining the need (DoS protection, cost control). Compare algorithms (Token Bucket, Leaky Bucket). Discuss the trade-off between accuracy and latency.",
            followUps: ["How do you handle race conditions?", "How do you rate limit across multiple regions?", "How do you handle dynamic limits?"],
            commonMistakes: ["Using a relational database.", "Not mentioning atomicity (race conditions).", "Ignoring the 'fail open' strategy."]
          },
          keyTakeaways: [
            "Rate limiting is essential for system stability and security.",
            "Redis is the best choice for shared, fast counters.",
            "Atomic operations or Lua scripts are required to prevent race conditions."
          ]
       }
    }
  },
  {
    id: 'trading-platform',
    title: 'Low-Latency Trading Platform',
    description: 'A high-throughput system for market data and order execution.',
    difficulty: 'Expert',
    tags: ['Kafka', 'Low-Latency', 'Event-Driven'],
    design: {
      nodes: [
        { id: 'market', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Market Data Feed', defId: 'net-client', color: 'bg-blue-500', iconName: 'Activity' } },
        { id: 'kafka', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Kafka (Data Stream)', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'matching', type: 'custom', position: { x: 500, y: 50 }, data: { label: 'Matching Engine', defId: 'comp-server', color: 'bg-red-500', iconName: 'Cpu' } },
        { id: 'order', type: 'custom', position: { x: 500, y: 250 }, data: { label: 'Order Management', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
        { id: 'db', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'Auditor (SQL)', defId: 'db-sql', color: 'bg-orange-500', iconName: 'Database' } },
      ],
      edges: [
        { id: 'e1', source: 'market', target: 'kafka', animated: true },
        { id: 'e2', source: 'kafka', target: 'matching', animated: true, label: 'Tick Data' },
        { id: 'e3', source: 'matching', target: 'kafka', animated: true, label: 'Executions' },
        { id: 'e4', source: 'order', target: 'kafka', animated: true, label: 'New Orders' },
        { id: 'e5', source: 'kafka', target: 'db', animated: true, label: 'Persist Audit Log' },
      ]
    },
    explanations: {
       overall: 'Trading platforms require microsecond-level latency. They often use "In-Memory" matching engines and asynchronous "Event Sourcing" via Kafka to ensure every transaction is recorded and reproducible.',
       components: {
          'matching': 'The core engine that matches Buy and Sell orders. Usually written in C++ or Java (with low-latency garbage collection tuning).',
          'kafka': 'Provides an append-only log of all events, allowing for "Event Replay" to recover the system state if it crashes.'
       }
    }
  },
  {
    id: 'ecommerce-checkout',
    title: 'E-Commerce Checkout (Saga Pattern)',
    description: 'Ensuring consistency across multiple services during a complex checkout process.',
    difficulty: 'Expert',
    tags: ['Saga', 'Microservices', 'Kafka', 'SQL'],
    design: {
      nodes: [
        { id: 'client', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Buyer App', defId: 'net-client', color: 'bg-blue-500', iconName: 'Smartphone' } },
        { id: 'order', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Order Orchestrator', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
        { id: 'kafka', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Saga Event Bus', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'payment', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Payment Svc', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Box' } },
        { id: 'inventory', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Inventory Svc', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Box' } },
        { id: 'shipping', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'Shipping Svc', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Box' } },
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'order', animated: true },
        { id: 'e2', source: 'order', target: 'kafka', animated: true, label: 'Order Created' },
        { id: 'e3', source: 'kafka', target: 'payment', animated: true, label: 'Charge User' },
        { id: 'e4', source: 'payment', target: 'kafka', animated: true, label: 'Payment Success' },
        { id: 'e5', source: 'kafka', target: 'inventory', animated: true, label: 'Reserve Stock' },
        { id: 'e6', source: 'inventory', target: 'kafka', animated: true, label: 'Stock Reserved' },
        { id: 'e7', source: 'kafka', target: 'shipping', animated: true, label: 'Ship Order' },
      ]
    },
    explanations: {
       overall: 'Distributed transactions are hard. The Saga pattern uses a sequence of local transactions. Each service performs its transaction and publishes an event to trigger the next. If one fails, compensating transactions are triggered to undo previous steps.',
       components: {
          'order': 'The central coordinator (Orchestrator) that manages the state machine of the entire checkout process.',
          'kafka': 'Acts as the reliable log that ensures no events are lost during the multi-step transaction.'
       }
    }
  },
  {
    id: 'ad-click-aggregator',
    title: 'Ad-Click Aggregator (Flink/Kafka)',
    description: 'Processing millions of ad clicks per second for real-time billing and fraud detection.',
    difficulty: 'Expert',
    tags: ['Kafka', 'Flink', 'Analytics', 'NoSQL'],
    design: {
      nodes: [
        { id: 'users', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Millions of Users', defId: 'net-client', color: 'bg-blue-500', iconName: 'Laptop' } },
        { id: 'ingest', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Ingestion Service', defId: 'comp-server', color: 'bg-emerald-500', iconName: 'Server' } },
        { id: 'kafka', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Kafka (Raw Clicks)', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'flink', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Apache Flink (Stream Processing)', defId: 'comp-worker', color: 'bg-lime-500', iconName: 'Cpu' } },
        { id: 'db', type: 'custom', position: { x: 1000, y: 50 }, data: { label: 'Cassandra (Aggregates)', defId: 'db-nosql-wide', color: 'bg-red-500', iconName: 'Database' } },
        { id: 'olap', type: 'custom', position: { x: 1000, y: 250 }, data: { label: 'Druid/ClickHouse (OLAP)', defId: 'db-nosql-wide', color: 'bg-orange-600', iconName: 'Activity' } },
      ],
      edges: [
        { id: 'e1', source: 'users', target: 'ingest', animated: true },
        { id: 'e2', source: 'ingest', target: 'kafka', animated: true },
        { id: 'e3', source: 'kafka', target: 'flink', animated: true },
        { id: 'e4', source: 'flink', target: 'db', animated: true, label: 'Write Totals' },
        { id: 'e5', source: 'flink', target: 'olap', animated: true, label: 'Real-time Analytics' },
      ]
    },
    explanations: {
       overall: 'Ad-tech systems require handling high-velocity data. Systems use "Windowing" (e.g., Tumbled windows in Flink) to aggregate clicks into 1-minute buckets for billing.',
       components: {
          'flink': 'Performs stateful stream processing. It can detect fraud patterns (like same user clicking 100 times) and filter them out in real-time.',
          'olap': 'A specialized database for high-speed analytical queries, used by advertisers to see their campaign performance in real-time.'
       }
    }
  },
  {
    id: 'search-engine',
    title: 'Search Engine (e.g., Elasticsearch)',
    description: 'A system built for lightning-fast full-text search across millions of documents.',
    difficulty: 'Intermediate',
    tags: ['Indexing', 'Search', 'NoSQL'],
    design: {
      nodes: [
        { id: 'client', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'User', defId: 'net-client', color: 'bg-blue-500', iconName: 'Laptop' } },
        { id: 'api', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Search API', defId: 'comp-server', color: 'bg-emerald-500', iconName: 'Server' } },
        { id: 'idx', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Elasticsearch Cluster', defId: 'search-engine', color: 'bg-lime-600', iconName: 'Search' } },
        { id: 'kafka', type: 'custom', position: { x: 500, y: 300 }, data: { label: 'Update Stream (Kafka)', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'db', type: 'custom', position: { x: 750, y: 300 }, data: { label: 'Primary DB (SQL)', defId: 'db-sql', color: 'bg-orange-500', iconName: 'Database' } },
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'api', animated: true },
        { id: 'e2', source: 'api', target: 'idx', animated: true, label: 'Fuzzy Search' },
        { id: 'e3', source: 'db', target: 'kafka', animated: true, label: 'CDC (Change Data Capture)' },
        { id: 'e4', source: 'kafka', target: 'idx', animated: true, label: 'Update Index' },
      ]
    },
    explanations: {
       overall: 'Search engines use "Inverted Indices" to map words to documents. To keep the index fresh, we use Change Data Capture (CDC) to stream updates from the primary SQL database into Elasticsearch via Kafka.',
       components: {
          'idx': 'Elasticsearch partitions data into "Shards". Each shard is an Apache Lucene index.',
          'kafka': 'Ensures that even if Elasticsearch is temporarily down, updates from the database aren\'t lost and can be replayed.'
       }
    }
 },
 {
   id: 'payment-gateway',
   title: 'Payment Gateway (Stripe-like)',
   description: 'A highly available and secure system for processing financial transactions.',
   difficulty: 'Expert',
   tags: ['Security', 'PCI-DSS', 'Idempotency', 'SQL'],
   design: {
     nodes: [
       { id: 'merchant', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Merchant App', defId: 'net-client', color: 'bg-blue-500', iconName: 'Laptop' } },
       { id: 'gw', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'API Gateway (TLS)', defId: 'net-api-gateway', color: 'bg-indigo-600', iconName: 'Shield' } },
       { id: 'payment', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Payment Svc', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
       { id: 'ledger', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Immutable Ledger (SQL)', defId: 'db-sql', color: 'bg-orange-600', iconName: 'Database' } },
       { id: 'bank', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'External Bank API', defId: 'net-api-gateway', color: 'bg-red-500', iconName: 'Globe' } },
       { id: 'audit', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'Audit Log (S3)', defId: 'store-object', color: 'bg-zinc-700', iconName: 'FileText' } },
     ],
     edges: [
       { id: 'e1', source: 'merchant', target: 'gw', animated: true },
       { id: 'e2', source: 'gw', target: 'payment', animated: true },
       { id: 'e3', source: 'payment', target: 'ledger', animated: true, label: 'Record Intent' },
       { id: 'e4', source: 'payment', target: 'bank', animated: true, label: 'Auth/Capture' },
       { id: 'e5', source: 'payment', target: 'audit', animated: true, label: 'Compliance Log' },
     ]
   },
   explanations: {
      overall: 'Payment systems require 100% data integrity and strict security compliance. "Idempotency Keys" are used to ensure that a network retry doesn\'t charge a customer twice.',
      components: {
         'ledger': 'A relational database with ACID properties is essential. We use double-entry bookkeeping logic to track every cent.',
         'payment': 'Handles complex orchestration with external banking networks. It must be designed for partial failures.'
      }
   }
 },
 {
   id: 'log-aggregation',
   title: 'Distributed Log Aggregation (ELK Stack)',
   description: 'Collecting and indexing logs from thousands of servers in real-time.',
   difficulty: 'Intermediate',
   tags: ['Logging', 'Kafka', 'Elasticsearch'],
   design: {
     nodes: [
       { id: 'servers', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'App Servers (1000+)', defId: 'comp-server', color: 'bg-blue-500', iconName: 'Server' } },
       { id: 'agent', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Log Collector (Fluentd)', defId: 'comp-worker', color: 'bg-emerald-500', iconName: 'Box' } },
       { id: 'kafka', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Buffering (Kafka)', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
       { id: 'indexer', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Logstash/Indexer', defId: 'comp-worker', color: 'bg-teal-500', iconName: 'Cpu' } },
       { id: 'es', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Elasticsearch', defId: 'search-engine', color: 'bg-lime-600', iconName: 'Search' } },
       { id: 'kibana', type: 'custom', position: { x: 1250, y: 150 }, data: { label: 'Kibana (UI)', defId: 'net-client', color: 'bg-indigo-500', iconName: 'Laptop' } },
     ],
     edges: [
       { id: 'e1', source: 'servers', target: 'agent', animated: true },
       { id: 'e2', source: 'agent', target: 'kafka', animated: true },
       { id: 'e3', source: 'kafka', target: 'indexer', animated: true },
       { id: 'e4', source: 'indexer', target: 'es', animated: true },
       { id: 'e5', source: 'es', target: 'kibana', animated: true },
     ]
   },
   explanations: {
      overall: 'When logging at scale, writing directly to a database or search engine would overwhelm it. We use Kafka as a "Pressure Valve" or buffer to store log spikes until the indexer can catch up.',
      components: {
         'kafka': 'Provides backpressure. If Elasticsearch is slow, logs accumulate in Kafka safely for up to 7 days.',
         'es': 'Stores logs in time-series indices (e.g., logs-2023-10-27). This allows for fast searching and easy deletion of old data.'
      }
   }
   },
   {
     id: 'notification-system',
    title: 'Global Notification Platform',
    description: 'A multi-channel system for sending Push, SMS, and Emails at scale.',
    difficulty: 'Intermediate',
    tags: ['Messaging', 'Queueing', 'Third-Party'],
    design: {
      nodes: [
        { id: 'svc', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'App Service', defId: 'comp-server', color: 'bg-emerald-500', iconName: 'Server' } },
        { id: 'queue', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Priority Queue', defId: 'msg-queue', color: 'bg-yellow-500', iconName: 'MessageSquare' } },
        { id: 'worker', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Notification Worker', defId: 'comp-worker', color: 'bg-lime-500', iconName: 'Cpu' } },
        { id: 'push', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Firebase (Push)', defId: 'net-api-gateway', color: 'bg-orange-500', iconName: 'Smartphone' } },
        { id: 'sms', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Twilio (SMS)', defId: 'net-api-gateway', color: 'bg-red-500', iconName: 'MessageSquare' } },
        { id: 'email', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'SendGrid (Email)', defId: 'net-api-gateway', color: 'bg-blue-600', iconName: 'Mail' } },
      ],
      edges: [
        { id: 'e1', source: 'svc', target: 'queue', animated: true },
        { id: 'e2', source: 'queue', target: 'worker', animated: true },
        { id: 'e3', source: 'worker', target: 'push', animated: true },
        { id: 'e4', source: 'worker', target: 'sms', animated: true },
        { id: 'e5', source: 'worker', target: 'email', animated: true },
      ]
    },
    explanations: {
       overall: 'The key challenge in a notification system is dealing with external vendor latencies and outages. We use queues to decouple the sending logic from the application and implement "Retries with Exponential Backoff".',
       components: {
          'queue': 'Separates "High Priority" (OTP codes) from "Low Priority" (Marketing) notifications into different queues.',
          'worker': 'Handles the actual communication with third-party APIs. It tracks delivery status and handles failures.'
       }
    }
  },
  {
    id: 'iot-fleet-tracking',
    title: 'IoT Fleet Tracking',
    description: 'Real-time GPS tracking for thousands of vehicles with telemetry processing.',
    difficulty: 'Expert',
    tags: ['IoT', 'MQTT', 'Kafka', 'Time-Series'],
    design: {
      nodes: [
        { id: 'trucks', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Fleet (Trucks)', defId: 'net-client', color: 'bg-blue-500', iconName: 'Globe' } },
        { id: 'mqtt', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'MQTT Broker', defId: 'msg-queue', color: 'bg-indigo-600', iconName: 'Activity' } },
        { id: 'ingest', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Ingestion Service', defId: 'comp-server', color: 'bg-emerald-500', iconName: 'Cpu' } },
        { id: 'kafka', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Telemetry Stream', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'tsdb', type: 'custom', position: { x: 1000, y: 50 }, data: { label: 'TimescaleDB / Influx', defId: 'db-sql', color: 'bg-amber-600', iconName: 'Database' } },
        { id: 'alerts', type: 'custom', position: { x: 1000, y: 250 }, data: { label: 'Alerting Engine', defId: 'comp-worker', color: 'bg-red-500', iconName: 'Bell' } },
      ],
      edges: [
        { id: 'e1', source: 'trucks', target: 'mqtt', animated: true, label: 'Binary/Protobuf' },
        { id: 'e2', source: 'mqtt', target: 'ingest', animated: true },
        { id: 'e3', source: 'ingest', target: 'kafka', animated: true },
        { id: 'e4', source: 'kafka', target: 'tsdb', animated: true },
        { id: 'e5', source: 'kafka', target: 'alerts', animated: true, label: 'Check Thresholds' },
      ]
    },
    explanations: {
       overall: 'IoT systems use lightweight protocols like MQTT to minimize data usage. Telemetry data is usually time-series (Timestamp, Lat, Long, Speed, Fuel).',
       components: {
          'mqtt': 'A publish-subscribe protocol designed for low-bandwidth, high-latency networks common in moving vehicles.',
          'tsdb': 'Time-Series Databases are optimized for "Insert-Heavy" workloads and time-range queries (e.g., "Show me the path of Truck X yesterday").'
       }
    }
  },
  {
    id: 'global-chat',
    title: 'Global Scale Chat (WhatsApp-like)',
    description: 'Ensuring message delivery with low latency across different continents.',
    difficulty: 'Expert',
    tags: ['WebSockets', 'Cassandra', 'Multi-Region'],
    design: {
      nodes: [
        { id: 'u1', type: 'custom', position: { x: 0, y: 50 }, data: { label: 'User A (US)', defId: 'net-client', color: 'bg-blue-500', iconName: 'Smartphone' } },
        { id: 'u2', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'User B (EU)', defId: 'net-client', color: 'bg-emerald-500', iconName: 'Smartphone' } },
        { id: 'ws-us', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'WS Server (US)', defId: 'comp-server', color: 'bg-indigo-500', iconName: 'Activity' } },
        { id: 'ws-eu', type: 'custom', position: { x: 250, y: 250 }, data: { label: 'WS Server (EU)', defId: 'comp-server', color: 'bg-indigo-500', iconName: 'Activity' } },
        { id: 'kafka', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Global Message Bus', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'db', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Cassandra Cluster', defId: 'db-nosql-wide', color: 'bg-red-500', iconName: 'Database' } },
      ],
      edges: [
        { id: 'e1', source: 'u1', target: 'ws-us', animated: true },
        { id: 'e2', source: 'u2', target: 'ws-eu', animated: true },
        { id: 'e3', source: 'ws-us', target: 'kafka', animated: true },
        { id: 'e4', source: 'kafka', target: 'ws-eu', animated: true, label: 'Routing' },
        { id: 'e5', source: 'kafka', target: 'db', animated: true, label: 'Store History' },
      ]
    },
    explanations: {
       overall: 'WhatsApp uses "Actors" or long-lived WebSocket connections to deliver messages instantly. If a user is offline, the message is stored in a highly available database like Cassandra.',
       components: {
          'kafka': 'Handles the routing of messages between different data centers. It acts as a cross-region bridge.',
          'db': 'Cassandra is chosen for its "Write-Optimized" nature and multi-master replication, which is perfect for global chat history.'
       }
    }
  },
  {
    id: 'expert-ecommerce-eda',
    title: 'Expert: Production E-Commerce (EDA)',
    description: 'A full-scale event-driven architecture using Kafka, Outbox patterns, and CQRS.',
    difficulty: 'Expert',
    tags: ['Kafka', 'Microservices', 'EDA', 'Outbox'],
    design: {
      nodes: [
        { id: 'gateway', type: 'custom', position: { x: 0, y: 200 }, data: { label: 'API Gateway', defId: 'net-api-gateway', color: 'bg-indigo-600', iconName: 'Shield' } },
        { id: 'order-svc', type: 'custom', position: { x: 250, y: 100 }, data: { label: 'Order Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
        { id: 'order-db', type: 'custom', position: { x: 250, y: -50 }, data: { label: 'Order DB (Postgres)', defId: 'db-sql', color: 'bg-orange-500', iconName: 'Database' } },
        { id: 'outbox-relay', type: 'custom', position: { x: 500, y: 25 }, data: { label: 'Outbox Relay (CDC)', defId: 'pattern-cdc', color: 'bg-cyan-600', iconName: 'RefreshCw' } },
        { id: 'kafka', type: 'custom', position: { x: 750, y: 200 }, data: { label: 'Kafka: OrderEvents', defId: 'msg-kafka-topic', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'payment-svc', type: 'custom', position: { x: 1000, y: 50 }, data: { label: 'Payment Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
        { id: 'inventory-svc', type: 'custom', position: { x: 1000, y: 200 }, data: { label: 'Inventory Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
        { id: 'shipping-svc', type: 'custom', position: { x: 1000, y: 350 }, data: { label: 'Shipping Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
        { id: 'dlq', type: 'custom', position: { x: 1250, y: 200 }, data: { label: 'FailedEvents DLQ', defId: 'reliability-dlq', color: 'bg-red-600', iconName: 'Skull' } },
        { id: 'view-db', type: 'custom', position: { x: 1000, y: 500 }, data: { label: 'Order Read Model', defId: 'db-nosql-doc', color: 'bg-amber-600', iconName: 'Database' } },
        { id: 'search-sync', type: 'custom', position: { x: 1250, y: 500 }, data: { label: 'Search Indexer', defId: 'stream-processor', color: 'bg-purple-600', iconName: 'Wind' } },
      ],
      edges: [
        { id: 'e1', source: 'gateway', target: 'order-svc', animated: true },
        { id: 'e2', source: 'order-svc', target: 'order-db', animated: true, label: 'Tx: Save Order' },
        { id: 'e3', source: 'order-db', target: 'outbox-relay', animated: true, label: 'Log Tailing' },
        { id: 'e4', source: 'outbox-relay', target: 'kafka', animated: true, label: 'Publish' },
        { id: 'e5', source: 'kafka', target: 'payment-svc', animated: true },
        { id: 'e6', source: 'kafka', target: 'inventory-svc', animated: true },
        { id: 'e7', source: 'kafka', target: 'shipping-svc', animated: true },
        { id: 'e8', source: 'inventory-svc', target: 'dlq', animated: true, label: 'On Failure' },
        { id: 'e9', source: 'kafka', target: 'search-sync', animated: true },
        { id: 'e10', source: 'search-sync', target: 'view-db', animated: true },
      ]
    },
    explanations: {
       overall: 'This production-grade design uses the "Transactional Outbox" pattern to ensure events are never lost. It demonstrates a core Event-Driven flow where multiple downstream services (Payment, Inventory, Shipping) react to a single "OrderCreated" event independently.',
       components: {
          'order-db': 'Uses Postgres with a dedicated "outbox" table to ensure atomicity between business state and event publishing.',
          'outbox-relay': 'A CDC (Change Data Capture) tool like Debezium that streams updates from the Postgres WAL directly into Kafka.',
          'kafka': 'Acts as the central nervous system, decoupling the Order service from all side effects.',
          'search-sync': 'A Kafka Streams application that denormalizes data into a read-optimized NoSQL database for fast order history lookups.'
       }
    }
  }
,
  {
    id: 'video-streaming',
    title: 'Live Video Streaming (Twitch/YouTube)',
    description: 'High-availability architecture for real-time video broadcasting and low-latency playback.',
    difficulty: 'Expert',
    tags: ['Live Streaming', 'CDN', 'Transcoding', 'WebSockets'],
    design: {
      nodes: [
        { id: 'streamer', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'Streamer (OBS)', defId: 'net-client', color: 'bg-red-500', iconName: 'Video' } },
        { id: 'ingest', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'RTMP Ingest', defId: 'comp-server', color: 'bg-indigo-600', iconName: 'Upload' } },
        { id: 'kafka', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Transcode Queue', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'transcoder', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'GPU Transcoders', defId: 'comp-worker', color: 'bg-emerald-500', iconName: 'Cpu' } },
        { id: 'origin', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Origin Server', defId: 'store-object', color: 'bg-cyan-600', iconName: 'Cloud' } },
        { id: 'cdn', type: 'custom', position: { x: 1250, y: 150 }, data: { label: 'Edge CDN Nodes', defId: 'net-cdn', color: 'bg-indigo-500', iconName: 'Network' } },
      ],
      edges: [
        { id: 'e1', source: 'streamer', target: 'ingest', animated: true, label: 'RTMP/SRT' },
        { id: 'e2', source: 'ingest', target: 'kafka', animated: true },
        { id: 'e3', source: 'kafka', target: 'transcoder', animated: true },
        { id: 'e4', source: 'transcoder', target: 'origin', animated: true, label: 'HLS/DASH' },
        { id: 'e5', source: 'origin', target: 'cdn', animated: true },
      ]
    },
    explanations: {
       overall: 'Live streaming involves "Ingesting" a high-bitrate stream, "Transcoding" it into multiple resolutions (ABR), and delivering it via "HTTP Live Streaming" (HLS) through a global CDN.',
       components: {
          'transcoder': 'Critical for cost. Uses hardware acceleration (NVENC/QuickSync) to convert video in real-time.',
          'cdn': 'Uses "Shielding" to prevent origin overload. Most users hit edge caches for low latency.'
       }
    }
  },
  {
    id: 'food-delivery',
    title: 'Food Delivery Platform (DoorDash)',
    description: 'Complex coordination between Customers, Restaurants, and Dashers.',
    difficulty: 'Expert',
    tags: ['Matching', 'State Machine', 'Kafka', 'SQL'],
    design: {
      nodes: [
        { id: 'customer', type: 'custom', position: { x: 0, y: 50 }, data: { label: 'Customer', defId: 'net-client', color: 'bg-blue-500', iconName: 'Smartphone' } },
        { id: 'restaurant', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Restaurant', defId: 'net-client', color: 'bg-orange-500', iconName: 'Laptop' } },
        { id: 'order', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Order Orchestrator', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Box' } },
        { id: 'kafka', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Event Bus', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'dispatch', type: 'custom', position: { x: 750, y: 150 }, data: { label: 'Dispatch/Matching', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Cpu' } },
        { id: 'dasher', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Dasher App', defId: 'net-client', color: 'bg-emerald-500', iconName: 'Smartphone' } },
      ],
      edges: [
        { id: 'e1', source: 'customer', target: 'order', animated: true, label: 'Place Order' },
        { id: 'e2', source: 'order', target: 'kafka', animated: true, label: 'Order Placed' },
        { id: 'e3', source: 'kafka', target: 'restaurant', animated: true, label: 'Notify Store' },
        { id: 'e4', source: 'kafka', target: 'dispatch', animated: true, label: 'Find Dasher' },
        { id: 'e5', source: 'dispatch', target: 'dasher', animated: true, label: 'Offer Ride' },
      ]
    },
    explanations: {
       overall: 'The core challenge is "Dynamic Matching" and handling "Cascading Failures" (e.g., store is busy, dasher cancels). Systems use Finite State Machines (FSM) to track order status.',
       components: {
          'order': 'Maintains the authoritative state of every order. Uses SQL for ACID transactions.',
          'dispatch': 'Runs geospatial queries to find available dashers near the restaurant.'
       }
    }
  },
  {
    id: 'recommendation-pipeline',
    title: 'Real-time Recommendation Engine',
    description: 'Updating user interests based on their clickstream data.',
    difficulty: 'Expert',
    tags: ['Machine Learning', 'Kafka', 'Spark', 'NoSQL'],
    design: {
      nodes: [
        { id: 'user', type: 'custom', position: { x: 0, y: 150 }, data: { label: 'User Activity', defId: 'net-client', color: 'bg-blue-500', iconName: 'Activity' } },
        { id: 'kafka', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Clickstream (Kafka)', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Layers' } },
        { id: 'spark', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Spark Streaming', defId: 'comp-worker', color: 'bg-orange-500', iconName: 'Cpu' } },
        { id: 'vec-db', type: 'custom', position: { x: 750, y: 50 }, data: { label: 'Vector DB (Pinecone)', defId: 'db-nosql-wide', color: 'bg-indigo-600', iconName: 'Database' } },
        { id: 'feature', type: 'custom', position: { x: 750, y: 250 }, data: { label: 'Feature Store', defId: 'db-cache', color: 'bg-rose-500', iconName: 'HardDrive' } },
        { id: 'serving', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Model Serving', defId: 'comp-server', color: 'bg-emerald-500', iconName: 'Box' } },
      ],
      edges: [
        { id: 'e1', source: 'user', target: 'kafka', animated: true },
        { id: 'e2', source: 'kafka', target: 'spark', animated: true },
        { id: 'e3', source: 'spark', target: 'vec-db', animated: true, label: 'Compute Embeddings' },
        { id: 'e4', source: 'spark', target: 'feature', animated: true },
        { id: 'e5', source: 'serving', target: 'vec-db', animated: true, label: 'ANN Search' },
      ]
    },
    explanations: {
       overall: 'Modern recommendations use "Candidate Generation" followed by "Ranking". Real-time signals (e.g., user just clicked a blue shoe) are fed into the model via streaming pipelines to update the feed instantly.',
       components: {
          'vec-db': 'Stores item embeddings. Enables fast Approximate Nearest Neighbor (ANN) search to find similar items.',
          'feature': 'Redis or Cassandra, used for fast lookup of user profile features during inference.'
       }
    }
  },
  {
    id: 'kafka-internals',
    title: 'Kafka Internals: Cluster & Partitioning',
    description: 'A granular look at how Kafka manages data across brokers, partitions, and consumers.',
    difficulty: 'Expert',
    tags: ['Kafka', 'Infrastructure', 'Reliability'],
    design: {
      nodes: [
        { id: 'p1', type: 'custom', position: { x: 0, y: 100 }, data: { label: 'Producer A (Retries=3)', defId: 'comp-server', color: 'bg-blue-500', iconName: 'Upload' } },
        { id: 'p2', type: 'custom', position: { x: 0, y: 300 }, data: { label: 'Producer B (Idempotent)', defId: 'comp-server', color: 'bg-blue-600', iconName: 'Fingerprint' } },
        { id: 'b1', type: 'custom', position: { x: 300, y: 50 }, data: { label: 'Broker 1 (Controller)', defId: 'msg-kafka-broker', color: 'bg-zinc-800', iconName: 'Server', status: 'Healthy' } },
        { id: 'b2', type: 'custom', position: { x: 300, y: 200 }, data: { label: 'Broker 2', defId: 'msg-kafka-broker', color: 'bg-zinc-800', iconName: 'Server', status: 'Healthy' } },
        { id: 'b3', type: 'custom', position: { x: 300, y: 350 }, data: { label: 'Broker 3', defId: 'msg-kafka-broker', color: 'bg-zinc-800', iconName: 'Server', status: 'Healthy' } },
        { id: 'kraft', type: 'custom', position: { x: 300, y: -100 }, data: { label: 'KRaft Quorum', defId: 'comp-microservice', color: 'bg-purple-600', iconName: 'Shield' } },
        { id: 'cg1', type: 'custom', position: { x: 700, y: 100 }, data: { label: 'Consumer Group A', defId: 'msg-kafka-consumer-group', color: 'bg-emerald-600', iconName: 'Layers' } },
        { id: 'cg2', type: 'custom', position: { x: 700, y: 300 }, data: { label: 'Consumer Group B', defId: 'msg-kafka-consumer-group', color: 'bg-teal-600', iconName: 'Layers' } },
        { id: 'registry', type: 'custom', position: { x: 0, y: -50 }, data: { label: 'Schema Registry', defId: 'msg-kafka-schema-registry', color: 'bg-indigo-500', iconName: 'FileText' } },
      ],
      edges: [
        { id: 'e1', source: 'p1', target: 'b1', animated: true, label: 'Produce to P0' },
        { id: 'e2', source: 'p2', target: 'b2', animated: true, label: 'Produce to P1' },
        { id: 'e3', source: 'b1', target: 'b2', animated: true, label: 'Replicate' },
        { id: 'e4', source: 'b1', target: 'b3', animated: true, label: 'Replicate' },
        { id: 'e5', source: 'b1', target: 'cg1', animated: true, label: 'Fetch' },
        { id: 'e6', source: 'b2', target: 'cg1', animated: true, label: 'Fetch' },
        { id: 'e7', source: 'b3', target: 'cg2', animated: true, label: 'Fetch' },
        { id: 'e8', source: 'p1', target: 'registry', animated: false, label: 'Check Schema' },
        { id: 'e9', source: 'kraft', target: 'b1', animated: false, label: 'Metadata' },
      ]
    },
    explanations: {
       overall: 'This granular design shows the inner workings of a Kafka cluster. It highlights how data is partitioned across multiple brokers and how KRaft (replacing ZooKeeper) manages cluster metadata.',
       components: {
          'kraft': 'Modern Kafka uses the KRaft protocol (Raft consensus) to manage metadata internally, removing the need for an external ZooKeeper cluster.',
          'b1': 'The Controller broker is responsible for managing partition leaders and handling failures across the cluster.',
          'p2': 'An Idempotent producer ensures that even if a network error causes a retry, the message is only written to the log once.',
          'cg1': 'Consumer groups allow multiple instances of a service to share the workload of processing a topic, with Kafka handling the assignment of partitions.'
       }
    }
  },
  {
    id: 'enterprise-ecommerce',
    title: 'E-Commerce Platform',
    description: 'A highly scalable e-commerce platform using microservices, Kafka for event streaming, caching, database sharding, and modern cloud-native patterns.',
    difficulty: 'Expert',
    tags: ['E-Commerce', 'Event-Driven', 'Kafka', 'Scalability'],
    design: {
      nodes: [
        // Edge & Gateway
        { id: 'users', type: 'custom', position: { x: -150, y: 0 }, data: { label: 'Users', defId: 'net-client', color: 'bg-zinc-700', iconName: 'Smartphone' } },
        { id: 'cdn', type: 'custom', position: { x: 50, y: 0 }, data: { label: 'CDN Edge', defId: 'net-cdn', color: 'bg-blue-600', iconName: 'Globe' } },
        { id: 'waf', type: 'custom', position: { x: 250, y: 0 }, data: { label: 'WAF', defId: 'net-api-gateway', color: 'bg-red-500', iconName: 'Shield' } },
        { id: 'lb', type: 'custom', position: { x: 450, y: 0 }, data: { label: 'Load Balancer', defId: 'net-load-balancer', color: 'bg-indigo-500', iconName: 'Layers' } },
        { id: 'gateway', type: 'custom', position: { x: 650, y: 0 }, data: { label: 'API Gateway', defId: 'net-api-gateway', color: 'bg-teal-500', iconName: 'Zap' } },
        
        // Microservices Layer
        { id: 'svc-user', type: 'custom', position: { x: -50, y: 180 }, data: { label: 'User Service', defId: 'comp-microservice', color: 'bg-purple-500', iconName: 'User' } },
        { id: 'svc-product', type: 'custom', position: { x: 150, y: 180 }, data: { label: 'Product Service', defId: 'comp-microservice', color: 'bg-blue-500', iconName: 'Package' } },
        { id: 'svc-search', type: 'custom', position: { x: 350, y: 180 }, data: { label: 'Search Service', defId: 'comp-microservice', color: 'bg-cyan-500', iconName: 'Search' } },
        { id: 'svc-cart', type: 'custom', position: { x: 550, y: 180 }, data: { label: 'Cart Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'ShoppingCart' } },
        { id: 'svc-checkout', type: 'custom', position: { x: 750, y: 180 }, data: { label: 'Checkout Service', defId: 'comp-microservice', color: 'bg-purple-500', iconName: 'CreditCard' } },
        { id: 'svc-order', type: 'custom', position: { x: 950, y: 180 }, data: { label: 'Order Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'FileText' } },
        
        { id: 'svc-inventory', type: 'custom', position: { x: -50, y: 260 }, data: { label: 'Inventory Service', defId: 'comp-microservice', color: 'bg-indigo-500', iconName: 'Box' } },
        { id: 'svc-payment', type: 'custom', position: { x: 150, y: 260 }, data: { label: 'Payment Service', defId: 'comp-microservice', color: 'bg-orange-500', iconName: 'DollarSign' } },
        { id: 'svc-invoice', type: 'custom', position: { x: 350, y: 260 }, data: { label: 'Invoice Service', defId: 'comp-microservice', color: 'bg-purple-500', iconName: 'FileText' } },
        { id: 'svc-shipping', type: 'custom', position: { x: 550, y: 260 }, data: { label: 'Shipping Service', defId: 'comp-microservice', color: 'bg-blue-500', iconName: 'Truck' } },
        { id: 'svc-notif', type: 'custom', position: { x: 750, y: 260 }, data: { label: 'Notification Service', defId: 'comp-microservice', color: 'bg-red-500', iconName: 'Mail' } },
        { id: 'svc-review', type: 'custom', position: { x: 950, y: 260 }, data: { label: 'Review Service', defId: 'comp-microservice', color: 'bg-teal-500', iconName: 'Star' } },
        
        // Kafka Layer Detailed
        { id: 'kafka-group', type: 'group', position: { x: 100, y: 380 }, style: { width: 900, height: 260, backgroundColor: 'rgba(79, 70, 229, 0.05)', borderColor: 'rgba(79, 70, 229, 0.2)', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12 }, data: { label: '' } },
        { id: 'kafka-label', type: 'custom', parentNode: 'kafka-group', position: { x: 20, y: 20 }, data: { label: 'Kafka Cluster', defId: 'msg-kafka-cluster', color: 'bg-indigo-700', iconName: 'Layers' } },
        
        { id: 'k-broker-1', type: 'custom', parentNode: 'kafka-group', position: { x: 200, y: 20 }, data: { label: 'Broker 1', defId: 'msg-kafka-broker', color: 'bg-indigo-600', iconName: 'Server' } },
        { id: 'k-broker-2', type: 'custom', parentNode: 'kafka-group', position: { x: 380, y: 20 }, data: { label: 'Broker 2', defId: 'msg-kafka-broker', color: 'bg-indigo-600', iconName: 'Server' } },
        { id: 'k-broker-3', type: 'custom', parentNode: 'kafka-group', position: { x: 560, y: 20 }, data: { label: 'Broker 3', defId: 'msg-kafka-broker', color: 'bg-indigo-600', iconName: 'Server' } },
        { id: 'k-schema', type: 'custom', parentNode: 'kafka-group', position: { x: 740, y: 20 }, data: { label: 'Schema Registry', defId: 'msg-schema-registry', color: 'bg-blue-600', iconName: 'Database' } },
        
        { id: 't-orders', type: 'custom', parentNode: 'kafka-group', position: { x: 200, y: 120 }, data: { label: 'orders.created', defId: 'msg-topic', color: 'bg-emerald-600', iconName: 'Activity' } },
        { id: 't-payments', type: 'custom', parentNode: 'kafka-group', position: { x: 380, y: 120 }, data: { label: 'payments.success', defId: 'msg-topic', color: 'bg-orange-600', iconName: 'Activity' } },
        { id: 't-inventory', type: 'custom', parentNode: 'kafka-group', position: { x: 560, y: 120 }, data: { label: 'inventory.reserved', defId: 'msg-topic', color: 'bg-cyan-600', iconName: 'Activity' } },
        { id: 't-dlq', type: 'custom', parentNode: 'kafka-group', position: { x: 740, y: 120 }, data: { label: 'DLQ / Retries', defId: 'msg-topic', color: 'bg-red-600', iconName: 'AlertTriangle' } },
        
        // Data & Cache Layer Detailed
        { id: 'db-group', type: 'group', position: { x: -100, y: 700 }, style: { width: 1100, height: 260, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12 }, data: { label: '' } },
        
        { id: 'db-order-router', type: 'custom', parentNode: 'db-group', position: { x: 20, y: 20 }, data: { label: 'Order DB Router', defId: 'db-proxy', color: 'bg-blue-500', iconName: 'Route' } },
        { id: 'db-order-s1', type: 'custom', parentNode: 'db-group', position: { x: 200, y: 20 }, data: { label: 'Shard 1 (A-M)', defId: 'db-postgresql', color: 'bg-blue-700', iconName: 'Database' } },
        { id: 'db-order-s2', type: 'custom', parentNode: 'db-group', position: { x: 380, y: 20 }, data: { label: 'Shard 2 (N-Z)', defId: 'db-postgresql', color: 'bg-blue-700', iconName: 'Database' } },
        { id: 'db-order-rep', type: 'custom', parentNode: 'db-group', position: { x: 290, y: 120 }, data: { label: 'Read Replicas', defId: 'db-postgresql', color: 'bg-cyan-700', iconName: 'Database' } },
        
        { id: 'cache-redis', type: 'custom', parentNode: 'db-group', position: { x: 600, y: 20 }, data: { label: 'Redis Cluster', defId: 'db-cache', color: 'bg-emerald-600', iconName: 'Zap' } },
        { id: 'cache-r1', type: 'custom', parentNode: 'db-group', position: { x: 780, y: 20 }, data: { label: 'Redis Node 1', defId: 'db-cache', color: 'bg-emerald-500', iconName: 'Server' } },
        { id: 'cache-r2', type: 'custom', parentNode: 'db-group', position: { x: 780, y: 120 }, data: { label: 'Redis Node 2', defId: 'db-cache', color: 'bg-emerald-500', iconName: 'Server' } },
        
        // Observability
        { id: 'obs-mon', type: 'custom', position: { x: 150, y: 1020 }, data: { label: 'Prometheus', defId: 'comp-microservice', color: 'bg-red-500', iconName: 'Activity' } },
        { id: 'obs-log', type: 'custom', position: { x: 350, y: 1020 }, data: { label: 'ELK Stack', defId: 'comp-microservice', color: 'bg-orange-500', iconName: 'FileText' } },
        { id: 'obs-trace', type: 'custom', position: { x: 550, y: 1020 }, data: { label: 'Jaeger Tracing', defId: 'comp-microservice', color: 'bg-blue-500', iconName: 'Route' } }
      ],
      edges: [
        { id: 'e1', source: 'users', target: 'cdn' },
        { id: 'e2', source: 'cdn', target: 'waf' },
        { id: 'e3', source: 'waf', target: 'lb' },
        { id: 'e4', source: 'lb', target: 'gateway' },
        { id: 'e5', source: 'gateway', target: 'svc-order' },
        { id: 'e-cart', source: 'gateway', target: 'svc-cart' },
        { id: 'e-checkout', source: 'gateway', target: 'svc-checkout' },
        
        // Order Service -> Kafka
        { id: 'e6', source: 'svc-order', target: 't-orders', label: 'OrderCreated' },
        { id: 'e-payment-k', source: 'svc-payment', target: 't-payments', label: 'PaymentSuccess' },
        { id: 'e-inv-k', source: 'svc-inventory', target: 't-inventory', label: 'InventoryReserved' },
        
        // Consumers
        { id: 'e7', source: 't-orders', target: 'svc-inventory' },
        { id: 'e8', source: 't-orders', target: 'svc-payment' },
        { id: 'e10', source: 't-payments', target: 'svc-shipping' },
        { id: 'e11', source: 't-payments', target: 'svc-notif' },
        { id: 'e12', source: 't-inventory', target: 'svc-order' },
        
        // Data connections
        { id: 'e-db1', source: 'svc-order', target: 'db-order-router' },
        { id: 'e-db2', source: 'db-order-router', target: 'db-order-s1' },
        { id: 'e-db3', source: 'db-order-router', target: 'db-order-s2' },
        { id: 'e-db4', source: 'db-order-s1', target: 'db-order-rep' },
        { id: 'e-db5', source: 'db-order-s2', target: 'db-order-rep' },
        
        { id: 'e-cache1', source: 'svc-product', target: 'cache-redis' },
        { id: 'e-cache2', source: 'svc-cart', target: 'cache-redis' },
        { id: 'e-cache3', source: 'cache-redis', target: 'cache-r1' },
        { id: 'e-cache4', source: 'cache-redis', target: 'cache-r2' }
      ]
    },
    explanations: {
      overall: 'This Enterprise E-Commerce architecture demonstrates a highly scalable, event-driven approach. It uses the Saga pattern for distributed transactions and Kafka as the backbone for asynchronous processing.',
      components: {
        'kafka': 'The central nervous system of the platform. It handles massive event streams and decouples services for high reliability.',
        'svc-order': 'Orchestrates the order lifecycle and produces events that trigger downstream fulfillment and payments.',
        'db-order': 'Sharded PostgreSQL database to handle millions of transactions with high consistency.',
        'svc-inventory': 'Maintains real-time stock levels using Redis for fast reservations and SQL for persistence.'
      },
      detailed: {
        overview: "A flagship Enterprise E-Commerce platform must handle millions of users and peak traffic events (like Black Friday) while maintaining 99.99% availability. This architecture moves away from a monolithic 'Checkout' logic into a series of decoupled microservices that communicate via a distributed log (Kafka).",
        functionalRequirements: [
          "Global Product Catalog & Search",
          "Real-time Inventory Management (Stock Reservations)",
          "Complex Order Lifecycle (Pending -> Paid -> Shipped)",
          "Secure Payment Processing with 3rd Party Integrations",
          "Multi-channel Notifications (Email, SMS, Push)",
          "User Profile & Order History Management"
        ],
        nonFunctionalRequirements: [
          "Availability: 99.99% (Multi-Region Active-Passive)",
          "Scalability: Support 100k+ Requests Per Second at peak",
          "Latency: < 100ms for Catalog browsing, < 500ms for Checkout",
          "Consistency: Strong consistency for Payments and Inventory",
          "Security: PCI-DSS compliance, OAuth2/OIDC for Auth"
        ],
        capacityEstimation: {
          dau: "50 Million",
          rps: "50,000 (Average) / 250,000 (Peak)",
          storage: "5 PB over 5 years (Media, Logs, History)",
          bandwidth: "50 GB/sec Outbound",
          calculations: [
            "Orders per day: 2 Million",
            "Peak Orders per second: 10,000",
            "Inventory updates: 100k writes/sec",
            "Search queries: 150k reads/sec"
          ]
        },
        architectureWalkthrough: [
          "1. User accesses the app via Cloudflare CDN (Edge) for low latency assets.",
          "2. API Gateway handles Rate Limiting and Routes requests to the Order Service.",
          "3. Order Service validates the request and creates a 'PENDING' order in its sharded DB.",
          "4. Order Service publishes an 'OrderCreated' event to the Kafka 'orders' topic.",
          "5. Inventory Service consumes the event and attempts to reserve stock in Redis.",
          "6. Payment Service consumes the same event and initiates a transaction with Stripe/PayPal.",
          "7. Upon Payment Success, a 'PaymentCompleted' event is sent back to Kafka.",
          "8. Shipping and Notification services react to complete the fulfillment cycle."
        ],
        dataFlow: [
          "Order Creation: User -> Gateway -> Order Svc -> DB (Commit) -> Kafka (Produce)",
          "Stock Check: Product Page -> Gateway -> Catalog Svc -> Redis Cache -> Response",
          "Payment Flow: Order Svc -> Kafka -> Payment Svc -> 3rd Party Gateway -> Kafka -> Order Svc"
        ],
        designDecisions: [
          { question: "Why Kafka instead of RabbitMQ?", answer: "Kafka provides message durability and replayability. This is critical for auditing and recovering from service failures by replaying the event log." },
          { question: "Why Sharding for Order DB?", answer: "A single database instance cannot handle millions of writes per hour. Sharding by 'Customer_ID' distributes the load across multiple physical machines." },
          { question: "Why Database-per-Service?", answer: "It ensures that services are fully decoupled. If the Product database is slow, it doesn't block the Payment or Order databases." }
        ],
        scalingStrategy: [
          "Horizontal Scaling: Kubernetes clusters auto-scale microservices based on CPU/Memory and Kafka lag.",
          "Read Replicas: Catalog databases use 10+ replicas to handle massive search traffic.",
          "Multi-Region: Primary region handles writes; secondary region serves read traffic and acts as failover."
        ],
        failureScenarios: [
          { scenario: "Payment Gateway is Down", recovery: "Payment service uses exponential backoff for retries. If persistent, it moves events to a Dead Letter Queue (DLQ) for manual intervention." },
          { scenario: "Inventory DB Race Condition", recovery: "Uses Lua scripts in Redis to perform 'Compare-and-Set' (CAS) operations for atomic stock decrement." },
          { scenario: "Kafka Broker Failure", recovery: "Kafka replicates partitions across 3 brokers. A new leader is elected automatically with zero data loss (acks=all)." }
        ],
        security: [
          "Mutual TLS (mTLS) for all service-to-service communication.",
          "Regular PCI-DSS audits for the Payment domain.",
          "WAF (Web Application Firewall) to mitigate DDoS and SQL injection attacks."
        ],
        realWorldUsage: "Amazon, eBay, and Walmart use variants of this pattern to handle global scale and peak loads like Prime Day.",
        interviewPerspective: {
          howToExplain: "Start with the high-level domains (Orders, Inventory, Payments). Explain the shift from synchronous to asynchronous processing using Kafka. Discuss how you maintain data consistency without global transactions.",
          followUps: ["How do you handle double spending in payments?", "How do you implement a distributed shopping cart?", "What happens if Kafka is unavailable?"],
          commonMistakes: ["Suggesting 2PC (Two-Phase Commit) for microservices.", "Ignoring database sharding until it's too late.", "Not having a Dead Letter Queue strategy."]
        },
        keyTakeaways: [
          "Event-driven design is the only way to scale complex retail workflows.",
          "Kafka acts as the source of truth and the integration glue.",
          "Consistency is achieved through Idempotency and Retries, not locks."
        ],
        interactiveLinks: [
          { label: "Kafka Cluster Internals", type: "ARCHITECTURE", targetId: "kafka-internals" },
          { label: "Distributed Rate Limiter", type: "ARCHITECTURE", targetId: "rate-limiter" },
          { label: "Inventory Service Design", type: "LESSON", targetId: "inventory-svc-lesson" },
          { label: "Payment Idempotency", type: "INTERVIEW", targetId: "payment-idempotency" }
        ]
      }
    }
  },
  {
    id: 'twitter-timeline',
    title: 'Social Media Feed (Twitter/X Timeline)',
    description: 'A high-throughput social network feed system optimized for extreme read-to-write ratios (fan-out), handling both regular users and high-profile celebrities.',
    difficulty: 'Advanced',
    tags: ['Heavy-Read', 'Caching', 'Kafka', 'System Architecture'],
    design: {
      nodes: [
        { id: 'client', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'User Mobile/Web', defId: 'net-client', color: 'bg-blue-500', iconName: 'Smartphone' } },
        { id: 'lb', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Load Balancer', defId: 'net-load-balancer', color: 'bg-sky-500', iconName: 'Layers' } },
        { id: 'gw', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'API Gateway', defId: 'net-api-gateway', color: 'bg-teal-500', iconName: 'Zap' } },
        
        { id: 'svc-tweet', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Tweet Service', defId: 'comp-microservice', color: 'bg-indigo-500', iconName: 'FileText' } },
        { id: 'svc-timeline', type: 'custom', position: { x: 650, y: 250 }, data: { label: 'Timeline Service', defId: 'comp-microservice', color: 'bg-emerald-500', iconName: 'Layers' } },
        
        { id: 'msg-fanout', type: 'custom', position: { x: 850, y: 50 }, data: { label: 'Kafka (Fan-Out Queue)', defId: 'msg-stream', color: 'bg-zinc-700', iconName: 'Activity' } },
        { id: 'worker-fanout', type: 'custom', position: { x: 1050, y: 50 }, data: { label: 'Fan-Out Workers', defId: 'comp-worker', color: 'bg-lime-500', iconName: 'Cpu' } },
        
        { id: 'db-tweets', type: 'custom', position: { x: 850, y: 180 }, data: { label: 'Cassandra (Tweets DB)', defId: 'db-nosql-wide', color: 'bg-red-500', iconName: 'Database' } },
        { id: 'cache-timeline', type: 'custom', position: { x: 1050, y: 250 }, data: { label: 'Redis (Timeline Cache)', defId: 'db-cache', color: 'bg-rose-500', iconName: 'HardDrive' } }
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'lb' },
        { id: 'e2', source: 'lb', target: 'gw' },
        { id: 'e3', source: 'gw', target: 'svc-tweet', label: 'Post Tweet' },
        { id: 'e4', source: 'gw', target: 'svc-timeline', label: 'Get Feed' },
        
        { id: 'e5', source: 'svc-tweet', target: 'db-tweets', label: 'Save Tweet' },
        { id: 'e6', source: 'svc-tweet', target: 'msg-fanout', label: 'Publish Event' },
        
        { id: 'e7', source: 'msg-fanout', target: 'worker-fanout', label: 'Trigger' },
        { id: 'e8', source: 'worker-fanout', target: 'cache-timeline', label: 'Pre-compute / push to follower lists' },
        
        { id: 'e9', source: 'svc-timeline', target: 'cache-timeline', label: 'O(1) Redis read' }
      ]
    },
    explanations: {
      overall: 'This architecture demonstrates the hybrid push/pull fan-out model utilized by Twitter/X to handle high read volumes and the celebrity problem.',
      components: {
        'svc-tweet': 'Handles tweet creations and validates payload lengths, then persists and publishes them to the fan-out queue.',
        'svc-timeline': 'Serves pre-computed chronologically ordered user feeds directly from high-speed memory cache.',
        'db-tweets': 'Highly partitionable Wide-column database storing tweets keyed by user ID and timestamp.',
        'cache-timeline': 'In-memory database storing chronologically-sorted tweet IDs representing active user timelines.'
      },
      detailed: {
        overview: "A global-scale social network timeline must serve feeds to billions of active users with ultra-low latency. The primary challenge is 'write amplification' or 'fan-out'—the process of taking one tweet and distributing it to all followers of the tweeter.",
        functionalRequirements: [
          "Post new tweets",
          "Retrieve chronologically ordered home timeline (tweets of people followed)",
          "Retrieve user timeline (own tweets)",
          "Follow and unfollow users"
        ],
        nonFunctionalRequirements: [
          "Latency: < 100ms for home timeline retrieval",
          "Availability: 99.9% read availability",
          "Scale: 100M+ active users, 500M+ tweets/day"
        ],
        capacityEstimation: {
          dau: "100 Million",
          rps: "5,000 writes/sec (Average), 500,000 reads/sec (Peak)",
          storage: "30 TB/day for tweet text, media excluded",
          bandwidth: "150 Gbps downstream",
          calculations: [
            "Writes: 100M users * 5 tweets/day = 500M tweets/day",
            "Average Write QPS: 500M / 86400 ≈ 5,700 QPS",
            "Read QPS: Assuming 100x reads to writes ≈ 500,000 QPS"
          ]
        },
        architectureWalkthrough: [
          "1. User posts a tweet. The request lands on the Load Balancer, routed to the API Gateway.",
          "2. Tweet Service persists the tweet to the durable Cassandra database.",
          "3. Tweet Service publishes a 'TweetPosted' event to Kafka.",
          "4. Fan-Out Workers pull the event, query the user graph to get the sender's followers list.",
          "5. If the sender is a regular user: Workers push the Tweet ID into the Redis timeline cache of all active followers (Push Model).",
          "6. If the sender is a celebrity (e.g., > 100k followers): No push occurs. The celebrity's tweets are loaded on-demand when followers refresh their timeline (Pull/Hybrid Model)."
        ],
        dataFlow: [
          "Post Tweet (Regular User): User -> Tweet Service -> Cassandra (Durable DB) -> Kafka -> Fan-Out Worker -> Redis Cache (Follower Timeline)",
          "Feed Refresh: User -> Timeline Service -> Redis cache lookup (Fast O(1)) -> Merge with any Celebrity Pull tweets -> Return"
        ],
        designDecisions: [
          { question: "Why a hybrid Push/Pull model?", answer: "Push model is super fast for reads, but if a celebrity with 10M followers tweets, pushing to 10M caches instantly kills database write buffers. Hybrid models balance this." },
          { question: "Why Cassandra for Tweet database?", answer: "Cassandra is optimized for write throughput and naturally sorts by partitioning keys (User ID) and clustering keys (Timestamp)." }
        ],
        scalingStrategy: [
          "Redis Clustering: Shard user timeline caches across thousands of Redis nodes using consistent hashing.",
          "Graph Database for Follow Graph: Use Neo4j or pre-computed adjacency lists in memory to track who follows whom."
        ],
        failureScenarios: [
          { scenario: "Redis node hosting timelines crashes", recovery: "Timeline service fails back to pulling directly from Cassandra to rebuild the cache, then re-stores in Redis." },
          { scenario: "Fan-out worker lag spikes", recovery: "Autoscaling group spins up more consumer pods based on Kafka group lag metrics." }
        ],
        security: [
          "HTTPS / WSS for client-to-server traffic.",
          "Input sanitization to prevent cross-site scripting (XSS) in shared feeds."
        ],
        realWorldUsage: "Twitter/X, Instagram Feed, and Facebook Feed use variants of this hybrid timeline pre-computation pattern.",
        interviewPerspective: {
          howToExplain: "Start with why the naive database query (SELECT * FROM tweets WHERE user_id IN (follows)) fails under load. Introduce the concept of pre-computed timeline caches in Redis. Discuss the celebrity problem and the hybrid push/pull solution.",
          followUps: ["How do you handle pagination in the feed?", "How do you track read vs unread tweets in a cache?", "What is the eviction policy for offline user caches?"],
          commonMistakes: ["Suggesting full relational SQL JOINs at runtime for high-scale feeds.", "Failing to account for the celebrity write amplification bottleneck."]
        },
        keyTakeaways: [
          "Read-heavy systems require moving cost from read-time to write-time.",
          "Pre-computation is the key to sub-millisecond timeline rendering.",
          "Specialized hybrid solutions are required to handle unequal client distribution (Celebrities)."
        ]
      }
    }
  },
  {
    id: 'collaborative-docs',
    title: 'Real-Time Collaborative Editor (Google Docs)',
    description: 'A low-latency real-time collaborative document editing system using WebSockets, Operational Transformation (OT), and CRDTs to achieve consensus.',
    difficulty: 'Expert',
    tags: ['Real-Time', 'WebSockets', 'Consensus', 'CRDT'],
    design: {
      nodes: [
        { id: 'client1', type: 'custom', position: { x: 50, y: 50 }, data: { label: 'Editor 1', defId: 'net-client', color: 'bg-blue-500', iconName: 'Laptop' } },
        { id: 'client2', type: 'custom', position: { x: 50, y: 250 }, data: { label: 'Editor 2', defId: 'net-client', color: 'bg-blue-500', iconName: 'Laptop' } },
        
        { id: 'lb', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Load Balancer', defId: 'net-load-balancer', color: 'bg-sky-500', iconName: 'Layers' } },
        { id: 'gw-websocket', type: 'custom', position: { x: 450, y: 150 }, data: { label: 'WebSocket Gateway', defId: 'net-api-gateway', color: 'bg-teal-500', iconName: 'Route' } },
        
        { id: 'svc-collab', type: 'custom', position: { x: 650, y: 150 }, data: { label: 'Collaboration Svc', defId: 'comp-microservice', color: 'bg-indigo-500', iconName: 'Box' } },
        { id: 'cache-pubsub', type: 'custom', position: { x: 850, y: 150 }, data: { label: 'Redis (Document State & Pub/Sub)', defId: 'db-cache', color: 'bg-rose-500', iconName: 'HardDrive' } },
        
        { id: 'svc-ot-engine', type: 'custom', position: { x: 850, y: 50 }, data: { label: 'OT / CRDT Conflict Engine', defId: 'comp-worker', color: 'bg-lime-500', iconName: 'Cpu' } },
        { id: 'db-docs', type: 'custom', position: { x: 1050, y: 150 }, data: { label: 'MongoDB (JSON Docs)', defId: 'db-nosql-doc', color: 'bg-amber-500', iconName: 'Database' } }
      ],
      edges: [
        { id: 'e1', source: 'client1', target: 'lb' },
        { id: 'e2', source: 'client2', target: 'lb' },
        { id: 'e3', source: 'lb', target: 'gw-websocket', label: 'Sticky Connection' },
        { id: 'e4', source: 'gw-websocket', target: 'svc-collab', label: 'Route Events' },
        
        { id: 'e5', source: 'svc-collab', target: 'cache-pubsub', label: 'Verify state / Pub/Sub update' },
        { id: 'e6', source: 'svc-collab', target: 'svc-ot-engine', label: 'Resolve conflict' },
        
        { id: 'e7', source: 'svc-ot-engine', target: 'db-docs', label: 'Commit final doc state' },
        { id: 'e8', source: 'cache-pubsub', target: 'gw-websocket', label: 'Broadcast edits to other editors' }
      ]
    },
    explanations: {
      overall: 'This architecture uses a stateful WebSocket connection tier, coupled with high-speed memory queues and a central conflict resolution engine (OT or CRDT) to sync concurrent document updates.',
      components: {
        'gw-websocket': 'Manages millions of active persistent WebSocket connections, ensuring traffic routing is fast and lightweight.',
        'svc-collab': 'Maintains active editing rooms and processes operations (insert, delete, style) in real-time.',
        'svc-ot-engine': 'Executes Operational Transformation (OT) or processes Conflict-free Replicated Data Type (CRDT) operations to maintain structural document consensus.',
        'db-docs': 'Flexible Document database storing JSON document state and edit histories.'
      },
      detailed: {
        overview: "Design a real-time collaborative editor like Google Docs where multiple users can edit the same document concurrently. Changes must reflect on all users' screens in near real-time (< 100ms) with zero conflicts and guaranteed structural consensus.",
        functionalRequirements: [
          "Real-time concurrent text editing",
          "Cursor position and selection sharing",
          "Rich text formatting support",
          "Document history, revisions, and rollbacks"
        ],
        nonFunctionalRequirements: [
          "Latency: < 50ms user-to-server, < 100ms end-to-end sync",
          "Consistency: Eventual consistency (all users eventually see the exact same document state)",
          "Scale: millions of active editing documents, up to 1,000 concurrent editors per document"
        ],
        capacityEstimation: {
          dau: "10 Million",
          rps: "50,000 operations/sec (Peak)",
          storage: "10 TB/year for rich text, revision history excluded",
          bandwidth: "5 Gbps incoming edit stream",
          calculations: [
            "Active users: 1 Million editing at any given time",
            "Keystroke rate: 2-3 characters per second ≈ 3M edit operations/sec",
            "Payload per operation (keystroke + cursor + metadata): 150 bytes ≈ 450 MB/s bandwidth"
          ]
        },
        architectureWalkthrough: [
          "1. Users establish a persistent WebSocket connection to the WebSocket Gateway.",
          "2. As a user types, an Operation Object (e.g., `insert(char: 'A', position: 12)`) is serialized and pushed via the WebSocket.",
          "3. The Gateway routes the operation to the stateless Collaboration Service hosting the document's active editing session.",
          "4. The service coordinates with the OT/CRDT Engine to resolve any concurrent conflicts (e.g., if two users typed at position 12 simultaneously).",
          "5. Once resolved and merged, the official state is committed to Redis (in-memory state) and broadcasted back to all other connected WebSocket Gateways of that document's room.",
          "6. Periodically, the compiled document state is flushed asynchronously from Redis to MongoDB for long-term durable storage."
        ],
        dataFlow: [
          "Edit Character: Editor 1 Key -> WebSocket Gateway -> Collab Service -> OT Engine (Resolve) -> Broadcast to Redis Pub/Sub -> Gateway -> Editor 2 screen updates"
        ],
        designDecisions: [
          { question: "Operational Transformation (OT) vs CRDT?", answer: "OT requires a centralized server to coordinate and transform sequential operations, making it highly suitable for web-based editors with a server (like Google Docs). CRDT is decentralized, enabling offline-first peer-to-peer syncing, but consumes significantly more memory." },
          { question: "Why Sticky Load Balancing?", answer: "WebSocket traffic must land on the same WebSocket gateway node hosting the connection, or use a distributed Pub/Sub mechanism (like Redis) to route messages across different gateway nodes." }
        ],
        scalingStrategy: [
          "Redis Pub/Sub: Use Redis to route active workspace updates between different WebSocket server hosts.",
          "Workspace Partitioning: Pin active document editing sessions to a specific Collaboration Server to minimize server-to-server synchronization overhead."
        ],
        failureScenarios: [
          { scenario: "WebSocket Gateway crashes", recovery: "Client detects disconnect, falls back to HTTP long polling or establishes a new WebSocket with a different gateway node, re-syncing missing edit sequences." },
          { scenario: "Network disconnect / offline editing", recovery: "The client buffer edits locally. Upon reconnect, the client sends a batch of operations which the OT server transforms against edits made by other users in the meantime." }
        ],
        security: [
          "Document access controls validated on connection establishment and message receipt.",
          "Input validation on operation indexes to prevent index out of bounds crashes on the server."
        ],
        realWorldUsage: "Google Docs, Figma, Notion, and Miro use hybrid OT/CRDT WebSocket sync engines.",
        interviewPerspective: {
          howToExplain: "Begin with the concurrency challenge: if two users type at the same index, a naive overlay results in letters missing or duplicate text. Explain the algorithms (OT or CRDT) at a high level. Draw the persistent WebSocket tier and explain Redis Pub/Sub for room routing.",
          followUps: ["How do you handle undo/redo in collaborative editing?", "How do you scale to 10,000 users editing a live spreadsheet?", "How do you store document version history efficiently?"],
          commonMistakes: ["Suggesting traditional REST polling for keystrokes.", "Failing to explain how operation conflicts are resolved."]
        },
        keyTakeaways: [
          "Real-time coordination requires persistent stateful connections.",
          "Conflict resolution (OT/CRDT) is mandatory for data correctness in concurrent environments.",
          "Asynchronous database flushes protect primary stores from keystroke write bursts."
        ]
      }
    }
  }
];
