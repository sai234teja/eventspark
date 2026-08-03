-- Migration: 20260707000000_baseline_schema.sql
-- Description: Core baseline schema for EventSpark

CREATE EXTENSION IF NOT EXISTS pgcrypto;

---------------------------------------------------------
-- 0. Profiles
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- 1. Venues & Categories
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.venues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  city text,
  country text,
  capacity integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL
);

---------------------------------------------------------
-- 2. Events Core
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.event_categories(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- 3. Ticketing Core
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  capacity integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- 4. Commerce Core
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending',
  payment_method text,
  provider_reference text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
