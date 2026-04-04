# Dashboard Component Structure

This folder contains all dashboard-related components organized for maximum reusability between student and teacher dashboards.

## Folder Structure

```
dashboard/
├── shared/                    # Shared components used by both students and teachers
│   ├── DashboardSidebar.tsx  # Navigation sidebar
│   └── notifications/        # Notification-related components
│       ├── index.ts          # Barrel export file
│       ├── NotificationCard.tsx
│       ├── NotificationModal.tsx
│       ├── NotificationFilters.tsx
│       ├── NotificationsList.tsx
│       └── notificationConfig.ts
├── views/                     # Main view components (generic, reusable)
│   ├── index.ts              # Barrel export file
│   ├── DashboardView.tsx     # Main dashboard overview
│   ├── NotificationsView.tsx # Notifications page
│   └── SettingsView.tsx      # Settings page
└── studentDashboard/         # Student-specific components (legacy)
  ├── HistoryView.tsx
  ├── NotificationsView.tsx
  ├── SettingsView.tsx
    ├── StudentCoursesView.tsx
    ├── StudentDashboardView.tsx  # ⚠️ Deprecated - use DashboardView
    └── TopUpModal.tsx
```

## Component Usage

### Views (Generic Components)

These components accept a `userType` prop ('student' | 'teacher') and work for both user types:

#### DashboardView

```tsx
import { DashboardView } from '@/components/dashboard/views';

<DashboardView
  user={user}
  userData={userData}
  lessons={lessons}
  topicsArr={topicsArr}
  userType='student' // or "teacher"
/>;
```

#### NotificationsView

```tsx
import { NotificationsView } from '@/components/dashboard/views';

<NotificationsView
  userId={user.uid}
  userType='student' // or "teacher"
/>;
```

#### SettingsView

```tsx
import { SettingsView } from '@/components/dashboard/views';

<SettingsView
  email={user.email}
  userData={userData}
  capitalNames={capitalNames}
  userType='student' // or "teacher"
/>;
```

### Shared Notification Components

These can be imported individually or as a group:

```tsx
import {
  NotificationCard,
  NotificationModal,
  NotificationFilters,
  NotificationsList,
  iconMap,
  colorMap,
} from '@/components/dashboard/shared/notifications';
```

## Migration Guide

### For Student Dashboard

The StudentDashboard.tsx already uses the new views:

- ✅ Uses `DashboardView` instead of `StudentDashboardView`
- ✅ Uses `NotificationsView` directly
- ✅ Uses `SettingsView` directly

### For Teacher Dashboard (Coming Soon)

When implementing the teacher dashboard:

1. Create `TeacherDashboard.tsx` in `src/pages/`
2. Import views from `@/components/dashboard/views`
3. Pass `userType="teacher"` to all view components
4. Use the shared `DashboardSidebar` component
5. Fetch data from `teachers` collection instead of `users`

Example:

```tsx
import {
  DashboardView,
  NotificationsView,
  SettingsView,
} from '@/components/dashboard/views';

export const TeacherDashboard = () => {
  // ... setup code ...

  return (
    <DashboardView
      user={user}
      userData={teacherData}
      lessons={lessons}
      topicsArr={topicsArr}
      userType='teacher'
    />
  );
};
```

## Benefits of This Structure

1. **Code Reusability**: Same components work for students and teachers
2. **Maintainability**: Changes in one place affect both dashboards
3. **Consistency**: Ensures UI/UX consistency across user types
4. **Scalability**: Easy to add more user roles in the future
5. **Organization**: Clear separation of concerns

## Notes

- The `studentDashboard/` folder contains legacy components that will eventually be removed
- All new features should be added to the generic `views/` components
- Student-specific features (like TopUpModal) remain in `studentDashboard/`
- Teacher-specific features should go in a new `teacherDashboard/` folder
