export interface SystemDesignAnalogy {
  id: string;
  title: string;
  question: string;
  concept1: {
    name: string;
    description: string;
    analogy: string;
    pros?: string;
    cons?: string;
  };
  concept2?: {
    name: string;
    description: string;
    analogy: string;
    pros?: string;
    cons?: string;
  };
  generalAnalogy?: {
    analogy: string;
    explanation: string;
  };
  iconName: string;
  themeColor: string;
}

export const SYSTEM_DESIGN_ANALOGIES: SystemDesignAnalogy[] = [
  {
    id: "an-1",
    title: "Monolith vs. Microservices",
    question: "Should we build this app as a monolith or use microservices?",
    concept1: {
      name: "Monolith",
      description: "All your code (user login, payment processing, sending emails) is mashed together into one giant program.",
      analogy: "The Swiss Army Knife",
      pros: "Very easy to build and test when you are a small startup.",
      cons: "If a bug in the 'email' code crashes, the entire app crashes, taking down the 'payment' system with it."
    },
    concept2: {
      name: "Microservices",
      description: "You break the app into separate, mini-programs. One program only handles logins. Another only handles payments.",
      analogy: "The Toolbox",
      pros: "If the email service crashes, users can still log in and pay. You can also have a dedicated team working on just one tool without stepping on the toes of other teams.",
      cons: "It is much harder to keep track of 50 small tools than 1 big knife."
    },
    iconName: "Layers",
    themeColor: "indigo"
  },
  {
    id: "an-2",
    title: "Vertical vs. Horizontal Scaling",
    question: "Our website is getting too much traffic and slowing down. How do we scale it?",
    concept1: {
      name: "Vertical Scaling",
      description: "You are just adding more RAM and CPU to your existing server.",
      analogy: "The Ferrari V12 Engine Upgrade",
      pros: "Very simple conceptually; doesn't require modifying application code or coordinating multiple servers.",
      cons: "There is a physical limit to how big one computer can get, and it becomes incredibly expensive."
    },
    concept2: {
      name: "Horizontal Scaling",
      description: "You keep your servers small and cheap, but you just add more of them to share the load.",
      analogy: "Buying 10 more Honda Civics",
      pros: "Infinitely scalable. You can handle billions of users by simply renting more machines.",
      cons: "You now need a 'Traffic Cop' (a Load Balancer) to direct users to all these different cars."
    },
    iconName: "Cpu",
    themeColor: "blue"
  },
  {
    id: "an-3",
    title: "What is an API?",
    question: "How does our mobile app get data from our database?",
    generalAnalogy: {
      analogy: "The Restaurant Waiter",
      explanation: "Think of a restaurant: You are the **Client** (the mobile app) sitting at the table. The kitchen is the **Server / Database** where the food (data) is prepared. You cannot just walk into the kitchen and grab your own food. You need a **Waiter**. **The API is the Waiter.** You tell the API what you want, the API goes to the kitchen, gets the exact data you asked for, and brings it back to your screen."
    },
    concept1: {
      name: "The Client (You)",
      description: "The mobile app or browser sitting at the table, requesting specific data.",
      analogy: "Customer at the restaurant table"
    },
    concept2: {
      name: "The API & Database (Kitchen & Waiter)",
      description: "The API acts as the waiter passing requests and the database/server is the kitchen preparing response data.",
      analogy: "The Waiter taking orders and delivering dishes"
    },
    iconName: "Zap",
    themeColor: "amber"
  },
  {
    id: "an-4",
    title: "SQL vs. NoSQL Databases",
    question: "Which database should we use to store our data?",
    concept1: {
      name: "SQL / Relational",
      description: "Everything is strictly organized into rows and columns. If you have a column for 'Phone Number,' every user must follow that rule.",
      analogy: "The Excel Spreadsheet",
      pros: "Incredibly strict, safe, and great for things where accuracy is vital (like banking).",
      cons: "Harder to scale horizontally and less flexible when schema structures change."
    },
    concept2: {
      name: "NoSQL",
      description: "You just toss 'Documents' into a folder. One user’s document might have a phone number, an address, and a photo. Another user's document might just have a username. It doesn't care.",
      analogy: "The Filing Cabinet",
      pros: "Flexible, handles messy data beautifully, and scales up very easily (great for social media feeds).",
      cons: "Doesn't natively guarantee relational integrity (harder to join tables safely)."
    },
    iconName: "Database",
    themeColor: "emerald"
  },
  {
    id: "an-5",
    title: "What is a Message Queue?",
    question: "Our system crashes when too many people try to upload photos at the exact same time. How do we fix it?",
    generalAnalogy: {
      analogy: "The Coffee Shop Counter",
      explanation: "Think of a busy coffee shop: If the cashier also had to turn around and *make* the coffee for every single customer, the line would grow out the door, and the system would break. Instead, the cashier takes your order, writes it on a cup, and puts it on a counter. **That counter is the Message Queue.** The cashier can immediately take the next person's order (fast). Meanwhile, a barista in the back picks up cups from the counter one by one and makes the drinks at their own safe pace. A message queue acts as a shock absorber so the system doesn't get overwhelmed."
    },
    concept1: {
      name: "The Producer (Cashier)",
      description: "Accepts incoming uploads/tasks rapidly and immediately responds with a 'Success/Received' state.",
      analogy: "The cashier taking your order and putting the cup on the counter"
    },
    concept2: {
      name: "The Consumer (Barista)",
      description: "Processes heavy-lifting tasks out-of-band at a stable, controlled rate.",
      analogy: "The barista taking cups off the counter one by one"
    },
    iconName: "Activity",
    themeColor: "rose"
  },
  {
    id: "an-6",
    title: "What is a Reverse Proxy?",
    question: "How do we protect our servers from hackers or too much traffic before they even hit our code?",
    generalAnalogy: {
      analogy: "The Club Bouncer / Office Receptionist",
      explanation: "Think of a bouncer at an exclusive nightclub, or a receptionist at a massive office building. When you walk into the building, you don't go straight to the CEO's desk. You go to the receptionist (the Reverse Proxy). The receptionist checks your ID (Security/Authentication), decides which room you belong in (Routing), and ensures nobody goes wandering the halls uninvited. It hides the messy, internal layout of the building from the public."
    },
    concept1: {
      name: "External Requests",
      description: "Public clients attempting to interact with backend services.",
      analogy: "Visitors entering the building lobby"
    },
    concept2: {
      name: "Reverse Proxy",
      description: "Intercepts and filters incoming requests, handles security checks, load balancing, and hides internal details.",
      analogy: "The receptionist verifying credentials and directing guests"
    },
    iconName: "Shield",
    themeColor: "cyan"
  },
  {
    id: "an-7",
    title: "What is the CAP Theorem?",
    question: "Why can't our distributed database be perfectly fast, perfectly accurate, and never go down?",
    generalAnalogy: {
      analogy: "The Business Trade-Off rule: 'Fast, Cheap, or Good. Pick two.'",
      explanation: "The CAP theorem is the software version of that business saying, but for data. It stands for:\n\n* **Consistency:** Every user sees the exact same data at the exact same time.\n* **Availability:** The system never goes down; you can always click the button.\n* **Partition Tolerance:** If the internet cable between Server A and Server B gets cut, the system survives.\n\n**The rule is: You can only guarantee two out of the three.** If the network breaks (Partition), you have to choose: do I shut the app down so nobody sees wrong data (choosing Consistency), or do I keep the app running but risk showing people outdated information (choosing Availability)?"
    },
    concept1: {
      name: "Consistency (C)",
      description: "Every user sees the exact same data at the exact same time, even if we have to block access to do it.",
      analogy: "A strict librarian refusing to hand out a book until they've confirmed it's the exact latest edition"
    },
    concept2: {
      name: "Availability (A)",
      description: "Every request gets a fast response, even if the information might be slightly out of date.",
      analogy: "A friendly clerk who gives you a copy of the menu, warning it might have old pricing but letting you order anyway"
    },
    iconName: "Network",
    themeColor: "purple"
  },
  {
    id: "an-8",
    title: "What is a Single Point of Failure (SPOF)?",
    question: "Is this architecture resilient?",
    generalAnalogy: {
      analogy: "The Single Island Bridge",
      explanation: "Imagine a town on an island with only one bridge connecting it to the mainland. If an earthquake destroys that one bridge, the entire town starves. That bridge is a Single Point of Failure.\n\nIn system design, if you have 100 web servers, but they all rely on *one* database, and that database crashes—your 100 web servers are useless. The solution is redundancy: building a second bridge (a backup database)."
    },
    concept1: {
      name: "Single Point of Failure",
      description: "Any single component whose outage takes down the entire application stack.",
      analogy: "The only bridge connecting an island to the mainland"
    },
    concept2: {
      name: "Redundancy (High Availability)",
      description: "Replicating key components and establishing failovers to guarantee uptime.",
      analogy: "Building a secondary bridge and maintaining ferry systems"
    },
    iconName: "AlertTriangle",
    themeColor: "orange"
  }
];
