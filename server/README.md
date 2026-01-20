# AbraShiftMaster Server

This is the backend service for the AbraShiftMaster application.

## Database Setup

This project uses Supabase as the database provider.

### Environment Variables

Ensure your `.env` file is configured with the following:

```bash
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key
```

### Migrations

Database schema changes are managed via SQL migration files located in `src/db/migrations`.

To apply pending migrations to your configured database:

```bash
npm run db:migrate
```

### Seed Data

To populate the database with initial development data (Admin user, dummy clients/projects):

```bash
npm run seed:dev
```

**Note:** This script attempts to avoid duplicates but does not reset the database.

## Architecture

### Repository Pattern

Data access is abstracted using the Repository pattern located in `src/db/repositories`.
- **Entities**: TypeScript interfaces mirroring the database tables (`src/db/types/entities.ts`).
- **Repositories**: Classes encapsulating data access logic (e.g., `UserRepository`, `ProjectRepository`).

Usage example:
```typescript
import { userRepository } from '../db/repositories';

const user = await userRepository.findByEmail('test@example.com');
```

## Testing

Unit tests are located in `src/tests`.

To run tests:
```bash
npm test
```
