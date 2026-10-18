// Profile content. Everything here comes from Riti's résumé or was verified
// against a public URL — see README "Content sources".

export const PROFILE = {
  name: 'Riti Shah',
  email: 'ritishahp@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ritishahp/',
  github: 'https://github.com/ritipshah',
  githubHandle: 'ritipshah',
};

export const EDUCATION = {
  degree: 'B.Tech (Integrated), Data Science',
  school: "SVKM's NMIMS Mukesh Patel School of Technology Management & Engineering",
  city: 'Mumbai',
  graduation: 'May 2028',
  cgpa: '3.83 / 4.00',
  coursework: [
    'Data Structures & Algorithms',
    'Machine Learning',
    'Database Management Systems',
    'Statistics',
    'Web Development',
    'Calculus',
  ],
};

// `seenIn` links a tool to project indices only where the project's own code
// or requirements files confirm it.
export const TOOLKIT = [
  {
    id: 'prog',
    label: 'Programming',
    tools: [
      { name: 'Python', seenIn: ['02', '03'] },
      { name: 'C++' },
      { name: 'JavaScript', seenIn: ['01', '02'] },
    ],
  },
  {
    id: 'ml',
    label: 'Data science & ML',
    tools: [
      { name: 'NumPy', seenIn: ['03'] },
      { name: 'Pandas', seenIn: ['03'] },
      { name: 'Scikit-learn', seenIn: ['03'] },
      { name: 'SciPy' },
    ],
  },
  {
    id: 'viz',
    label: 'Visualization & analytics',
    tools: [{ name: 'Tableau' }, { name: 'Power BI' }, { name: 'Matplotlib' }, { name: 'Seaborn' }],
  },
  {
    id: 'web',
    label: 'Web development',
    tools: [{ name: 'React.js' }, { name: 'Next.js' }],
  },
  {
    id: 'db',
    label: 'Databases',
    tools: [{ name: 'PostgreSQL' }, { name: 'MySQL', seenIn: ['01', '02'] }],
  },
  {
    id: 'tools',
    label: 'Tools',
    tools: [
      { name: 'GitHub', seenIn: ['01', '02', '03'] },
      { name: 'Jupyter Notebook' },
      { name: 'Google Colab' },
      { name: 'VS Code' },
    ],
  },
];

export const EXPERIENCE = [
  {
    role: 'Volunteer Educator',
    org: 'Bharat Vikas Parishad',
    place: 'Mumbai',
    dates: 'May – Jul 2025',
    body: 'Taught basic academic concepts and problem-solving to school students from underprivileged backgrounds. Regular contact with students built communication and mentoring skills.',
  },
  {
    role: 'Production / Manufacturing Intern',
    org: 'CR Meditech',
    place: 'Vadodara',
    dates: 'Jun – Jul 2024',
    body: 'Practical exposure to production in a medical-device setting — observing assembly, quality checks and packaging, and how work moves between those stages.',
  },
];

export const CERTIFICATIONS = [
  {
    title: 'Data Analytics Job Simulation',
    issuer: 'Deloitte · Forage',
    dates: 'Feb 2026',
    body: 'Practical tasks in data analysis and forensic technology.',
  },
  {
    title: 'Introduction to Machine Learning',
    issuer: 'NPTEL · IIT Kharagpur',
    dates: 'Jul – Sep 2025',
    body: 'Eight-week course on core ML algorithms and model evaluation.',
  },
];

// Interests, as listed in Riti's brief for this site.
export const INTERESTS = [
  'Artificial intelligence',
  'Machine learning',
  'Natural language processing',
  'Intelligent systems',
  'Analytical problem-solving',
];

// Portrait supplied by Riti; cropped only (see scripts/process-images.mjs).
export const PORTRAIT = {
  src: '/images/portrait/riti-shah.webp',
  w: 301,
  h: 376,
  alt: 'Portrait of Riti Shah, smiling, in a checked blazer against a dark curtain',
};
