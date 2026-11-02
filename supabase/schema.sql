-- Broken Design — Comprehensive PostgreSQL Schema (Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enums (เพิ่ม 'admin' สำหรับบทบาทแอดมิน)
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'creator', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE license_type AS ENUM ('CC0', 'CC-BY', 'CC-BY-NC', 'COMMERCIAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE purchase_status AS ENUM ('pending', 'paid'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Users Table (เพิ่ม is_seller และ suspended_at ตาม README)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    is_seller BOOLEAN NOT NULL DEFAULT FALSE,
    suspended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Models Table (เพิ่ม hidden_at สำหรับแอดมินซ่อนโมเดล)
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    tags TEXT[] NOT NULL DEFAULT '{}',
    license license_type NOT NULL DEFAULT 'CC0',
    file_hash CHAR(64) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    preview_hash CHAR(64),
    poster_hash CHAR(64),
    price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    view_count BIGINT NOT NULL DEFAULT 0,
    download_count BIGINT NOT NULL DEFAULT 0,
    hidden_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_tags ON models USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_models_owner ON models (owner_id);
CREATE INDEX IF NOT EXISTS idx_models_active ON models (created_at DESC) WHERE deleted_at IS NULL AND hidden_at IS NULL;

-- 4. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE RESTRICT,
    status purchase_status NOT NULL DEFAULT 'pending',
    provider_session_id VARCHAR(255) UNIQUE,
    embed_key VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_embed_key ON purchases (embed_key);

-- 5. Likes Table / Favorites
CREATE TABLE IF NOT EXISTS likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, model_id)
);

-- 6. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_model_id ON comments (model_id);