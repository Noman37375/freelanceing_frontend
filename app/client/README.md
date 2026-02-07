# Client Role Components

Complete React Native components for the client role of a freelancing platform.

## Components

### Main Screens

#### ClientHome.tsx
Main dashboard for clients featuring:
- Logout button (top right)
- Overview stats (Projects, Total Spent, Messages, Disputes)
- Quick Actions section (Post Project, Find Freelancers)
- Recent Projects list

#### Wallet.tsx
Wallet and escrow management:
- Total balance display
- Available funds vs. funds in escrow
- Transaction history with status indicators
- Add funds and withdraw actions
- Escrow information box

#### Projects.tsx
Project list and management:
- Search and filter functionality
- Project statistics (Total, Active, Completed, Pending)
- List of all projects with status badges
- Add new project button

#### ProjectDetail.tsx
Detailed view of a specific project:
- Project information (budget, deadline, status)
- Freelancer details with messaging option
- Project description
- Milestone timeline with status tracking
- Action buttons (Request Changes, Raise Dispute)

#### Freelancers.tsx
Browse and search for freelancers:
- Search bar with filter options
- Filter chips (All, Top Rated, Available, New)
- Freelancer cards with:
  - Profile information
  - Ratings and reviews
  - Hourly rate
  - Location and completed projects
  - Skills badges
  - Availability indicator
  - View Profile button

#### Disputes.tsx
List of all disputes raised by the client:
- Status statistics (Pending, Approved, Denied)
- Information banner about review time
- Dispute cards with:
  - Project and freelancer info
  - Dispute reason
  - Amount and date
  - Status badge
- Raise New Dispute button

#### DisputeDetail.tsx
Detailed view of a specific dispute:
- Status card with current status
- Project information summary
- Dispute reason and description
- Submitted evidence list with types (documents, images, messages)
- Add more evidence option
- Admin review section with decision (if available)
- Action buttons (Contact Support, Withdraw Dispute)

### Reusable Components

#### StatsCard.tsx
Reusable statistics card component:
```typescript
<StatsCard
  title="Projects"
  value="12"
  icon={Briefcase}
  iconColor="#282A32"
/>
```

#### ProjectCard.tsx
Reusable project card component:
```typescript
<ProjectCard
  title="Mobile App UI/UX Design"
  budget="$2,500"
  status="In Progress"
  freelancer="Sarah Johnson"
  deadline="Dec 20, 2025"
  onPress={() => {}}
/>
```

## Usage

Import components individually:
```typescript
import ClientHome from '@/components/client/ClientHome';
import Wallet from '@/components/client/Wallet';
```

Or use the index file:
```typescript
import { ClientHome, Wallet, Projects } from '@/components/client';
```

## Data Structure

All components use static placeholder data. Key interfaces:

### Project
```typescript
{
  id: string;
  title: string;
  budget: string;
  status: 'Active' | 'Completed' | 'In Progress' | 'Pending';
  freelancer?: string;
  deadline: string;
}
```

### Milestone
```typescript
{
  id: string;
  title: string;
  description: string;
  amount: string;
  status: 'completed' | 'in-progress' | 'pending';
  dueDate: string;
}
```

### Dispute
```typescript
{
  id: string;
  projectTitle: string;
  freelancerName: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
  createdDate: string;
  amount: string;
}
```

### Freelancer
```typescript
{
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  location: string;
  skills: string[];
  completedProjects: number;
  availability: 'Available' | 'Busy' | 'Not Available';
}
```

## Design System

### Colors
- Primary Blue: `#282A32`
- Danger Red: `#EF4444`
- Success Green: `#10B981`
- Warning Yellow: `#F59E0B`
- Neutral Gray: `#6B7280`
- Dark Gray: `#1F2937`
- Light Gray: `#F3F4F6`
- White: `#FFFFFF`

### Typography
- Titles: 18-24px, font-weight 700
- Subtitles: 16-18px, font-weight 600
- Body: 14px, font-weight 500
- Small: 12-13px, font-weight 500

### Spacing
- Section padding: 20px
- Card padding: 16-20px
- Border radius: 12-16px
- Gap between elements: 8-12px

### Icons
All icons use `lucide-react-native` with default size 20-24px and strokeWidth 2.

## Notes

- All buttons are visual only (no navigation)
- No API calls (static data only)
- TypeScript strict mode compatible
- Uses StyleSheet.create for all styles
- ScrollView for all main screens
- Professional shadows and elevation for cards
- Consistent spacing and alignment throughout
