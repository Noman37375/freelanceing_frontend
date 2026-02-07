// App Configuration
export const APP_CONFIG = {
  name: 'FreelanceHub',
  version: '1.0.0',
  description: 'Professional Freelancing Marketplace',
  supportEmail: 'support@freelancehub.com',
  websiteUrl: 'https://freelancehub.com',
};

// API Configuration
export const API_CONFIG = {
  baseUrl: 'https://api.freelancehub.com/v1',
  timeout: 30000,
  retryAttempts: 3,
};

// Theme Colors — palette: E5E4EA, F4F4F8, 282A32, 444751, C2C2C8
export const COLORS = {
  primary: '#282A32',
  primaryDark: '#282A32',
  primaryLight: '#444751',
  secondary: '#444751',
  secondaryDark: '#282A32',
  secondaryLight: '#C2C2C8',
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentLight: '#FBBF24',
  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#F87171',
  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',
  info: '#282A32',
  infoDark: '#282A32',
  infoLight: '#444751',

  // Palette neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F4F4F8',
  gray100: '#F4F4F8',
  gray200: '#E5E4EA',
  gray300: '#C2C2C8',
  gray400: '#C2C2C8',
  gray500: '#444751',
  gray600: '#444751',
  gray700: '#444751',
  gray800: '#282A32',
  gray900: '#282A32',

  // Background Colors
  background: '#F4F4F8',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text Colors
  textPrimary: '#282A32',
  textSecondary: '#444751',
  textTertiary: '#C2C2C8',
  textInverse: '#FFFFFF',
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadow
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 10,
  },
};

// Project Categories
export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Data Science',
  'DevOps',
  'Quality Assurance',
  'Project Management',
  'Consulting',
  'Other',
];

// Skills Database
export const SKILLS = {
  'Web Development': [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask',
    'Ruby on Rails', 'Laravel', 'PHP', 'JavaScript', 'TypeScript', 'HTML5',
    'CSS3', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS', 'jQuery',
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Objective-C',
    'Xamarin', 'Ionic', 'Cordova', 'Unity', 'Android SDK', 'iOS SDK',
  ],
  'UI/UX Design': [
    'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Principle', 'Framer',
    'Zeplin', 'Marvel', 'Balsamiq', 'Wireframing', 'Prototyping',
    'User Research', 'Usability Testing',
  ],
  'Graphic Design': [
    'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Canva',
    'CorelDRAW', 'GIMP', 'Logo Design', 'Brand Identity', 'Print Design',
    'Web Design', 'Packaging Design',
  ],
  'Content Writing': [
    'Blog Writing', 'Copywriting', 'Technical Writing', 'SEO Writing',
    'Social Media Content', 'Email Marketing', 'Product Descriptions',
    'Press Releases', 'Grant Writing',
  ],
  'Digital Marketing': [
    'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Social Media Marketing',
    'Email Marketing', 'Content Marketing', 'Influencer Marketing',
    'Analytics', 'Conversion Optimization',
  ],
  'Data Science': [
    'Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'TensorFlow',
    'PyTorch', 'Pandas', 'NumPy', 'Matplotlib', 'Tableau', 'Power BI',
    'Data Visualization', 'Statistical Analysis',
  ],
};

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' },
];

// Project Duration Options
export const PROJECT_DURATIONS = [
  { value: 'less_than_1_month', label: 'Less than 1 month' },
  { value: '1_3_months', label: '1-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: 'more_than_6_months', label: 'More than 6 months' },
];

// Budget Ranges
export const BUDGET_RANGES = [
  { value: '0-500', label: '$0 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2500', label: '$1,000 - $2,500' },
  { value: '2500-5000', label: '$2,500 - $5,000' },
  { value: '5000-10000', label: '$5,000 - $10,000' },
  { value: '10000+', label: '$10,000+' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card', icon: 'credit-card' },
  { value: 'debit_card', label: 'Debit Card', icon: 'credit-card' },
  { value: 'bank_account', label: 'Bank Account', icon: 'building-2' },
  { value: 'paypal', label: 'PayPal', icon: 'wallet' },
];

// Dispute Reasons
export const DISPUTE_REASONS = [
  { value: 'quality_issues', label: 'Quality Issues' },
  { value: 'missed_deadline', label: 'Missed Deadline' },
  { value: 'scope_creep', label: 'Scope Creep' },
  { value: 'payment_delay', label: 'Payment Delay' },
  { value: 'communication_issues', label: 'Communication Issues' },
  { value: 'breach_of_contract', label: 'Breach of Contract' },
  { value: 'intellectual_property', label: 'Intellectual Property' },
  { value: 'other', label: 'Other' },
];

// Notification Types
export const NOTIFICATION_TYPES = {
  PROJECT_UPDATE: 'project_update',
  NEW_MESSAGE: 'new_message',
  PAYMENT_RECEIVED: 'payment_received',
  MILESTONE_APPROVED: 'milestone_approved',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  DISPUTE_OPENED: 'dispute_opened',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
};

// File Upload Limits
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  maxFiles: 5,
};

// Validation Rules
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
};

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM DD, YYYY',
  displayWithTime: 'MMM DD, YYYY HH:mm',
  api: 'YYYY-MM-DD',
  apiWithTime: 'YYYY-MM-DD HH:mm:ss',
};

// Pagination
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  PROJECTS: 'projects',
  WALLET_BALANCE: 'wallet_balance',
  NOTIFICATIONS: 'notifications',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timeout. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  PROJECT_CREATED: 'Project created successfully!',
  PROPOSAL_SUBMITTED: 'Proposal submitted successfully!',
  PAYMENT_COMPLETED: 'Payment completed successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
};