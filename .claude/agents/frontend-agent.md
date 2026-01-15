# Frontend Development Agent

## Purpose
Specialized guidance for developing the Client (mobile PWA) and Admin (web) frontends.

## Plugin Integration

### When User Requests UI Components
When the user asks for a new component or UI element, use the **frontend-design skill** to generate polished, production-grade code. Then integrate it following this agent's guidelines (directory structure, Redux, API, testing).

### When User Requests Complex Features
Before implementing multi-component features:
- Use **code-explorer agent** to understand existing patterns in the codebase
- Use **code-architect agent** to plan the feature architecture
- Then proceed with implementation

### When to Use Each Agent
- **code-explorer**: User wants to understand existing code or you need to learn patterns before implementing
- **code-architect**: User wants a feature that spans multiple files/components and needs architectural planning
- **feature-dev**: User wants end-to-end feature development across frontend, backend, and database
- **frontend-design**: User wants a specific UI component with good design quality

## Critical Rules

### Separation of Concerns
- **Client** (`/client`) - Mobile-first PWA for employees
- **Admin** (`/admin`) - Web-based dashboard for managers
- **Never share state** between client and admin
- **Separate Redux stores** - Each frontend has its own independent store

### Mobile-First (Client)
- Design for mobile screens first
- Touch-friendly UI elements (min 44x44px tap targets)
- Test on mobile viewports (320px, 375px, 414px)
- Use responsive CSS (plain CSS, no frameworks)
- Progressive Web App features (service worker, manifest)

### Admin Interface
- Desktop-first layouts acceptable
- Data tables and complex forms
- Bulk operations and reports
- Admin-only API endpoints

## Project Structure

### Client Structure
```
/client/
  /src/
    /components/      # Reusable UI components
    /pages/          # Route-level page components
    /store/          # Redux store (slices, actions, selectors)
    /hooks/          # Custom React hooks
    /assets/         # Images, icons, fonts
    /constants/      # App constants
    /styles/         # CSS files
    /utils/          # Utility functions
  package.json
  vite.config.ts     # Port 5173
  tsconfig.json
```

### Admin Structure
```
/admin/
  /src/
    /components/      # Reusable UI components
    /pages/          # Route-level page components
    /store/          # Redux store (separate from client)
    /hooks/          # Custom React hooks
    /assets/         # Images, icons, fonts
    /constants/      # App constants
    /styles/         # CSS files
    /utils/          # Utility functions
  package.json
  vite.config.ts     # Port 5174
  tsconfig.json
```

## Development Workflow

### Before Starting
1. Identify: Client or Admin?
2. Check if component/feature exists
3. Review relevant API endpoints in project.md
4. Plan state management needs

### Component Development
1. Create component in `/components` or `/pages`
2. Use TypeScript with proper types from `/shared/types`
3. Import shared utilities from `/shared` package
4. Style with plain CSS in component-specific file
5. Write tests alongside component (`ComponentName.test.tsx`)

### State Management (Redux Toolkit)
1. Create slice in `/store/slices/`
2. Define state shape with TypeScript
3. Use createSlice from Redux Toolkit
4. Export actions and selectors
5. Configure in store.ts

### API Integration
1. Use shared API client from `/shared/api`
2. Handle loading, success, and error states
3. Use Redux Toolkit Query or thunks for async operations
4. Show user-friendly error messages

### Styling Guidelines
- Plain CSS only (no Tailwind, no CSS-in-JS)
- Mobile-first media queries for client
- CSS custom properties for theming
- BEM or consistent naming convention
- Responsive units (rem, em, %, vw, vh)

## Common Patterns

### Authentication Flow
```typescript
// Use JWT from localStorage
// Redirect to login if unauthorized
// Show loading state during auth check
```

### Form Handling
```typescript
// Controlled components
// Validation before submit
// Show validation errors inline
// Disable submit during processing
```

### Data Fetching
```typescript
// Show loading spinner
// Handle errors gracefully
// Cache when appropriate
// Refresh on focus/mount if needed
```

### Routing
```typescript
// React Router v6
// Protected routes for authenticated users
// Role-based routing for admin
```

## Testing

### Unit Tests
- Test components in isolation
- Mock Redux store and API calls
- Test user interactions
- Verify rendering with different props

### Integration Tests
- Test connected components with Redux
- Verify API integration
- Test routing and navigation

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:3000/api/v1
```

### Admin (.env)
```
VITE_API_URL=http://localhost:3000/api/v1
```

## Common Issues

### Import Errors from /shared
- Ensure /shared is built: `npm run build -w shared`
- Check workspace dependencies in package.json

### Port Conflicts
- Client runs on 5173
- Admin runs on 5174
- Change in vite.config.ts if needed

### Redux State Not Updating
- Check action creators are dispatched
- Verify reducer is registered in store
- Use Redux DevTools for debugging

## Checklist for New Features

- [ ] Identify client vs admin
- [ ] Create component files with TypeScript
- [ ] Add Redux slice if state needed
- [ ] Integrate with API endpoints
- [ ] Add mobile-responsive styles (client)
- [ ] Write component tests
- [ ] Test on mobile viewport (client)
- [ ] Update routes if new page
- [ ] Verify error handling
- [ ] Check loading states
