# Frontend Admin

## ADDED Requirements

### Requirement: Web-Based Admin Application

The admin application SHALL be a web-based application built with React, Vite, and TypeScript.

#### Scenario: Application initialization

- **WHEN** the admin app is started
- **THEN** it runs on port 5174 and renders without errors

#### Scenario: Web-optimized interface

- **WHEN** viewing the admin application
- **THEN** the interface is optimized for desktop/web browsers

### Requirement: React and Vite Setup

The admin SHALL use Vite as the build tool with React and TypeScript.

#### Scenario: Development server

- **WHEN** running npm run dev in /admin
- **THEN** Vite starts the development server with hot module replacement

#### Scenario: Production build

- **WHEN** running npm run build in /admin
- **THEN** Vite creates an optimized production bundle

### Requirement: Redux State Management

The admin SHALL use Redux Toolkit for state management with a store independent from the client application.

#### Scenario: Store initialization

- **WHEN** the admin app starts
- **THEN** the Redux store is created and available to all components

#### Scenario: Store independence

- **WHEN** examining the admin Redux store
- **THEN** it has no shared state with the client application

### Requirement: Directory Structure

The admin SHALL organize code into components, pages, store, styles, and utils directories.

#### Scenario: Standard structure

- **WHEN** viewing /admin/src
- **THEN** components/, pages/, store/, styles/, and utils/ directories exist

### Requirement: Routing Setup

The admin SHALL use React Router for navigation.

#### Scenario: Router configuration

- **WHEN** the app initializes
- **THEN** React Router is configured and ready for route definitions

### Requirement: Styling with Plain CSS

The admin SHALL use plain CSS files for styling.

#### Scenario: CSS reset

- **WHEN** the app loads
- **THEN** a CSS reset is applied for consistent cross-browser styling

### Requirement: Testing Configuration

The admin SHALL use Vitest for unit and integration testing.

#### Scenario: Test execution

- **WHEN** running npm test in /admin
- **THEN** Vitest executes all test files

#### Scenario: Test file convention

- **WHEN** creating new tests
- **THEN** they follow the _.test.ts or _.test.tsx naming pattern

### Requirement: Environment Variables

The admin SHALL load the VITE_API_URL environment variable for backend API communication.

#### Scenario: API URL configuration

- **WHEN** the admin makes API requests
- **THEN** it uses the URL from VITE_API_URL environment variable

### Requirement: UI Independence

The admin application SHALL have a completely separate UI implementation from the client application.

#### Scenario: Separate components

- **WHEN** examining admin components
- **THEN** they are not shared with the client application
