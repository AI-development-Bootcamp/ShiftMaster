# Environment Variables

This document describes all environment variables required for the server application.

## Required Variables

### JWT_SECRET (REQUIRED)

**Description:** Secret key used for signing and verifying JWT tokens.

**Type:** String

**Security:** This must be a strong, random string of at least 256 bits (32 characters). Never commit the actual secret to version control.

**Example generation:**

```bash
openssl rand -base64 32
```

**Example:**

```
JWT_SECRET=your-secret-key-here-change-this-in-production
```

### SUPABASE_URL (REQUIRED)

**Description:** Your Supabase project URL.

**Example:**

```
SUPABASE_URL=https://your-project.supabase.co
```

### SUPABASE_ANON_KEY (REQUIRED)

**Description:** Your Supabase anonymous/public API key.

**Example:**

```
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Optional Variables

### PORT

**Description:** Port number for the server to listen on.

**Default:** `3000`

**Example:**

```
PORT=3000
```

### DATABASE_URL

**Description:** PostgreSQL database connection string.

**Default:** Empty string

**Example:**

```
DATABASE_URL=postgresql://user:password@localhost:5432/shiftmaster
```

### JWT_EXPIRY

**Description:** JWT token expiration time. Supports formats like '24h', '7d', '60m'.

**Default:** `24h` (24 hours)

**Example:**

```
JWT_EXPIRY=24h
```

### CORS_ORIGINS

**Description:** Comma-separated list of allowed CORS origins.

**Default:** `http://localhost:5173,http://localhost:5174`

**Example:**

```
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://yourdomain.com
```

### NODE_ENV

**Description:** Node environment (development, production, test).

**Default:** Not set

**Example:**

```
NODE_ENV=development
```

## Example .env File

Create a `.env` file in the `server` directory with the following content:

```bash
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/shiftmaster
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Authentication (REQUIRED)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRY=24h

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Node Environment
NODE_ENV=development
```

## Validation

The server will validate required environment variables at startup and throw an error if they are missing:

- `JWT_SECRET` - Required for authentication
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` - Required for database access (validated in `src/db/supabase.ts`)

## Security Best Practices

1. **Never commit `.env` files** - They are excluded by `.gitignore`
2. **Use strong random secrets** - Generate JWT_SECRET with cryptographically secure methods
3. **Rotate secrets regularly** - Change JWT_SECRET periodically in production
4. **Different secrets per environment** - Use different JWT_SECRET values for development, staging, and production
5. **Store secrets securely** - Use environment variable management tools (e.g., AWS Secrets Manager, HashiCorp Vault) in production
