# Proposal: Implement Tag and MultiTags Components

## Summary
Implement `Tag` and `MultiTags` components for the admin application.

## Motivation
The admin interface requires standardized components for displaying users and groups of users (e.g., in assignment lists). Currently, there is no unified `Tag` or `MultiTags` component, leading to potential inconsistency and code duplication.

## Scope
### In Scope
- CSS Design Tokens
- `Tag` Component
- `MultiTags` Component
- Tooltip for MultiTags

## Why
Building standardized and reusable UI components ensures consistency across the application and speeds up future development. These components are needed for the upcoming assignment features.

## What Changes
*   **[NEW]** `Tag` component
*   **[NEW]** `MultiTags` component
*   **[MOD]** Global CSS variables
