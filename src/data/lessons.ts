import { Node, Edge } from 'reactflow';

export interface Scene {
  id: string;
  title: string;
  explanation: string;
  nodes: Node[];
  edges: Edge[];
  playground?: 'sharding' | 'cache' | 'kafka' | 'chaos';
  quiz?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  scenes: Scene[];
}

import { advancedLessons } from './advanced-lessons';

const basicLessons: Lesson[] = [
  {
    id: "system-design-basics",
    title: "System Design Foundations",
    description: "What exactly is System Design? Learn about requirements, scalability, and the core pillars of distributed systems.",
    level: 1,
    scenes: [
      {
        id: "sdb-s1",
        title: "Functional vs Non-Functional",
        explanation: "Before drawing nodes, you must define WHAT the system does (Functional: 'User can post a photo') and HOW it behaves (Non-Functional: 'Upload must be under 2s'). Non-functional requirements (NFRs) like Scalability, Availability, and Latency define the architecture.",
        nodes: [
          { id: "reqs", position: { x: 350, y: 150 }, data: { label: "Requirements", iconName: "FileText", color: "bg-blue-600" }, type: "custom" },
          { id: "func", position: { x: 150, y: 50 }, data: { label: "Functional: 'Send Msg'", iconName: "MessageSquare", color: "bg-emerald-500" }, type: "custom" },
          { id: "nfunc", position: { x: 550, y: 50 }, data: { label: "NFR: '99.9% Available'", iconName: "Shield", color: "bg-indigo-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "reqs", target: "func", animated: true },
          { id: "e2", source: "reqs", target: "nfunc", animated: true }
        ]
      },
      {
        id: "sdb-s2",
        title: "Scalability: Vert vs Horiz",
        explanation: "Vertical Scaling means buying a bigger server (more CPU/RAM). It has a hard ceiling and is a Single Point of Failure. Horizontal Scaling means adding more servers. It's infinitely scalable but introduces networking complexity.",
        nodes: [
          { id: "vert", position: { x: 150, y: 150 }, data: { label: "Vertical (Big Box)", iconName: "Server", color: "bg-amber-600", cpu: 100 }, type: "custom" },
          { id: "horiz", position: { x: 550, y: 150 }, data: { label: "Horizontal (Many Boxes)", iconName: "Layers", color: "bg-emerald-600" }, type: "custom" }
        ],
        edges: []
      }
    ]
  },
  {
    id: "load-balancing",
    title: "Load Balancing & Scaling",
    description: "Learn why servers crash under load and how load balancers fix the problem by distributing traffic.",
    level: 1,
    scenes: [
      {
        id: "lb-s1",
        title: "The Single Node",
        explanation: "This is a basic architecture. One client is making requests to our application server, which fetches data from the database. Everything is fast and green because traffic is low.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "User", iconName: "Client/User", color: "bg-blue-500", cpu: 5, mem: 10 }, type: "custom" },
          { id: "server", position: { x: 350, y: 150 }, data: { label: "App Server", iconName: "Server", color: "bg-emerald-500", cpu: 15, mem: 20 }, type: "custom" },
          { id: "db", position: { x: 650, y: 150 }, data: { label: "Database", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 10, mem: 15 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "server", animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
          { id: "e2", source: "server", target: "db", animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
        ]
      },
      {
        id: "lb-s2",
        title: "The Traffic Spike",
        explanation: "Oh no! A massive marketing campaign just launched. Thousands of users are hitting the server at once. The CPU is maxed out at 100%, requests are queueing up, and users are experiencing huge delays or crashes. This is a Single Point of Failure (SPOF).",
        nodes: [
          { id: "client1", position: { x: 50, y: 50 }, data: { label: "Users (Web)", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "client2", position: { x: 50, y: 150 }, data: { label: "Users (Mobile)", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "client3", position: { x: 50, y: 250 }, data: { label: "Users (API)", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "server", position: { x: 350, y: 150 }, data: { label: "App Server", iconName: "Server", color: "bg-red-500", cpu: 100, mem: 95 }, type: "custom" },
          { id: "db", position: { x: 650, y: 150 }, data: { label: "Database", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 80, mem: 60 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client1", target: "server", animated: true, style: { stroke: '#ef4444', strokeWidth: 3 } },
          { id: "e2", source: "client2", target: "server", animated: true, style: { stroke: '#ef4444', strokeWidth: 3 } },
          { id: "e3", source: "client3", target: "server", animated: true, style: { stroke: '#ef4444', strokeWidth: 3 } },
          { id: "e4", source: "server", target: "db", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }
        ]
      },
      {
        id: "lb-s3",
        title: "Horizontal Scaling & Load Balancing",
        explanation: "To fix this, we scale *horizontally* (adding more servers) and introduce a **Load Balancer**. The load balancer sits in front of the servers and distributes incoming traffic evenly across them. Now, no single server is overwhelmed, and if one dies, the others can take over!",
        nodes: [
          { id: "clients", position: { x: 50, y: 150 }, data: { label: "All Users", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "lb", position: { x: 250, y: 150 }, data: { label: "Load Balancer", iconName: "Load Balancer", color: "bg-purple-500", cpu: 20 }, type: "custom" },
          { id: "server1", position: { x: 450, y: 50 }, data: { label: "Server A", iconName: "Server", color: "bg-emerald-500", cpu: 45, mem: 40 }, type: "custom" },
          { id: "server2", position: { x: 450, y: 150 }, data: { label: "Server B", iconName: "Server", color: "bg-emerald-500", cpu: 40, mem: 42 }, type: "custom" },
          { id: "server3", position: { x: 450, y: 250 }, data: { label: "Server C", iconName: "Server", color: "bg-emerald-500", cpu: 35, mem: 38 }, type: "custom" },
          { id: "db", position: { x: 700, y: 150 }, data: { label: "Database", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 85, mem: 60 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "clients", target: "lb", animated: true, style: { stroke: '#a855f7', strokeWidth: 3 } },
          { id: "e2", source: "lb", target: "server1", animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
          { id: "e3", source: "lb", target: "server2", animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
          { id: "e4", source: "lb", target: "server3", animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
          { id: "e5", source: "server1", target: "db", animated: true, style: { stroke: '#f59e0b', strokeWidth: 1 } },
          { id: "e6", source: "server2", target: "db", animated: true, style: { stroke: '#f59e0b', strokeWidth: 1 } },
          { id: "e7", source: "server3", target: "db", animated: true, style: { stroke: '#f59e0b', strokeWidth: 1 } }
        ],
        quiz: {
          question: "What happens if Server B crashes in this architecture?",
          options: [
            "The entire system goes down.",
            "The load balancer stops sending traffic entirely.",
            "The load balancer detects the failure and routes traffic only to Server A and Server C.",
            "The database crashes."
          ],
          answerIndex: 2,
          explanation: "Load balancers constantly perform **health checks** on servers. If a server fails, the load balancer removes it from the rotation and routes traffic to the remaining healthy servers."
        }
      }
    ]
  },
  {
    id: "caching",
    level: 1,
    title: "Caching (Redis)",
    description: "Databases are slow when under heavy read load. Learn how caching dramatically improves read latency and protects your database.",
    scenes: [
      {
        id: "cache-s1",
        title: "The Database Bottleneck",
        explanation: "Our application is a news site. Millions of users are reading the exact same front-page article. The servers ask the database for this article every single time. The database has to perform a slow disk read for every request, maxing out its CPU.",
        nodes: [
          { id: "lb", position: { x: 50, y: 150 }, data: { label: "Load Balancer", iconName: "Load Balancer", color: "bg-purple-500", cpu: 30 }, type: "custom" },
          { id: "server1", position: { x: 250, y: 80 }, data: { label: "Server A", iconName: "Server", color: "bg-emerald-500", cpu: 60 }, type: "custom" },
          { id: "server2", position: { x: 250, y: 220 }, data: { label: "Server B", iconName: "Server", color: "bg-emerald-500", cpu: 60 }, type: "custom" },
          { id: "db", position: { x: 550, y: 150 }, data: { label: "Database", iconName: "Database (SQL)", color: "bg-red-500", cpu: 100, mem: 90 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "lb", target: "server1", animated: true },
          { id: "e2", source: "lb", target: "server2", animated: true },
          { id: "e3", source: "server1", target: "db", animated: true, style: { stroke: '#ef4444', strokeWidth: 3 } },
          { id: "e4", source: "server2", target: "db", animated: true, style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "cache-s2",
        title: "Introducing the Cache",
        explanation: "We add a Cache (like Redis or Memcached) between the servers and the database. A cache stores data in RAM (memory), which is orders of magnitude faster than a database's disk. Now, the database load drops significantly.",
        nodes: [
          { id: "lb", position: { x: 50, y: 150 }, data: { label: "Load Balancer", iconName: "Load Balancer", color: "bg-purple-500", cpu: 30 }, type: "custom" },
          { id: "server1", position: { x: 250, y: 80 }, data: { label: "Server A", iconName: "Server", color: "bg-emerald-500", cpu: 40 }, type: "custom" },
          { id: "server2", position: { x: 250, y: 220 }, data: { label: "Server B", iconName: "Server", color: "bg-emerald-500", cpu: 40 }, type: "custom" },
          { id: "cache", position: { x: 500, y: 150 }, data: { label: "Redis Cache", iconName: "Cache (Redis)", color: "bg-red-500", cpu: 20 }, type: "custom" },
          { id: "db", position: { x: 750, y: 150 }, data: { label: "Database", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 15, mem: 40 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "lb", target: "server1", animated: true },
          { id: "e2", source: "lb", target: "server2", animated: true },
          { id: "e3", source: "server1", target: "cache", animated: true, style: { stroke: '#f43f5e', strokeWidth: 3 } },
          { id: "e4", source: "server2", target: "cache", animated: true, style: { stroke: '#f43f5e', strokeWidth: 3 } },
          { id: "e5", source: "cache", target: "db", animated: false, style: { stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '5,5' } }
        ]
      },
      {
        id: "cache-s3",
        title: "Cache Miss vs. Cache Hit",
        playground: 'cache',
        explanation: "1. **Cache Miss**: The server asks the cache for data. The cache doesn't have it. The server then asks the database, gets the data, and writes it back to the cache.\n2. **Cache Hit**: The next time a server asks for that data, the cache returns it instantly from RAM. The database doesn't even know a request happened!",
        nodes: [
          { id: "server", position: { x: 100, y: 150 }, data: { label: "App Server", iconName: "Server", color: "bg-emerald-500", cpu: 30 }, type: "custom" },
          { id: "cache", position: { x: 400, y: 50 }, data: { label: "Redis Cache", iconName: "Cache (Redis)", color: "bg-red-500", cpu: 10 }, type: "custom" },
          { id: "db", position: { x: 400, y: 250 }, data: { label: "Database", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 5 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "server", target: "cache", label: "1. Check Cache", animated: true },
          { id: "e2", source: "server", target: "db", label: "2. Fetch (Miss)", animated: true },
          { id: "e3", source: "db", target: "cache", label: "3. Write to Cache", animated: true }
        ],
        quiz: {
          question: "Why don't we just use a Cache as our main database for everything?",
          options: [
            "Caches are too slow.",
            "Caches store data in RAM, which is expensive and volatile (lost on reboot). Databases use durable disk storage.",
            "Caches cannot be accessed by multiple servers.",
            "Caches do not support strings or numbers."
          ],
          answerIndex: 1,
          explanation: "RAM is extremely fast but very expensive per GB compared to SSD/HDDs. Additionally, RAM is volatile—if the Redis server loses power, the cached data is lost. We use databases for durable, long-term truth and caches for fast, temporary access."
        }
      }
    ]
  },
  {
    id: "message-queues",
    level: 2,
    title: "Message Queues & Async Processing",
    description: "Learn how to decouple heavy tasks and make your application feel instantaneous to the user using Kafka or RabbitMQ.",
    scenes: [
      {
        id: "mq-s1",
        title: "The Synchronous Problem",
        explanation: "A user uploads a high-resolution video. The server receives it, and immediately begins compressing and transcoding it to different formats. This takes 2 minutes. The user is stuck staring at a loading spinner for 2 minutes because the request is blocked.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "server", position: { x: 350, y: 150 }, data: { label: "API Server", iconName: "Server", color: "bg-red-500", cpu: 100 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "server", animated: true, label: "Wait 2 minutes...", style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "mq-s2",
        title: "Asynchronous Processing with a Queue",
        explanation: "We introduce a **Message Queue** (like Kafka or RabbitMQ) and separate **Worker Nodes**. Now, the API server just drops a 'process_video' message into the queue and immediately tells the user 'Video Uploaded!'. The workers pull messages from the queue and do the heavy lifting in the background.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "server", position: { x: 300, y: 150 }, data: { label: "API Server", iconName: "Server", color: "bg-emerald-500", cpu: 15 }, type: "custom" },
          { id: "queue", position: { x: 550, y: 150 }, data: { label: "Message Queue", iconName: "Message Queue", color: "bg-pink-500", cpu: 5 }, type: "custom" },
          { id: "worker1", position: { x: 800, y: 80 }, data: { label: "Worker (Video)", iconName: "Worker", color: "bg-indigo-500", cpu: 95 }, type: "custom" },
          { id: "worker2", position: { x: 800, y: 220 }, data: { label: "Worker (Video)", iconName: "Worker", color: "bg-indigo-500", cpu: 90 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "server", label: "Instant Response", animated: true, style: { stroke: '#10b981' } },
          { id: "e2", source: "server", target: "queue", label: "Publish Event", animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
          { id: "e3", source: "queue", target: "worker1", label: "Consume", animated: true, style: { stroke: '#6366f1' } },
          { id: "e4", source: "queue", target: "worker2", label: "Consume", animated: true, style: { stroke: '#6366f1' } }
        ],
        quiz: {
          question: "What happens if a Worker crashes while processing a video?",
          options: [
            "The video is lost forever.",
            "The queue detects the worker failed to acknowledge completion, and re-assigns the message to another healthy worker.",
            "The API server crashes.",
            "The user gets an error on their screen immediately."
          ],
          answerIndex: 1,
          explanation: "Queues provide reliability. A worker must send an ACKnowledgement when a job is done. If a worker crashes before ACKing, the message remains in the queue and is picked up by another worker."
        }
      }
    ]
  },
  {
    id: "database-sharding",
    level: 2,
    title: "Database Sharding",
    description: "When a database gets too big for one machine, learn how to split the data across multiple shards.",
    scenes: [
      {
        id: "shard-s1",
        title: "The Massive Database",
        explanation: "Our application is a global social network. A single database is holding terabytes of user data. Queries take forever to scan the massive tables, and the disk is running out of space.",
        nodes: [
          { id: "api", position: { x: 50, y: 150 }, data: { label: "API Servers", iconName: "Server", color: "bg-emerald-500", cpu: 30 }, type: "custom" },
          { id: "db", position: { x: 350, y: 150 }, data: { label: "Master DB (10 TB)", iconName: "Database (SQL)", color: "bg-red-500", cpu: 98, mem: 95 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "api", target: "db", animated: true, style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "shard-s2",
        title: "Horizontal Partitioning (Sharding)",
        playground: 'sharding',
        explanation: "We implement Sharding based on User ID. Users A-M go to Shard 1, and Users N-Z go to Shard 2. The data size per node is cut in half, and queries are fast again because each database is smaller and handles less traffic.",
        nodes: [
          { id: "api", position: { x: 50, y: 150 }, data: { label: "API Servers", iconName: "Server", color: "bg-emerald-500", cpu: 30 }, type: "custom" },
          { id: "router", position: { x: 300, y: 150 }, data: { label: "Query Router", iconName: "API Gateway", color: "bg-purple-500", cpu: 15 }, type: "custom" },
          { id: "shard1", position: { x: 550, y: 50 }, data: { label: "Shard 1 (A-M)", iconName: "Shard", color: "bg-amber-500", cpu: 45, mem: 50 }, type: "custom" },
          { id: "shard2", position: { x: 550, y: 250 }, data: { label: "Shard 2 (N-Z)", iconName: "Shard", color: "bg-amber-500", cpu: 45, mem: 50 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "api", target: "router", animated: true },
          { id: "e2", source: "router", target: "shard1", label: "Hash(ID) % 2 == 0", animated: true, style: { stroke: '#f59e0b' } },
          { id: "e3", source: "router", target: "shard2", label: "Hash(ID) % 2 == 1", animated: true, style: { stroke: '#f59e0b' } }
        ],
        quiz: {
          question: "What is a major challenge introduced by Database Sharding?",
          options: [
            "Data becomes less secure.",
            "Joining data across different shards becomes extremely difficult.",
            "Shards can only handle read queries, not writes.",
            "You cannot backup a sharded database."
          ],
          answerIndex: 1,
          explanation: "Because data is physically split across different servers, you can no longer write a simple SQL `JOIN` between a user in Shard 1 and a user in Shard 2. You must handle joins in the application logic, which adds significant complexity."
        }
      }
    ]
  },
  {
    id: "cdn-edge",
    level: 2,
    title: "Content Delivery Networks (CDN)",
    description: "Learn how to deliver large assets (like images and videos) instantly to users around the globe.",
    scenes: [
      {
        id: "cdn-s1",
        title: "The Global Distance Problem",
        explanation: "Our main server is located in New York. A user in Tokyo tries to download a 5MB image. The request has to travel across the Pacific Ocean, fetch the image, and travel all the way back. Physics (speed of light over fiber) makes this inherently slow.",
        nodes: [
          { id: "tokyo", position: { x: 50, y: 150 }, data: { label: "User (Tokyo)", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "ny", position: { x: 550, y: 150 }, data: { label: "Server (New York)", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "tokyo", target: "ny", animated: true, label: "200ms latency", style: { stroke: '#ef4444', strokeWidth: 2 } }
        ]
      },
      {
        id: "cdn-s2",
        title: "Edge Caching",
        explanation: "We introduce a CDN (Content Delivery Network). The CDN has 'Edge Servers' in hundreds of cities worldwide. When the Tokyo user requests the image, they hit the Tokyo Edge Server. Since the edge server already cached the image, it returns it instantly without ever crossing the ocean.",
        nodes: [
          { id: "tokyo", position: { x: 50, y: 50 }, data: { label: "User (Tokyo)", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "london", position: { x: 50, y: 250 }, data: { label: "User (London)", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "edge-tokyo", position: { x: 300, y: 50 }, data: { label: "CDN Edge (Tokyo)", iconName: "CDN", color: "bg-purple-500" }, type: "custom" },
          { id: "edge-london", position: { x: 300, y: 250 }, data: { label: "CDN Edge (London)", iconName: "CDN", color: "bg-purple-500" }, type: "custom" },
          { id: "ny", position: { x: 600, y: 150 }, data: { label: "Origin Server (NY)", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "tokyo", target: "edge-tokyo", animated: true, label: "10ms", style: { stroke: '#10b981' } },
          { id: "e2", source: "london", target: "edge-london", animated: true, label: "15ms", style: { stroke: '#10b981' } },
          { id: "e3", source: "edge-tokyo", target: "ny", animated: false, label: "Cached (No fetch)", style: { stroke: '#6b7280', strokeDasharray: '5,5' } },
          { id: "e4", source: "edge-london", target: "ny", animated: false, label: "Cached", style: { stroke: '#6b7280', strokeDasharray: '5,5' } }
        ],
        quiz: {
          question: "When should you NOT use a CDN to cache data?",
          options: [
            "For static CSS and JavaScript files.",
            "For user profile pictures.",
            "For real-time bank account balances.",
            "For marketing landing pages."
          ],
          answerIndex: 2,
          explanation: "CDNs are perfect for static assets (images, CSS, JS) that rarely change. They are terrible for highly dynamic, personalized, and critical real-time data like a bank balance, because caching it at the edge could result in showing stale (outdated) or incorrect data."
        }
      }
    ]
  },
  {
    id: "cap-theorem",
    level: 3,
    title: "The CAP Theorem",
    description: "Consistency, Availability, Partition Tolerance. Choose two. Understand why distributed systems must make this fundamental trade-off.",
    scenes: [
      {
        id: "cap-s1",
        title: "The Golden Dream",
        explanation: "In a perfect world, a distributed database is always **Consistent** (everyone sees the exact same data at the same time), always **Available** (every request gets a response, never an error), and completely **Partition Tolerant** (works perfectly even if network cables between servers are cut).",
        nodes: [
          { id: "c1", position: { x: 50, y: 50 }, data: { label: "Client A", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "c2", position: { x: 50, y: 250 }, data: { label: "Client B", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "db1", position: { x: 350, y: 50 }, data: { label: "Node 1 (x=1)", iconName: "Database (SQL)", color: "bg-emerald-500", cpu: 10 }, type: "custom" },
          { id: "db2", position: { x: 350, y: 250 }, data: { label: "Node 2 (x=1)", iconName: "Database (SQL)", color: "bg-emerald-500", cpu: 10 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "c1", target: "db1", animated: true, label: "Read x", style: { stroke: '#10b981' } },
          { id: "e2", source: "c2", target: "db2", animated: true, label: "Read x", style: { stroke: '#10b981' } },
          { id: "sync", source: "db1", target: "db2", animated: true, label: "Network Sync", style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' } }
        ]
      },
      {
        id: "cap-s2",
        title: "The Network Partition (P)",
        explanation: "Networks fail. A router crashes or a fiber cable is cut. Node 1 and Node 2 can no longer communicate with each other. This is a **Partition (P)**. Because we are building distributed systems across networks, we **MUST** accept that Partitions will happen. We cannot sacrifice P.",
        nodes: [
          { id: "db1", position: { x: 350, y: 50 }, data: { label: "Node 1 (x=1)", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 10 }, type: "custom" },
          { id: "db2", position: { x: 350, y: 250 }, data: { label: "Node 2 (x=1)", iconName: "Database (SQL)", color: "bg-amber-500", cpu: 10 }, type: "custom" },
          { id: "fire", position: { x: 350, y: 150 }, data: { label: "NETWORK BROKEN", iconName: "Alert", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "sync", source: "db1", target: "fire", animated: false, style: { stroke: '#ef4444', strokeWidth: 4 } },
          { id: "sync2", source: "fire", target: "db2", animated: false, style: { stroke: '#ef4444', strokeWidth: 4 } }
        ]
      },
      {
        id: "cap-s3",
        title: "Choosing CP (Consistency over Availability)",
        explanation: "With the network broken, Client A writes `x=2` to Node 1. Node 1 *cannot* tell Node 2. If Client B tries to read `x` from Node 2, what happens? If we choose **CP (Consistent and Partition Tolerant)**, Node 2 will return an ERROR or timeout to Client B. It refuses to serve outdated data. We sacrifice Availability.",
        nodes: [
          { id: "c1", position: { x: 50, y: 50 }, data: { label: "Client A", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "c2", position: { x: 50, y: 250 }, data: { label: "Client B", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "db1", position: { x: 350, y: 50 }, data: { label: "Node 1 (x=2)", iconName: "Database (SQL)", color: "bg-emerald-500", cpu: 20 }, type: "custom" },
          { id: "db2", position: { x: 350, y: 250 }, data: { label: "Node 2 (x=1)", iconName: "Database (SQL)", color: "bg-red-500", cpu: 10 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "c1", target: "db1", animated: true, label: "Write x=2", style: { stroke: '#f59e0b' } },
          { id: "e2", source: "c2", target: "db2", animated: false, label: "Read x? ERROR!", style: { stroke: '#ef4444', strokeWidth: 3 } }
        ]
      },
      {
        id: "cap-s4",
        title: "Choosing AP (Availability over Consistency)",
        explanation: "Alternatively, we can choose **AP (Available and Partition Tolerant)**. Node 2 decides to answer Client B's read request using the old data it has (`x=1`). Both nodes are Available (they respond), but they are no longer Consistent (Client A sees `x=2`, Client B sees `x=1`).",
        nodes: [
          { id: "c1", position: { x: 50, y: 50 }, data: { label: "Client A", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "c2", position: { x: 50, y: 250 }, data: { label: "Client B", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "db1", position: { x: 350, y: 50 }, data: { label: "Node 1 (x=2)", iconName: "Database (SQL)", color: "bg-emerald-500", cpu: 20 }, type: "custom" },
          { id: "db2", position: { x: 350, y: 250 }, data: { label: "Node 2 (x=1)", iconName: "Database (SQL)", color: "bg-emerald-500", cpu: 10 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "c1", target: "db1", animated: true, label: "Write x=2", style: { stroke: '#f59e0b' } },
          { id: "e2", source: "c2", target: "db2", animated: true, label: "Read x -> Returns 1", style: { stroke: '#10b981', strokeWidth: 3 } }
        ],
        quiz: {
          question: "For a banking application transferring money between accounts, should the database system prioritize AP or CP?",
          options: [
            "AP (Availability) - The user should always be able to see their balance even if it's wrong.",
            "CP (Consistency) - Financial transactions must be perfectly accurate and not allow double-spending, even if it means failing a transaction during a network outage.",
            "It doesn't matter.",
            "CA - Just prevent the network from failing."
          ],
          answerIndex: 1,
          explanation: "Banking and financial systems heavily favor CP (Consistency). It is better to show an error 'Service temporarily unavailable' than to accidentally process a transaction against an outdated balance (which could allow double-spending)."
        }
      }
    ]
  },
  {
    id: "pacelc-theorem",
    level: 3,
    title: "PACELC Theorem",
    description: "PACELC extends CAP to explain what happens when there is NO partition. Learn the trade-off between Latency and Consistency.",
    scenes: [
      {
        id: "pac-s1",
        title: "Beyond CAP",
        explanation: "CAP only describes behavior during a Network Partition (P). PACELC says: If Partition (P), choose between Availability (A) and Consistency (C). ELSE (E), choose between Latency (L) and Consistency (C).",
        nodes: [
          { id: "p", position: { x: 200, y: 50 }, data: { label: "Partition? (P)", iconName: "Alert", color: "bg-red-500" }, type: "custom" },
          { id: "a", position: { x: 50, y: 150 }, data: { label: "Yes -> A or C?", iconName: "Layers", color: "bg-amber-500" }, type: "custom" },
          { id: "l", position: { x: 350, y: 150 }, data: { label: "No -> L or C?", iconName: "Layers", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "p", target: "a", label: "IF Partition" },
          { id: "e2", source: "p", target: "l", label: "ELSE" }
        ]
      },
      {
        id: "pac-s2",
        title: "Latency vs Consistency (ELC)",
        explanation: "Even when the network is healthy, a database must choose: Do I return data instantly (Low Latency) or wait for all replicas to sync (High Consistency)? Systems like DynamoDB allow you to choose 'Eventually Consistent' reads for speed or 'Strongly Consistent' for accuracy.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "Client", iconName: "Laptop", color: "bg-blue-500" }, type: "custom" },
          { id: "db1", position: { x: 350, y: 50 }, data: { label: "Primary DB", iconName: "Database (SQL)", color: "bg-emerald-500" }, type: "custom" },
          { id: "db2", position: { x: 350, y: 250 }, data: { label: "Replica DB", iconName: "Database (SQL)", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "db1", animated: true, label: "Read (Fast)" },
          { id: "e2", source: "db1", target: "db2", animated: true, label: "Wait for Sync? (Slow)", style: { strokeDasharray: '5,5' } }
        ]
      }
    ]
  },
  {
    id: "microservices",
    level: 3,
    title: "Monolith vs Microservices",
    description: "Understand the transition from building one massive application to coordinating dozens of small, independent services.",
    scenes: [
      {
        id: "ms-s1",
        title: "The Monolith",
        explanation: "In a Monolithic architecture, the entire application (User Auth, Product Catalog, Payments, Shipping) is compiled into a single codebase and runs in a single process. It is simple to deploy and test. But as the engineering team grows to 100+ developers, every deployment is risky, and a bug in the Shipping module can crash the entire Payments system.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "monolith", position: { x: 350, y: 150 }, data: { label: "Giant Monolith App", iconName: "Server", color: "bg-amber-500", cpu: 85, mem: 90 }, type: "custom" },
          { id: "db", position: { x: 650, y: 150 }, data: { label: "Giant Database", iconName: "Database (SQL)", color: "bg-red-500", cpu: 75 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "monolith", animated: true },
          { id: "e2", source: "monolith", target: "db", animated: true }
        ]
      },
      {
        id: "ms-s2",
        title: "Deconstructing into Microservices",
        explanation: "We break the monolith into Microservices. Auth, Products, and Payments are now completely separate applications, owned by different teams, deployed independently, and each has its own separate database. If the Products service goes down, Auth and Payments still work perfectly.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "gateway", position: { x: 250, y: 150 }, data: { label: "API Gateway", iconName: "API Gateway", color: "bg-purple-500", cpu: 20 }, type: "custom" },
          { id: "auth", position: { x: 450, y: 50 }, data: { label: "Auth Service", iconName: "Server", color: "bg-emerald-500", cpu: 15 }, type: "custom" },
          { id: "products", position: { x: 450, y: 150 }, data: { label: "Product Service", iconName: "Server", color: "bg-emerald-500", cpu: 30 }, type: "custom" },
          { id: "payments", position: { x: 450, y: 250 }, data: { label: "Payment Service", iconName: "Server", color: "bg-emerald-500", cpu: 10 }, type: "custom" },
          { id: "db1", position: { x: 650, y: 50 }, data: { label: "Auth DB", iconName: "Database (SQL)", color: "bg-emerald-600", cpu: 10 }, type: "custom" },
          { id: "db2", position: { x: 650, y: 150 }, data: { label: "Products DB", iconName: "Database (NoSQL)", color: "bg-emerald-600", cpu: 25 }, type: "custom" },
          { id: "db3", position: { x: 650, y: 250 }, data: { label: "Payments DB", iconName: "Database (SQL)", color: "bg-emerald-600", cpu: 5 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "gateway", animated: true },
          { id: "e2", source: "gateway", target: "auth", animated: true, style: { stroke: '#10b981' } },
          { id: "e3", source: "gateway", target: "products", animated: true, style: { stroke: '#10b981' } },
          { id: "e4", source: "gateway", target: "payments", animated: true, style: { stroke: '#10b981' } },
          { id: "e5", source: "auth", target: "db1", animated: true },
          { id: "e6", source: "products", target: "db2", animated: true },
          { id: "e7", source: "payments", target: "db3", animated: true }
        ]
      },
      {
        id: "ms-s3",
        title: "The Trade-off: Distributed Complexity",
        explanation: "Microservices introduce massive complexity. What happens if a user places an order, the Payments service deducts money, but the Inventory service crashes before reserving the item? In a Monolith, a database transaction rolls back automatically. In microservices, you must write complex Saga patterns and compensation logic to handle distributed failures.",
        nodes: [
          { id: "gateway", position: { x: 50, y: 150 }, data: { label: "Gateway", iconName: "API Gateway", color: "bg-purple-500" }, type: "custom" },
          { id: "order", position: { x: 250, y: 50 }, data: { label: "Order Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "payment", position: { x: 450, y: 150 }, data: { label: "Payment Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "inventory", position: { x: 650, y: 50 }, data: { label: "Inventory", iconName: "Server", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "gateway", target: "order", animated: true, label: "Place Order" },
          { id: "e2", source: "order", target: "payment", animated: true, label: "1. Charge $50", style: { stroke: '#10b981', strokeWidth: 2 } },
          { id: "e3", source: "order", target: "inventory", animated: false, label: "2. Reserve Item (FAILS!)", style: { stroke: '#ef4444', strokeWidth: 3 } },
          { id: "e4", source: "order", target: "payment", animated: true, label: "3. Refund $50", style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' } }
        ],
        quiz: {
          question: "When should a startup with 3 engineers build a Microservices architecture?",
          options: [
            "Immediately, because microservices are modern and monoliths are legacy.",
            "Only if they use Kubernetes.",
            "Almost never. They should build a Modular Monolith first, as microservice infrastructure complexity will slow a tiny team to a halt.",
            "When they need to use more than one programming language."
          ],
          answerIndex: 2,
          explanation: "Microservices solve scaling problems for large engineering organizations (e.g. 50+ developers) trying not to step on each other's toes. For a small startup, the operational overhead (networking, deployments, tracing, distributed data) of microservices is usually a fatal distraction."
        }
      }
    ]
  },
  {
    id: "api-gateway",
    level: 3,
    title: "API Gateways",
    description: "Learn how API Gateways act as the single entry point to orchestrate traffic in distributed architectures.",
    scenes: [
      {
        id: "gateway-s1",
        title: "The Chaos of Direct Client-to-Microservice",
        explanation: "Imagine a mobile app that needs to display a user's profile. Without a gateway, the phone must make 4 separate HTTP requests over the slow cellular network to 4 different microservices (Auth, User Info, Recommendations, Recent Activity). This destroys mobile battery and creates massive latency.",
        nodes: [
          { id: "mobile", position: { x: 50, y: 150 }, data: { label: "Mobile App", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "auth", position: { x: 450, y: 0 }, data: { label: "Auth", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "user", position: { x: 450, y: 100 }, data: { label: "User Info", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "rec", position: { x: 450, y: 200 }, data: { label: "Recommendations", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "act", position: { x: 450, y: 300 }, data: { label: "Activity", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "mobile", target: "auth", animated: true, style: { stroke: '#ef4444' } },
          { id: "e2", source: "mobile", target: "user", animated: true, style: { stroke: '#ef4444' } },
          { id: "e3", source: "mobile", target: "rec", animated: true, style: { stroke: '#ef4444' } },
          { id: "e4", source: "mobile", target: "act", animated: true, style: { stroke: '#ef4444' } }
        ]
      },
      {
        id: "gateway-s2",
        title: "The API Gateway (BFF Pattern)",
        explanation: "We introduce an API Gateway (Backend-For-Frontend). The mobile app makes ONE request to the Gateway over the slow cellular network. The Gateway, which sits in the ultra-fast internal datacenter network alongside the microservices, fetches the 4 pieces of data, stitches them into a single JSON payload, and sends one response back.",
        nodes: [
          { id: "mobile", position: { x: 50, y: 150 }, data: { label: "Mobile App", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "gateway", position: { x: 250, y: 150 }, data: { label: "API Gateway", iconName: "API Gateway", color: "bg-purple-500" }, type: "custom" },
          { id: "auth", position: { x: 500, y: 0 }, data: { label: "Auth", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "user", position: { x: 500, y: 100 }, data: { label: "User Info", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "rec", position: { x: 500, y: 200 }, data: { label: "Recommendations", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "act", position: { x: 500, y: 300 }, data: { label: "Activity", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "mobile", target: "gateway", animated: true, label: "1 Request", style: { stroke: '#10b981', strokeWidth: 3 } },
          { id: "e2", source: "gateway", target: "auth", animated: true, style: { stroke: '#8b5cf6' } },
          { id: "e3", source: "gateway", target: "user", animated: true, style: { stroke: '#8b5cf6' } },
          { id: "e4", source: "gateway", target: "rec", animated: true, style: { stroke: '#8b5cf6' } },
          { id: "e5", source: "gateway", target: "act", animated: true, style: { stroke: '#8b5cf6' } }
        ],
        quiz: {
          question: "Besides data aggregation (stitching), what is another primary responsibility of an API Gateway?",
          options: [
            "Running complex machine learning models.",
            "Storing user passwords securely in its own database.",
            "Handling cross-cutting concerns like Rate Limiting, Authentication validation, and SSL termination.",
            "Rendering HTML pages for the browser."
          ],
          answerIndex: 2,
          explanation: "API Gateways are ideal places for cross-cutting concerns. Instead of building rate-limiting and JWT token validation into all 50 of your microservices, you put it in the Gateway. If a request is unauthenticated or exceeding rate limits, the Gateway blocks it before it ever hits your backend services."
        }
      }
    ]
  },
  {
    id: "websockets",
    level: 3,
    title: "Real-Time Comm: WebSockets",
    description: "Understand how to achieve low-latency bidirectional communication for chat apps, live sports, and trading platforms.",
    scenes: [
      {
        id: "ws-s1",
        title: "HTTP Polling (The Old Way)",
        explanation: "Imagine a stock trading app. If we rely on standard HTTP, the client has to constantly ask the server: 'Any updates? No. Any updates? No.' This is called Short Polling. It wastes massive amounts of bandwidth and server CPU just to check for empty updates.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "Trading App", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "server", position: { x: 350, y: 150 }, data: { label: "API Server", iconName: "Server", color: "bg-amber-500", cpu: 80 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "server", animated: true, label: "Polling every 1 sec", style: { stroke: '#f59e0b', strokeDasharray: '5,5' } }
        ]
      },
      {
        id: "ws-s2",
        title: "WebSockets (Bidirectional)",
        explanation: "WebSockets solve this. The client sends one HTTP request to 'upgrade' the connection. After that, a persistent TCP connection is left open. Neither side has to poll. The server can push data to the client instantly the millisecond a stock price changes. It is incredibly efficient for real-time data.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "Trading App", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "server", position: { x: 350, y: 150 }, data: { label: "WebSocket Server", iconName: "Server", color: "bg-emerald-500", cpu: 15 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "server", target: "client", animated: true, label: "Server Push (Price Updated!)", style: { stroke: '#10b981', strokeWidth: 3 } }
        ],
        quiz: {
          question: "If WebSockets are so efficient, why don't we use them for EVERYTHING instead of HTTP/REST?",
          options: [
            "WebSockets cannot transfer JSON data.",
            "WebSockets require keeping stateful, long-lived connections open, which consumes memory on the server and makes load balancing much harder.",
            "WebSockets are not supported by modern browsers.",
            "WebSockets cannot be encrypted via TLS."
          ],
          answerIndex: 1,
          explanation: "WebSockets are stateful. A server with 100,000 active WebSocket users must maintain 100,000 open TCP connections in memory continuously. REST/HTTP is stateless—the connection opens, data is sent, connection closes immediately, freeing up resources. Balancing stateful connections across a fleet of servers is significantly more complex."
        }
      }
    ]
  },
  {
    id: "kafka-vs-rabbitmq",
    level: 3,
    title: "Kafka vs RabbitMQ",
    description: "Understand the fundamental difference between a Smart Broker / Dumb Consumer (RabbitMQ) and a Dumb Broker / Smart Consumer (Kafka).",
    scenes: [
      {
        id: "kafka-s1",
        title: "RabbitMQ (Message Queue)",
        explanation: "RabbitMQ is a traditional message queue. It pushes messages to consumers and expects an ACK (acknowledgment). Once ACKed, the message is **DELETED** from the queue forever. It is great for task processing (like sending emails) where you only want the work done once.",
        nodes: [
          { id: "pub", position: { x: 50, y: 150 }, data: { label: "Producer", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "rabbit", position: { x: 350, y: 150 }, data: { label: "RabbitMQ", iconName: "Message Queue", color: "bg-orange-500", cpu: 20 }, type: "custom" },
          { id: "sub1", position: { x: 650, y: 100 }, data: { label: "Worker 1", iconName: "Worker", color: "bg-emerald-500" }, type: "custom" },
          { id: "sub2", position: { x: 650, y: 200 }, data: { label: "Worker 2", iconName: "Worker", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "pub", target: "rabbit", animated: true, label: "Publish [Msg 1]", style: { stroke: '#f97316' } },
          { id: "e2", source: "rabbit", target: "sub1", animated: true, label: "Push [Msg 1] -> DELETED", style: { stroke: '#10b981' } }
        ]
      },
      {
        id: "kafka-s2",
        title: "Kafka (Event Streaming)",
        explanation: "Kafka is a distributed append-only log. Messages are **NOT DELETED** when read. Instead, consumers keep track of their own 'Offset' (index) in the log. This means multiple different consumers (e.g., Analytics, Backup, Notification) can read the exact same stream of events at their own pace.",
        nodes: [
          { id: "pub", position: { x: 50, y: 150 }, data: { label: "Producer", iconName: "Server", color: "bg-blue-500" }, type: "custom" },
          { id: "kafka", position: { x: 350, y: 150 }, data: { label: "Kafka Log", iconName: "Message Queue", color: "bg-zinc-800", cpu: 5 }, type: "custom" },
          { id: "sub1", position: { x: 650, y: 50 }, data: { label: "Analytics (Offset: 4)", iconName: "Worker", color: "bg-indigo-500" }, type: "custom" },
          { id: "sub2", position: { x: 650, y: 150 }, data: { label: "Backup (Offset: 1)", iconName: "Worker", color: "bg-teal-500" }, type: "custom" },
          { id: "sub3", position: { x: 650, y: 250 }, data: { label: "Alerts (Offset: 5)", iconName: "Worker", color: "bg-rose-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "pub", target: "kafka", animated: true, label: "Append Event 5", style: { stroke: '#71717a' } },
          { id: "e2", source: "kafka", target: "sub1", animated: true, label: "Poll Event 5", style: { stroke: '#6366f1' } },
          { id: "e3", source: "kafka", target: "sub2", animated: true, label: "Poll Event 2", style: { stroke: '#14b8a6' } },
          { id: "e4", source: "kafka", target: "sub3", animated: true, label: "Poll Event 5", style: { stroke: '#e11d48' } }
        ],
        quiz: {
          question: "If a new microservice is added to your architecture and it needs to process all user signups from the past 7 days, which technology is better suited?",
          options: [
            "RabbitMQ",
            "Kafka",
            "They are equally suited.",
            "Neither can do this."
          ],
          answerIndex: 1,
          explanation: "Kafka is designed for this! Because Kafka persists the log for a configured retention period (e.g., 7 days), a brand new consumer can start reading from offset 0 and replay the entire week of events. In RabbitMQ, those messages were deleted the moment the original consumers ACKed them."
        }
      }
    ]
  },
  {
    id: "rate-limiting",
    level: 3,
    title: "Rate Limiting",
    description: "Protect your APIs from DDoS attacks and abusive users by restricting how many requests they can make.",
    scenes: [
      {
        id: "rl-s1",
        title: "The Unprotected API",
        explanation: "A malicious user (or a broken script) loops and sends 10,000 requests per second to your login endpoint. Your servers are overwhelmed, the database crashes, and legitimate users are completely blocked.",
        nodes: [
          { id: "hacker", position: { x: 50, y: 50 }, data: { label: "Hacker / Bot", iconName: "Alert", color: "bg-red-500" }, type: "custom" },
          { id: "legit", position: { x: 50, y: 250 }, data: { label: "Normal User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "server", position: { x: 350, y: 150 }, data: { label: "API Server", iconName: "Server", color: "bg-red-500", cpu: 100 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "hacker", target: "server", animated: true, label: "10,000 req/sec", style: { stroke: '#ef4444', strokeWidth: 4 } },
          { id: "e2", source: "legit", target: "server", animated: false, label: "TIMEOUT", style: { stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '5,5' } }
        ]
      },
      {
        id: "rl-s2",
        title: "Token Bucket Algorithm",
        explanation: "We add a Rate Limiter at the API Gateway using Redis. We use the 'Token Bucket' algorithm. Every user gets a bucket with 5 tokens. Tokens refill at 1 per second. If the bucket is empty, requests are rejected with a 429 Too Many Requests error. The normal user gets through, the bot is blocked.",
        nodes: [
          { id: "hacker", position: { x: 50, y: 50 }, data: { label: "Hacker / Bot", iconName: "Alert", color: "bg-red-500" }, type: "custom" },
          { id: "legit", position: { x: 50, y: 250 }, data: { label: "Normal User", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "gateway", position: { x: 300, y: 150 }, data: { label: "API Gateway (Rate Limiter)", iconName: "API Gateway", color: "bg-purple-500", cpu: 25 }, type: "custom" },
          { id: "server", position: { x: 600, y: 150 }, data: { label: "API Server", iconName: "Server", color: "bg-emerald-500", cpu: 15 }, type: "custom" },
          { id: "redis", position: { x: 300, y: 300 }, data: { label: "Redis (Token Counters)", iconName: "Cache (Redis)", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "hacker", target: "gateway", animated: true, label: "Req (BLOCKED)", style: { stroke: '#ef4444' } },
          { id: "e2", source: "legit", target: "gateway", animated: true, label: "Req (ALLOWED)", style: { stroke: '#10b981' } },
          { id: "e3", source: "gateway", target: "server", animated: true, label: "Pass to Server", style: { stroke: '#10b981' } },
          { id: "e4", source: "gateway", target: "redis", animated: true, label: "Check Tokens", style: { stroke: '#f43f5e', strokeDasharray: '5,5' } }
        ],
        quiz: {
          question: "Why is Redis commonly used to store rate limiting counters instead of an SQL database or local server memory?",
          options: [
            "Redis is an SQL database.",
            "Local server memory is better, but Redis is cheaper.",
            "Redis is incredibly fast (RAM), supports atomic operations (like INCR), and provides a centralized state across multiple gateway servers.",
            "Redis automatically detects hackers using AI."
          ],
          answerIndex: 2,
          explanation: "In a distributed system, you likely have multiple API Gateway instances. If you store counters in local memory, User A might hit Gateway 1, then Gateway 2, bypassing the limit. Redis provides a centralized, ultra-fast, atomic counter that all gateways can share without slowing down requests."
        }
      }
    ]
  },
  {
    id: "dns",
    level: 2,
    title: "DNS Resolution",
    description: "The phonebook of the internet. Learn how a URL like google.com is translated into a machine-readable IP address.",
    scenes: [
      {
        id: "dns-s1",
        title: "The Initial Request",
        explanation: "When you type 'systemarchitect.io' into your browser, your computer doesn't know where to send the data. It first checks its local OS cache and browser cache. If it's not there, it must ask the DNS Resolvers.",
        nodes: [
          { id: "browser", position: { x: 50, y: 150 }, data: { label: "Web Browser", iconName: "Client/User", color: "bg-blue-500" }, type: "custom" },
          { id: "isp", position: { x: 350, y: 150 }, data: { label: "ISP DNS Resolver", iconName: "Server", color: "bg-purple-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "browser", target: "isp", animated: true, label: "Where is systemarchitect.io?", style: { stroke: '#8b5cf6' } }
        ]
      },
      {
        id: "dns-s2",
        title: "The DNS Hierarchy",
        explanation: "The ISP Resolver first asks the Root Server (.), which points to the Top-Level Domain (TLD) server (.io). The TLD server points to the Authoritative Name Server for 'systemarchitect.io', which finally returns the IP address (e.g., 104.21.55.2).",
        nodes: [
          { id: "isp", position: { x: 50, y: 150 }, data: { label: "ISP Resolver", iconName: "Server", color: "bg-purple-500" }, type: "custom" },
          { id: "root", position: { x: 350, y: 50 }, data: { label: "Root Server (.)", iconName: "Database (NoSQL)", color: "bg-amber-500" }, type: "custom" },
          { id: "tld", position: { x: 350, y: 150 }, data: { label: "TLD Server (.io)", iconName: "Database (NoSQL)", color: "bg-amber-500" }, type: "custom" },
          { id: "auth", position: { x: 350, y: 250 }, data: { label: "Authoritative NS", iconName: "Database (NoSQL)", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "isp", target: "root", animated: true, label: "1. Who handles .io?" },
          { id: "e2", source: "root", target: "isp", animated: true, label: "2. Ask TLD IP" },
          { id: "e3", source: "isp", target: "tld", animated: true, label: "3. Who handles systemarchitect?" },
          { id: "e4", source: "tld", target: "isp", animated: true, label: "4. Ask Auth IP" },
          { id: "e5", source: "isp", target: "auth", animated: true, label: "5. What is the IP?", style: { stroke: '#10b981' } },
          { id: "e6", source: "auth", target: "isp", animated: true, label: "6. IP is 104.21.55.2!", style: { stroke: '#10b981' } }
        ],
        quiz: {
          question: "What is the primary mechanism used to prevent the DNS Root and TLD servers from being overloaded by billions of internet requests per second?",
          options: [
            "Sharding the Root servers by alphabet.",
            "Requiring users to type IP addresses directly for popular sites.",
            "Heavy Caching at the Browser, OS, and ISP Resolver levels.",
            "Using WebSockets for DNS."
          ],
          answerIndex: 2,
          explanation: "Caching is critical for DNS. Your browser caches IPs, your operating system caches them, and your ISP caches them for a certain TTL (Time To Live). The full hierarchical lookup only happens when all caches miss."
        }
      }
    ]
  },
  {
    id: "advanced-networking",
    level: 2,
    title: "Networking Evolution: HTTP/3 & gRPC",
    description: "Go beyond basic HTTP. Learn about the binary protocols and multiplexing that power modern high-performance microservices.",
    scenes: [
      {
        id: "net-s1",
        title: "HTTP/1.1 vs HTTP/2",
        explanation: "HTTP/1.1 suffered from 'Head-of-Line Blocking'—only one request per TCP connection at a time. HTTP/2 introduced Multiplexing, allowing many requests over one connection, and Binary Framing for efficiency.",
        nodes: [
          { id: "client", position: { x: 50, y: 150 }, data: { label: "Client", iconName: "Laptop", color: "bg-blue-500" }, type: "custom" },
          { id: "h1", position: { x: 350, y: 50 }, data: { label: "HTTP/1.1 (Serial)", iconName: "Network", color: "bg-amber-500" }, type: "custom" },
          { id: "h2", position: { x: 350, y: 250 }, data: { label: "HTTP/2 (Multiplexed)", iconName: "Network", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "client", target: "h1", animated: true, label: "Req 1... then Req 2" },
          { id: "e2", source: "client", target: "h2", animated: true, label: "Req 1 & 2 Together", style: { stroke: '#10b981', strokeWidth: 3 } }
        ]
      },
      {
        id: "net-s2",
        title: "gRPC: High-Speed Microservices",
        explanation: "gRPC uses HTTP/2 and Protocol Buffers (binary) instead of JSON (text). It is 7-10x faster than REST and provides strong typing between services. It's the industry standard for internal service communication.",
        nodes: [
          { id: "svc1", position: { x: 100, y: 150 }, data: { label: "Order Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "svc2", position: { x: 500, y: 150 }, data: { label: "Payment Service", iconName: "Server", color: "bg-emerald-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "svc1", target: "svc2", animated: true, label: "gRPC (Protobuf Binary)", style: { stroke: '#10b981', strokeWidth: 4 } }
        ],
        quiz: {
          question: "Why is gRPC generally faster than REST/JSON?",
          options: [
            "JSON is binary and Protobuf is text.",
            "gRPC uses UDP instead of TCP.",
            "Protocol Buffers are binary and much smaller than JSON text, and gRPC reuses the same TCP connection via HTTP/2 multiplexing.",
            "gRPC does not require authentication."
          ],
          answerIndex: 2,
          explanation: "Serialization is the bottleneck. Protobuf encodes data into a tight binary format that is much smaller than JSON strings. Combined with HTTP/2's ability to send many requests over one connection, it provides massive performance gains."
        }
      }
    ]
  },
  {
    id: "kubernetes",
    level: 4,
    title: "Containers & Kubernetes",
    description: "Understand how modern applications are packaged and orchestrated at scale.",
    scenes: [
      {
        id: "k8s-s1",
        title: "The Problem with VMs",
        explanation: "Traditionally, we deployed apps on Virtual Machines (VMs). Every VM requires its own full Guest Operating System (e.g., Windows, Linux). This wastes massive amounts of RAM and CPU just to run the OS, making them slow to boot and expensive.",
        nodes: [
          { id: "hw", position: { x: 350, y: 250 }, data: { label: "Hardware Server", iconName: "Server", color: "bg-zinc-800" }, type: "custom" },
          { id: "vm1", position: { x: 200, y: 100 }, data: { label: "App 1 + Guest OS", iconName: "Server", color: "bg-red-500", mem: 90 }, type: "custom" },
          { id: "vm2", position: { x: 500, y: 100 }, data: { label: "App 2 + Guest OS", iconName: "Server", color: "bg-red-500", mem: 90 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "vm1", target: "hw", animated: false },
          { id: "e2", source: "vm2", target: "hw", animated: false }
        ]
      },
      {
        id: "k8s-s2",
        title: "Docker Containers",
        explanation: "Containers share the Host OS kernel. They package only the application and its direct dependencies. They start in milliseconds and use very little memory. You can pack 50 containers on a server that could only hold 5 VMs.",
        nodes: [
          { id: "hw", position: { x: 350, y: 250 }, data: { label: "Hardware + Host OS", iconName: "Server", color: "bg-zinc-800" }, type: "custom" },
          { id: "c1", position: { x: 150, y: 100 }, data: { label: "App 1", iconName: "Server", color: "bg-emerald-500", mem: 15 }, type: "custom" },
          { id: "c2", position: { x: 350, y: 100 }, data: { label: "App 2", iconName: "Server", color: "bg-emerald-500", mem: 10 }, type: "custom" },
          { id: "c3", position: { x: 550, y: 100 }, data: { label: "App 3", iconName: "Server", color: "bg-emerald-500", mem: 20 }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "c1", target: "hw", animated: false },
          { id: "e2", source: "c2", target: "hw", animated: false },
          { id: "e3", source: "c3", target: "hw", animated: false }
        ]
      },
      {
        id: "k8s-s3",
        title: "Kubernetes (K8s) Orchestration",
        explanation: "What happens if a server dies or traffic spikes? You need something to manage thousands of containers automatically. Kubernetes monitors the system. If a container crashes, K8s instantly spins up a replacement on a healthy node. If traffic spikes, it auto-scales the containers.",
        nodes: [
          { id: "k8s", position: { x: 350, y: 50 }, data: { label: "K8s Control Plane", iconName: "API Gateway", color: "bg-purple-500" }, type: "custom" },
          { id: "node1", position: { x: 200, y: 250 }, data: { label: "Worker Node 1", iconName: "Server", color: "bg-zinc-800" }, type: "custom" },
          { id: "node2", position: { x: 500, y: 250 }, data: { label: "Worker Node 2", iconName: "Server", color: "bg-red-500" }, type: "custom" },
          { id: "c1", position: { x: 150, y: 150 }, data: { label: "Pod", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "c2", position: { x: 250, y: 150 }, data: { label: "Pod", iconName: "Server", color: "bg-emerald-500" }, type: "custom" },
          { id: "c3", position: { x: 500, y: 150 }, data: { label: "Pod (Crashing)", iconName: "Server", color: "bg-red-500" }, type: "custom" }
        ],
        edges: [
          { id: "e1", source: "k8s", target: "node1", animated: true, label: "Monitor", style: { stroke: '#8b5cf6' } },
          { id: "e2", source: "k8s", target: "node2", animated: true, label: "Node Dead! Evicting Pod", style: { stroke: '#ef4444' } },
          { id: "e3", source: "c1", target: "node1", animated: false },
          { id: "e4", source: "c2", target: "node1", animated: false },
          { id: "e5", source: "c3", target: "node2", animated: false }
        ],
        quiz: {
          question: "What is a major downside or trade-off of adopting Kubernetes?",
          options: [
            "It runs applications slower than Virtual Machines.",
            "It is extremely complex to set up, secure, and maintain, requiring dedicated DevOps expertise.",
            "It only supports web applications, not databases or message queues.",
            "It requires you to rewrite all your code in Go."
          ],
          answerIndex: 1,
          explanation: "Kubernetes is notoriously complex. For a small startup with a simple monolithic app, deploying K8s is vast overkill and introduces massive operational overhead. K8s is a powerful tool designed for organizations operating at significant scale."
        }
      }
    ]
  }
];

export const lessons: Lesson[] = [...basicLessons, ...advancedLessons];
