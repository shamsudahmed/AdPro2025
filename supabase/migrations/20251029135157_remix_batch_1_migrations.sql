
-- Migration: 20251028132018

-- Migration: 20251027175117

-- Migration: 20251027083031
-- Create table for storing user creations
CREATE TABLE IF NOT EXISTS public.creations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Create index for faster expiration queries
CREATE INDEX idx_creations_expires_at ON public.creations(expires_at);

-- Function to delete expired creations
CREATE OR REPLACE FUNCTION delete_expired_creations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.creations WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- No RLS needed as this is a public demo app without user authentication;

-- Migration: 20251027083138
-- Fix security issues for creations table

-- Update function with proper search_path
CREATE OR REPLACE FUNCTION delete_expired_creations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.creations WHERE expires_at < now();
END;
$$;

-- Enable RLS on creations table
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (since this is a demo app without auth)
CREATE POLICY "Allow public read access to creations"
ON public.creations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert access to creations"
ON public.creations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public delete of expired creations"
ON public.creations
FOR DELETE
TO public
USING (expires_at < now());


-- Migration: 20251027180055
-- Create creations table for saving advertisement images temporarily
CREATE TABLE IF NOT EXISTS public.creations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_creations_expires_at ON public.creations(expires_at);
CREATE INDEX IF NOT EXISTS idx_creations_created_at ON public.creations(created_at DESC);

-- Create function to delete expired creations
CREATE OR REPLACE FUNCTION public.delete_expired_creations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.creations WHERE expires_at < now();
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.creations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view, create, delete their own creations)
CREATE POLICY "Anyone can view creations"
ON public.creations
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create creations"
ON public.creations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete creations"
ON public.creations
FOR DELETE
USING (true);

