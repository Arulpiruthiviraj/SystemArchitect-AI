export const CHALLENGES = [
  {
    id: 'c1',
    title: 'Design a Pastebin',
    category: 'Beginner',
    description: 'Design a system like Pastebin where users can enter a piece of text and get a randomly generated URL to access it.',
    requirements: [
      'Users should be able to paste text and get a unique URL.',
      'Text and links should optionally expire after a specific time.',
      'The system should be highly available.'
    ],
    constraints: [
      '10 million new pastes per month.',
      '10:1 read to write ratio.'
    ],
    hints: [
      'How will you generate unique URLs? Base62 encoding is a good start.',
      'Since reads are 10x writes, how can you speed them up? (Think caching).',
      'What database is best for storing billions of small text blobs?'
    ]
  },
  {
    id: 'c2',
    title: 'Design an E-commerce Checkout System',
    category: 'Intermediate',
    description: 'Design the backend architecture for a high-traffic e-commerce checkout flow.',
    requirements: [
      'Users should be able to add items to a cart.',
      'Users must be able to securely checkout and pay.',
      'Inventory must be accurately deducted (no overselling).'
    ],
    constraints: [
      'Must handle massive traffic spikes (e.g., Black Friday).',
      'Zero tolerance for dropped orders or double charging.'
    ],
    hints: [
      'What type of database guarantees ACID properties for payments?',
      'How can you decouple the order taking process from the slow payment processing? (Think queues).',
      'Where should the shopping cart be stored before checkout to remain fast?'
    ]
  },
  {
    id: 'c3',
    title: 'Design Netflix Video Streaming',
    category: 'Advanced',
    description: 'Design a global video streaming platform like Netflix or YouTube.',
    requirements: [
      'Users can search for videos.',
      'Users can stream videos smoothly globally.',
      'The system tracks watch history.'
    ],
    constraints: [
      'Petabytes of video data.',
      'Must minimize buffering regardless of user location.'
    ],
    hints: [
      'You cannot serve video files from a central database. What networking component is essential here?',
      'How do you handle searching through millions of titles quickly?',
      'How do you ingest and process the videos into different resolutions?'
    ]
  }
];
