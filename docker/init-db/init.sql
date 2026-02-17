-- DocAssist Database Initialization
-- Creates schemas and enables pgvector extension

-- Create schemas for each microservice
CREATE SCHEMA IF NOT EXISTS auth_db;
CREATE SCHEMA IF NOT EXISTS document_db;
CREATE SCHEMA IF NOT EXISTS ai_db;

-- Enable pgvector extension for AI service
CREATE EXTENSION IF NOT EXISTS vector;

-- Grant permissions
GRANT ALL ON SCHEMA auth_db TO docassist;
GRANT ALL ON SCHEMA document_db TO docassist;
GRANT ALL ON SCHEMA ai_db TO docassist;
