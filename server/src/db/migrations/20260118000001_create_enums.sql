-- Migration: Create database enums
-- Created: 2026-01-18
-- Description: Create all enum types for the database schema

-- User role enum
CREATE TYPE user_role AS ENUM ('admin', 'regular');

-- Project time format enum
CREATE TYPE project_time_format_type AS ENUM ('sum', 'start_end');

-- Entry kind enum
CREATE TYPE entry_kind AS ENUM ('work', 'absence');

-- Absence type enum
CREATE TYPE absence_type AS ENUM ('sick', 'vacation', 'vacation_partial', 'reserve', 'other');

-- Work location enum
CREATE TYPE work_location AS ENUM ('Office', 'Client', 'Home');
