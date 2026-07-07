import {
  Globe, Smartphone, Laptop, Route, Shield, Search, Database, HardDrive,
  Server, Cpu, Box, Cloud, Activity, Lock, Mail, MessageSquare, Brain,
  Key, FileText, Layers, Network, Wifi, CloudRain, ShieldAlert,
  StretchHorizontal, Archive, Skull, RotateCcw, Fingerprint, Wind
} from 'lucide-react';

export interface ComponentDefinition {
  id: string;
  category: string;
  type: string;
  label: string;
  color: string;
  iconName: string;
  description: string;
  beginnerExplanation: string;
  whyItExists: string;
  howItWorks: string;
  advantages: string[];
  disadvantages: string[];
  commonMistakes: string[];
  relatedComponents: string[];
  useCases: string[];
  interviewTips: string;
}

export const COMPONENT_CATEGORIES = [
  'Networking', 'Compute', 'Databases', 'Messaging', 'Storage', 
  'Search', 'Monitoring', 'Security', 'Communication', 'AI', 'Cloud', 'Other'
];

export const COMPONENT_CATALOG: ComponentDefinition[] = [
  // Networking
  {
    id: 'net-client', category: 'Networking', type: 'Client', label: 'Client / User', color: 'bg-blue-500', iconName: 'Laptop',
    description: 'The end-user device or application making requests to the system.',
    beginnerExplanation: 'The person or device (like a phone or laptop) that is trying to use your application.',
    whyItExists: 'Represents the origin of traffic and user interaction.',
    howItWorks: 'Initiates HTTP/WebSocket connections to the backend, rendering data to the user.',
    advantages: ['Offloads UI rendering from the server'],
    disadvantages: ['Cannot be trusted (needs validation)'],
    commonMistakes: ['Trusting client-side validation without server-side checks', 'Sending sensitive logic to the client'],
    relatedComponents: ['Load Balancer', 'API Gateway', 'CDN'],
    useCases: ['Web browsers', 'Mobile apps', 'IoT devices'],
    interviewTips: 'Always assume clients can send malicious data. Discuss rate limiting and input validation.'
  },
  {
    id: 'net-dns', category: 'Networking', type: 'DNS', label: 'DNS', color: 'bg-purple-500', iconName: 'Globe',
    description: 'Domain Name System - translates human-readable domain names to IP addresses.',
    beginnerExplanation: 'The phonebook of the internet. It turns a name like "google.com" into the numbers needed to find its server.',
    whyItExists: 'Because humans remember "google.com" but computers need "142.250.190.46".',
    howItWorks: 'Uses a hierarchical system of resolvers and authoritative servers to look up A/AAAA records.',
    advantages: ['Abstracts IP changes', 'Allows geo-routing and basic load balancing'],
    disadvantages: ['Can add latency to initial requests if not cached'],
    commonMistakes: ['Setting TTL too high before a migration', 'Not having redundant DNS providers'],
    relatedComponents: ['Client', 'CDN', 'Load Balancer'],
    useCases: ['Routing users to the nearest CDN', 'Failover routing'],
    interviewTips: 'Mention DNS load balancing (Round Robin) and TTL (Time To Live) trade-offs.'
  },
  {
    id: 'net-cdn', category: 'Networking', type: 'CDN', label: 'CDN', color: 'bg-indigo-500', iconName: 'Network',
    description: 'Content Delivery Network - a geographically distributed group of servers caching static content.',
    beginnerExplanation: 'A network of storage boxes around the world that keep copies of your images and videos close to your users.',
    whyItExists: 'To serve assets (images, videos, JS) closer to users, reducing latency and backend load.',
    howItWorks: 'Caches content at edge locations. If cache misses, pulls from origin server.',
    advantages: ['Massively reduces latency', 'Protects origin from traffic spikes', 'Reduces bandwidth costs'],
    disadvantages: ['Cache invalidation is notoriously hard', 'Stale data issues'],
    commonMistakes: ['Caching user-specific data globally', 'Poor cache invalidation strategies'],
    relatedComponents: ['Client', 'DNS', 'Object Storage'],
    useCases: ['Serving images', 'Video streaming', 'Static websites'],
    interviewTips: 'Always suggest a CDN for read-heavy static content (Netflix, YouTube, Instagram images).'
  },
  {
    id: 'net-api-gateway', category: 'Networking', type: 'API Gateway', label: 'API Gateway', color: 'bg-fuchsia-500', iconName: 'Route',
    description: 'A single entry point for all client requests to the backend architecture.',
    beginnerExplanation: 'The front door of your system. It checks IDs (auth), limits how fast people can enter, and points them to the right room.',
    whyItExists: 'To avoid clients coupling directly to dozens of microservices and handle cross-cutting concerns.',
    howItWorks: 'Receives requests, handles auth/rate-limiting, and routes to the appropriate internal service.',
    advantages: ['Centralized security', 'Rate limiting', 'SSL termination', 'Request routing/stitching'],
    disadvantages: ['Single point of failure (needs HA)', 'Can become a bottleneck'],
    commonMistakes: ['Putting business logic in the gateway', 'Not monitoring gateway latency'],
    relatedComponents: ['Microservice', 'Auth Service', 'Load Balancer'],
    useCases: ['Microservice front-door', 'BFF (Backend for Frontend)'],
    interviewTips: 'Mention using it for rate limiting, auth validation, and throttling.'
  },
  {
    id: 'net-load-balancer', category: 'Networking', type: 'Load Balancer', label: 'Load Balancer', color: 'bg-sky-500', iconName: 'Layers',
    description: 'Distributes incoming network traffic across multiple servers.',
    beginnerExplanation: 'A traffic cop that points new users to the least busy server so no single server gets overwhelmed.',
    whyItExists: 'To ensure no single server is overwhelmed and provide high availability.',
    howItWorks: 'Uses algorithms (Round Robin, Least Connections) to forward traffic to healthy backend instances.',
    advantages: ['Increases capacity', 'Fault tolerance', 'Zero-downtime deployments'],
    disadvantages: ['Adds slight latency', 'Requires complex session management (sticky sessions)'],
    commonMistakes: ['Not configuring health checks', 'Relying too heavily on sticky sessions'],
    relatedComponents: ['App Server', 'API Gateway', 'DNS'],
    useCases: ['Web servers', 'Database replicas'],
    interviewTips: 'Differentiate between L4 (Transport, fast/TCP) and L7 (Application, smart/HTTP) load balancing.'
  },

  // Compute
  {
    id: 'comp-server', category: 'Compute', type: 'Application Server', label: 'App Server', color: 'bg-emerald-500', iconName: 'Server',
    description: 'The core compute instances running business logic.',
    beginnerExplanation: 'The brain of your application that runs your code, does the math, and figures out what to show the user.',
    whyItExists: 'To process data, execute algorithms, and talk to databases.',
    howItWorks: 'Receives requests from load balancers, executes code, reads/writes DB, returns response.',
    advantages: ['Full control over environment', 'Long-running processes'],
    disadvantages: ['Scaling takes time (minutes to boot)'],
    commonMistakes: ['Storing session state on the server (makes scaling hard)', 'Running background jobs on web servers'],
    relatedComponents: ['Load Balancer', 'SQL Database', 'Cache'],
    useCases: ['Monoliths', 'Core microservices'],
    interviewTips: 'Always mention making servers Stateless so they can be horizontally scaled easily.'
  },
  {
    id: 'comp-microservice', category: 'Compute', type: 'Microservice', label: 'Microservice', color: 'bg-teal-500', iconName: 'Box',
    description: 'A small, independent service focusing on a specific business domain.',
    beginnerExplanation: 'Instead of one giant app, it’s a team of small apps working together. One handles payments, another handles users.',
    whyItExists: 'To allow large teams to build, deploy, and scale independently.',
    howItWorks: 'Communicates with other services via HTTP/gRPC or message queues. Has its own database.',
    advantages: ['Independent scaling', 'Independent deployments', 'Tech diversity'],
    disadvantages: ['Network latency', 'Data consistency is very hard (distributed transactions)', 'Operational complexity'],
    commonMistakes: ['Sharing databases between microservices', 'Making them too small (nanoservices) causing network spam'],
    relatedComponents: ['API Gateway', 'Message Queue', 'Auth Service'],
    useCases: ['Large scale enterprise apps', 'E-commerce (Cart vs Payments)'],
    interviewTips: 'Don\'t suggest microservices for a 3-person startup. Acknowledge the complexity of distributed data.'
  },
  {
    id: 'comp-worker', category: 'Compute', type: 'Worker / Job', label: 'Background Worker', color: 'bg-lime-500', iconName: 'Cpu',
    description: 'Asynchronous compute processes that run tasks from a queue.',
    beginnerExplanation: 'A behind-the-scenes worker that does the slow tasks (like sending emails) so the user doesn’t have to wait.',
    whyItExists: 'To keep web requests fast by offloading heavy work to run in the background.',
    howItWorks: 'Pulls messages from a queue (e.g., RabbitMQ, SQS) and processes them at its own pace.',
    advantages: ['Decouples heavy work', 'Smooths out traffic spikes (Queue based load leveling)'],
    disadvantages: ['Eventual consistency', 'Requires queue infrastructure'],
    commonMistakes: ['Not handling failed jobs (no dead-letter queue)', 'Assuming jobs will run instantly'],
    relatedComponents: ['Message Queue', 'App Server', 'SQL Database'],
    useCases: ['Sending emails', 'Video encoding', 'Generating reports'],
    interviewTips: 'If an operation takes >200ms, suggest offloading it to a background worker via a queue.'
  },

  // Databases
  {
    id: 'db-sql', category: 'Databases', type: 'SQL Database', label: 'PostgreSQL / MySQL', color: 'bg-orange-500', iconName: 'Database',
    description: 'Relational Database Management System (RDBMS) ensuring ACID properties.',
    beginnerExplanation: 'A strict, organized filing cabinet where every piece of data has a specific place and connections are enforced.',
    whyItExists: 'To store structured data where relationships and accuracy (transactions) are critical.',
    howItWorks: 'Stores data in tables with rigid schemas. Enforces foreign keys and transactions.',
    advantages: ['ACID compliance', 'Complex JOIN queries', 'Data integrity'],
    disadvantages: ['Hard to horizontally scale (sharding is painful)', 'Rigid schema'],
    commonMistakes: ['Missing indexes on queried columns', 'Over-normalizing leading to massive JOINs'],
    relatedComponents: ['App Server', 'Cache', 'Worker / Job'],
    useCases: ['Financial systems', 'User profiles', 'Inventory'],
    interviewTips: 'Default to SQL unless you have a specific reason not to. Relational data is the norm.'
  },
  {
    id: 'db-nosql-doc', category: 'Databases', type: 'NoSQL Document', label: 'MongoDB', color: 'bg-amber-500', iconName: 'Database',
    description: 'A NoSQL database that stores data in JSON-like documents.',
    beginnerExplanation: 'A flexible folder where you can drop different kinds of documents without forcing them into a strict table format.',
    whyItExists: 'For flexible schemas and fast development iteration.',
    howItWorks: 'Stores documents in collections. Doesn\'t enforce strict schemas.',
    advantages: ['Flexible schema', 'Easy to scale horizontally', 'Fast read/write for unstructured data'],
    disadvantages: ['No strong JOINs', 'Weaker transactional guarantees across documents'],
    commonMistakes: ['Treating it exactly like a relational DB', 'Creating huge unbounded arrays inside documents'],
    relatedComponents: ['App Server', 'Microservice'],
    useCases: ['Content management', 'Catalogs', 'IoT data'],
    interviewTips: 'Good for scenarios where you need fast iterations and don\'t have highly relational data.'
  },
  {
    id: 'db-nosql-wide', category: 'Databases', type: 'NoSQL Wide-Column', label: 'Cassandra / DynamoDB', color: 'bg-red-500', iconName: 'Database',
    description: 'Highly scalable, distributed NoSQL databases built for massive write throughput.',
    beginnerExplanation: 'A super-scale database built to handle millions of writes a second across multiple data centers around the world.',
    whyItExists: 'To handle millions of writes per second across multiple datacenters.',
    howItWorks: 'Distributes data across a ring of nodes using consistent hashing.',
    advantages: ['Massive horizontal scale', 'High availability (masterless)', 'Insane write speed'],
    disadvantages: ['Querying is strictly limited by Partition Key', 'Eventual consistency'],
    commonMistakes: ['Designing tables without understanding the query patterns first', 'Hot partitions'],
    relatedComponents: ['App Server', 'Event Stream', 'Cache'],
    useCases: ['Time-series data', 'Discord messages', 'Netflix viewing history'],
    interviewTips: 'Use this when the scale is absolutely massive (100M+ users) and writes dominate.'
  },
  {
    id: 'db-cache', category: 'Databases', type: 'Cache', label: 'Redis / Memcached', color: 'bg-rose-500', iconName: 'HardDrive',
    description: 'In-memory key-value data store.',
    beginnerExplanation: 'A super-fast temporary memory that stores frequently used data so your database does less work.',
    whyItExists: 'To serve frequently accessed data instantly (sub-millisecond) without hitting the disk-based DB.',
    howItWorks: 'Stores data entirely in RAM. Often used with LRU (Least Recently Used) eviction policies.',
    advantages: ['Lightning fast', 'Supports complex data structures (Redis)'],
    disadvantages: ['Data loss if memory fails (though Redis has persistence)', 'Memory is expensive'],
    commonMistakes: ['Caching everything instead of just hot data', 'Not setting a TTL (Time To Live) causing memory leaks'],
    relatedComponents: ['SQL Database', 'App Server', 'API Gateway'],
    useCases: ['Session storage', 'Leaderboards', 'Rate limiting counters', 'Caching DB queries'],
    interviewTips: 'Always cache heavy read operations. Redis is also the standard answer for Rate Limiting.'
  },

  // Messaging
  {
    id: 'msg-queue', category: 'Messaging', type: 'Message Queue', label: 'RabbitMQ / SQS', color: 'bg-yellow-500', iconName: 'MessageSquare',
    description: 'A traditional message broker for point-to-point communication.',
    beginnerExplanation: 'A waiting line for tasks. When servers are too busy, they put tasks here so background workers can get to them later.',
    whyItExists: 'To decouple services and buffer traffic spikes.',
    howItWorks: 'Producer pushes msg -> Queue buffers it -> Consumer pops it -> Consumer ACKs -> Msg deleted.',
    advantages: ['Simple task distribution', 'Guarantees delivery (at least once)', 'Durable buffers'],
    disadvantages: ['Messages are deleted after consumption (no replay)'],
    commonMistakes: ['Forgetting to acknowledge messages', 'Using queues for real-time request-response'],
    relatedComponents: ['Worker / Job', 'App Server', 'Microservice'],
    useCases: ['Asynchronous task processing (email sending, image processing)'],
    interviewTips: 'Use queues to protect slow workers from massive traffic spikes (load leveling).'
  },
  {
    id: 'msg-stream', category: 'Messaging', type: 'Event Stream', label: 'Kafka / Kinesis', color: 'bg-zinc-700', iconName: 'Layers',
    description: 'A distributed append-only log for high-throughput event streaming.',
    beginnerExplanation: 'A massive conveyor belt of events. Multiple services can watch the belt and react to the same events at their own pace.',
    whyItExists: 'When multiple different services need to react to the exact same stream of events, or you need massive throughput.',
    howItWorks: 'Events are appended to a log. Consumers track their own offset and read the log. Messages are NOT deleted.',
    advantages: ['Massive throughput', 'Event replay capability', 'Multiple consumer groups'],
    disadvantages: ['Complex to set up and manage', 'Overkill for simple queues'],
    commonMistakes: ['Using Kafka for simple request-response communication', 'Ignoring partition design', 'Poor consumer management'],
    relatedComponents: ['Message Queue', 'Worker / Job', 'Microservice', 'Search Engine'],
    useCases: ['Activity tracking', 'Log aggregation', 'Event Sourcing'],
    interviewTips: 'Kafka is for Events (things that happened). RabbitMQ is for Commands (things to do).'
  },
  {
    id: 'msg-kafka-broker',
    category: 'Messaging',
    type: 'Kafka Broker',
    label: 'Kafka Broker',
    color: 'bg-zinc-800',
    iconName: 'Server',
    description: 'A single server in a Kafka cluster that stores data and serves clients.',
    beginnerExplanation: 'A storage unit for messages.',
    whyItExists: 'To provide a distributed and fault-tolerant storage layer for streams.',
    howItWorks: 'Handles all requests from clients (produce, fetch, and metadata) and keeps data replicated across the cluster.',
    advantages: ['High throughput', 'Fault tolerance', 'Scalability'],
    disadvantages: ['Requires careful JVM tuning', 'Complex to manage'],
    commonMistakes: ['Not monitoring disk I/O', 'Poor broker configuration'],
    relatedComponents: ['Kafka Topic', 'Partition'],
    useCases: ['Distributed data storage', 'Stream processing'],
    interviewTips: 'Discuss the role of the Controller broker and how failure is handled.'
  },
  {
    id: 'msg-kafka-topic',
    category: 'Messaging',
    type: 'Kafka Topic',
    label: 'Kafka Topic',
    color: 'bg-zinc-700',
    iconName: 'Layers',
    description: 'A logical category to which messages are published.',
    beginnerExplanation: 'A folder for specific types of messages.',
    whyItExists: 'To categorize messages for different types of subscribers.',
    howItWorks: 'A multi-subscriber, distributed log. Topics are partitioned for scalability.',
    advantages: ['Decoupling', 'Multi-subscriber support'],
    disadvantages: ['Too many topics can overwhelm cluster metadata'],
    commonMistakes: ['Inconsistent naming conventions', 'Too many partitions per topic'],
    relatedComponents: ['Kafka Broker', 'Partition'],
    useCases: ['Categorized data streams', 'Event logs'],
    interviewTips: 'Explain log compaction and how to choose partition counts.'
  },
  {
    id: 'msg-kafka-partition',
    category: 'Messaging',
    type: 'Partition',
    label: 'Partition',
    color: 'bg-zinc-600',
    iconName: 'StretchHorizontal',
    description: 'An ordered, immutable sequence of records in a topic.',
    beginnerExplanation: 'A slice of a topic for faster processing.',
    whyItExists: 'The unit of parallelism and scalability in Kafka.',
    howItWorks: 'Each partition can be hosted on a different broker, allowing multiple consumers to read in parallel.',
    advantages: ['Parallelism', 'Ordering guarantee within partition'],
    disadvantages: ['Increases end-to-end latency if count is too high'],
    commonMistakes: ['Uneven data distribution (skewed keys)'],
    relatedComponents: ['Kafka Topic', 'Consumer Group'],
    useCases: ['Scalable data processing', 'Ordered event delivery'],
    interviewTips: 'Explain how message ordering is guaranteed (only within a partition).'
  },
  {
    id: 'pattern-outbox',
    category: 'Messaging',
    type: 'Transactional Outbox',
    label: 'Transactional Outbox',
    color: 'bg-indigo-600',
    iconName: 'Archive',
    description: 'Reliably publishes events when a database update occurs.',
    beginnerExplanation: 'Ensures a database change and a message send happen together.',
    whyItExists: 'To solve the "Dual Write" problem where DB succeeds but message send fails.',
    howItWorks: 'Writes events to an "Outbox" table in the same transaction as business data. A relay process polls and sends to Kafka.',
    advantages: ['Atomicity', 'Reliability'],
    disadvantages: ['Adds latency', 'Requires relay service'],
    commonMistakes: ['Not making the message send idempotent'],
    relatedComponents: ['SQL Database', 'Kafka Broker'],
    useCases: ['Microservices data sync', 'Event-driven systems'],
    interviewTips: 'Discuss Polling vs CDC for the relay service.'
  },
  {
    id: 'pattern-cdc',
    category: 'Messaging',
    type: 'CDC (Debezium)',
    label: 'CDC (Debezium)',
    color: 'bg-cyan-600',
    iconName: 'RefreshCw',
    description: 'Change Data Capture to stream database changes as events.',
    beginnerExplanation: 'Turns database updates into a stream of events automatically.',
    whyItExists: 'Low-impact way to capture every change in a database.',
    howItWorks: 'Reads database transaction logs (Binlog) and produces events to Kafka.',
    advantages: ['Low latency', 'Non-intrusive'],
    disadvantages: ['Tightly couples events to DB schema'],
    commonMistakes: ['Not handling schema migrations'],
    relatedComponents: ['SQL Database', 'Kafka Broker'],
    useCases: ['Data replication', 'Real-time analytics'],
    interviewTips: 'Explain the advantages of CDC over application-level events.'
  },
  {
    id: 'reliability-dlq',
    category: 'Messaging',
    type: 'Dead Letter Queue',
    label: 'Dead Letter Queue (DLQ)',
    color: 'bg-red-600',
    iconName: 'Skull',
    description: 'Stores messages that could not be processed successfully.',
    beginnerExplanation: 'A "junk mail" folder for broken messages.',
    whyItExists: 'To isolate problematic messages so they don\'t block the main pipeline.',
    howItWorks: 'Messages that fail after retries are moved here for manual inspection.',
    advantages: ['Prevents pipeline blocking', 'Audit trail of failures'],
    disadvantages: ['Requires manual monitoring/intervention'],
    commonMistakes: ['Forgetting to monitor the DLQ'],
    relatedComponents: ['Message Queue', 'Retry Queue'],
    useCases: ['Handling poison pills', 'Bug isolation'],
    interviewTips: 'Discuss how to automate replay from a DLQ.'
  },
  {
    id: 'reliability-retry',
    category: 'Messaging',
    type: 'Retry Queue',
    label: 'Retry Queue',
    color: 'bg-amber-600',
    iconName: 'RotateCcw',
    description: 'A queue for messages that failed due to transient issues.',
    beginnerExplanation: 'A place to wait before trying again.',
    whyItExists: 'To implement exponential backoff and handle temporary failures.',
    howItWorks: 'Moves messages through multiple delay queues before eventually going to DLQ.',
    advantages: ['Handles transient errors', 'Prevents retry storms'],
    disadvantages: ['Can lead to out-of-order processing'],
    commonMistakes: ['Retrying forever', 'No backoff policy'],
    relatedComponents: ['Message Queue', 'Dead Letter Queue'],
    useCases: ['Network timeouts', 'Service unavailability'],
    interviewTips: 'Explain how to implement exponential backoff with Kafka.'
  },
  {
    id: 'pattern-idempotency',
    category: 'Messaging',
    type: 'Idempotency Store',
    label: 'Idempotency Store',
    color: 'bg-teal-600',
    iconName: 'Fingerprint',
    description: 'Ensures that a message is only processed once.',
    beginnerExplanation: 'A filter that ignores duplicate messages.',
    whyItExists: 'To achieve "Exactly-Once" processing in distributed systems.',
    howItWorks: 'Tracks processed Message IDs in a fast store (like Redis) and checks before processing.',
    advantages: ['Data integrity', 'Reliability'],
    disadvantages: ['Adds network hop', 'Extra storage cost'],
    commonMistakes: ['Using a slow store', 'Short expiration on IDs'],
    relatedComponents: ['Redis / Memcached', 'Consumer'],
    useCases: ['Payment processing', 'Order creation'],
    interviewTips: 'Crucial for financial systems and "Exactly-Once" semantics.'
  },
  {
    id: 'stream-processor',
    category: 'Compute',
    type: 'Stream Processor',
    label: 'Kafka Streams / Flink',
    color: 'bg-purple-600',
    iconName: 'Wind',
    description: 'Real-time processing and transformation of data streams.',
    beginnerExplanation: 'A worker that changes or aggregates data as it flows.',
    whyItExists: 'To perform complex transformations and aggregations on infinite streams.',
    howItWorks: 'Provides stateful operations like Joins, Aggregations, and Windowing on stream data.',
    advantages: ['Real-time insights', 'High scalability'],
    disadvantages: ['State management complexity'],
    commonMistakes: ['Poor state cleanup', 'Not handling late-arriving data'],
    relatedComponents: ['Kafka Topic', 'Worker / Job'],
    useCases: ['Real-time analytics', 'Fraud detection'],
    interviewTips: 'Explain the difference between stateless and stateful stream processing.'
  },
  {
    id: 'msg-rabbitmq-exchange',
    category: 'Messaging',
    type: 'RabbitMQ Exchange',
    label: 'Exchange (Fanout/Topic)',
    color: 'bg-orange-600',
    iconName: 'Network',
    description: 'Routing engine for RabbitMQ that decides which queues receive a message.',
    beginnerExplanation: 'The mail sorter that looks at the address and puts the mail in the right boxes.',
    whyItExists: 'To provide flexible routing logic (broadcast, selective, or direct) before messages reach queues.',
    howItWorks: 'Accepts messages from producers and routes them to queues based on bindings and routing keys.',
    advantages: ['Flexible routing', 'Decouples publishers from queues'],
    disadvantages: ['Adds routing overhead'],
    commonMistakes: ['Misconfiguring routing keys', 'Using the wrong exchange type'],
    relatedComponents: ['Message Queue'],
    useCases: ['Broadcasting updates', 'Selective notification routing'],
    interviewTips: 'Explain the difference between Fanout, Direct, and Topic exchanges.'
  },
  {
    id: 'msg-kafka-connect',
    category: 'Messaging',
    type: 'Kafka Connect',
    label: 'Kafka Connect',
    color: 'bg-zinc-500',
    iconName: 'Wifi',
    description: 'A tool for scalably and reliably streaming data between Kafka and other systems.',
    beginnerExplanation: 'A set of pre-built connectors that plug Kafka into databases and other apps.',
    whyItExists: 'To avoid writing custom glue code for every data source and sink.',
    howItWorks: 'Runs as a separate cluster of workers that execute Source and Sink connectors.',
    advantages: ['Reusable connectors', 'Fault tolerant', 'Scalable'],
    disadvantages: ['Another cluster to manage'],
    commonMistakes: ['Running it on the same nodes as brokers'],
    relatedComponents: ['Kafka Broker', 'CDC (Debezium)'],
    useCases: ['Streaming DB changes to Kafka', 'Streaming Kafka data to S3'],
    interviewTips: 'Discuss the difference between a Source connector and a Sink connector.'
  },
  {
    id: 'msg-kafka-consumer-group',
    category: 'Messaging',
    type: 'Consumer Group',
    label: 'Consumer Group',
    color: 'bg-zinc-400',
    iconName: 'Layers',
    description: 'A group of consumers that work together to consume data from a topic.',
    beginnerExplanation: 'A team of workers sharing the workload of a single topic.',
    whyItExists: 'To allow horizontal scaling of message consumption.',
    howItWorks: 'Kafka ensures that each partition in a topic is consumed by only one member of the group.',
    advantages: ['Scalability', 'Fault tolerance (rebalancing)'],
    disadvantages: ['Rebalancing can cause temporary pauses'],
    commonMistakes: ['Having more consumers than partitions'],
    relatedComponents: ['Partition', 'Kafka Topic'],
    useCases: ['High-throughput message processing'],
    interviewTips: 'What happens during a consumer group rebalance?'
  },
  {
    id: 'msg-kafka-cluster', category: 'Messaging', type: 'Kafka Cluster', label: 'Kafka Cluster', color: 'bg-zinc-900', iconName: 'Layers',
    description: 'A collection of Kafka brokers working together.',
    beginnerExplanation: 'A team of Kafka servers that store your data safely across multiple locations.',
    whyItExists: 'For high availability and massive scalability.',
    howItWorks: 'Distributes topics and partitions across multiple brokers.',
    advantages: ['Fault tolerance', 'Scalability'],
    disadvantages: ['Complex operational overhead'],
    commonMistakes: ['Sizing all brokers on one physical rack'],
    relatedComponents: ['Kafka Broker', 'KRaft Controller'],
    useCases: ['Enterprise event streaming'],
    interviewTips: 'Discuss the importance of rack awareness.'
  },
  {
    id: 'msg-kafka-lag', category: 'Monitoring', type: 'Consumer Lag', label: 'Consumer Lag', color: 'bg-red-500', iconName: 'Activity',
    description: 'The gap between the latest produced message and the last consumed message.',
    beginnerExplanation: 'How far behind your workers are from the newest data.',
    whyItExists: 'Critical metric for monitoring system health and throughput.',
    howItWorks: 'Calculated as `Latest Offset - Current Consumer Offset`.',
    advantages: ['Detects bottlenecks early'],
    disadvantages: [],
    commonMistakes: ['Ignoring lag until it crashes the system'],
    relatedComponents: ['Consumer Group', 'Partition'],
    useCases: ['Monitoring real-time pipelines'],
    interviewTips: 'If lag is increasing, do you add more consumers or more partitions?'
  },
  {
    id: 'msg-kafka-schema-registry', category: 'Messaging', type: 'Schema Registry', label: 'Schema Registry', color: 'bg-blue-600', iconName: 'FileText',
    description: 'A centralized service for managing and enforcing schemas for Kafka records.',
    beginnerExplanation: 'A contract manager that ensures producers and consumers speak the same language (e.g., Avro/JSON Schema).',
    whyItExists: 'To prevent "Poison Pills" and breaking changes in data formats.',
    howItWorks: 'Producers check schema ID before sending. Consumers fetch schema by ID to deserialize.',
    advantages: ['Schema evolution support', 'Reduced payload size (binary)'],
    disadvantages: ['Additional infrastructure dependency'],
    commonMistakes: ['Breaking backward compatibility accidentally'],
    relatedComponents: ['Kafka Broker', 'Kafka Producer'],
    useCases: ['Enterprise data governance'],
    interviewTips: 'Explain backward vs forward vs full compatibility.'
  },
  {
    id: 'msg-ksqldb', category: 'Messaging', type: 'ksqlDB', label: 'ksqlDB', color: 'bg-indigo-500', iconName: 'Search',
    description: 'A streaming SQL engine for Apache Kafka.',
    beginnerExplanation: 'Allows you to write SQL queries to process Kafka streams in real-time.',
    whyItExists: 'To make stream processing accessible to those who know SQL.',
    howItWorks: 'Translates SQL queries into Kafka Streams applications.',
    advantages: ['Rapid development', 'Declarative syntax'],
    disadvantages: ['Not as flexible as Java/Scala API'],
    commonMistakes: ['Trying to use it like a traditional request-response DB'],
    relatedComponents: ['Kafka Topic', 'Stream Processor'],
    useCases: ['Real-time dashboards', 'Fraud detection'],
    interviewTips: 'Compare ksqlDB with Kafka Streams API.'
  },

  // Storage
  {
    id: 'store-object', category: 'Storage', type: 'Object Storage', label: 'S3 / GCS', color: 'bg-cyan-500', iconName: 'Cloud',
    description: 'Massively scalable storage for unstructured data (files).',
    beginnerExplanation: 'An infinite hard drive in the cloud where you store files like images, videos, and backups.',
    whyItExists: 'Because storing files in a database is extremely inefficient and expensive.',
    howItWorks: 'Stores files as objects in flat buckets, accessed via HTTP APIs.',
    advantages: ['Infinitely scalable', 'Very cheap', 'Durable (99.999999999%)'],
    disadvantages: ['High latency (not for OS booting)', 'No file locking or hierarchical updates'],
    commonMistakes: ['Storing millions of tiny files instead of batching', 'Making buckets public by accident'],
    relatedComponents: ['CDN', 'App Server', 'Client'],
    useCases: ['User uploads (avatars, videos)', 'Backups', 'Static website hosting'],
    interviewTips: 'Any time a user uploads a file, it goes to Object Storage, and you save the URL in the DB.'
  },

  // Search
  {
    id: 'search-engine', category: 'Search', type: 'Search Engine', label: 'Elasticsearch', color: 'bg-lime-600', iconName: 'Search',
    description: 'A distributed, RESTful search and analytics engine based on Lucene.',
    beginnerExplanation: 'Like the index at the back of a textbook. It lets you find specific words across millions of documents instantly.',
    whyItExists: 'Standard SQL databases suck at full-text search and fuzzy matching.',
    howItWorks: 'Uses an Inverted Index (like a book glossary) to find words across millions of documents instantly.',
    advantages: ['Fuzzy text search', 'Complex aggregations', 'Fast read times'],
    disadvantages: ['Memory hungry', 'Needs synchronization with the primary database'],
    commonMistakes: ['Using it as a primary database', 'Not properly planning index mapping'],
    relatedComponents: ['SQL Database', 'Event Stream', 'Worker / Job'],
    useCases: ['E-commerce product search', 'Log analysis (ELK stack)'],
    interviewTips: 'Don\'t use `LIKE %query%` in SQL for big datasets. Suggest Elasticsearch and describe how data syncs (CDC).'
  },

  // Security
  {
    id: 'sec-auth', category: 'Security', type: 'Auth Service', label: 'Auth / OAuth', color: 'bg-slate-700', iconName: 'Shield',
    description: 'Centralized identity and access management.',
    beginnerExplanation: 'The bouncer of your app. It makes sure people are who they say they are, and controls what they are allowed to see.',
    whyItExists: 'To avoid implementing password hashing and session logic in every microservice.',
    howItWorks: 'Validates credentials and issues JWTs (JSON Web Tokens) or session cookies.',
    advantages: ['Centralized security', 'SSO capabilities', 'Delegated auth (OAuth)'],
    disadvantages: ['Critical path dependency (if it dies, nobody logs in)'],
    commonMistakes: ['Building your own crypto/auth instead of using a standard service', 'Storing plain text passwords'],
    relatedComponents: ['API Gateway', 'Client', 'App Server'],
    useCases: ['User login', 'API token issuance'],
    interviewTips: 'Discuss JWTs for stateless auth in microservices.'
  }
];
