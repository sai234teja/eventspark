-- Phase 6 User Platform: Reviews, Collections, Calendar Syncs

-- 1. User Reviews
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    reported BOOLEAN DEFAULT false,
    organizer_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_user_reviews_event_id ON user_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);

-- 2. User Collections (Wishlist Folders)
CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);

CREATE TABLE IF NOT EXISTS user_collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(collection_id, event_id)
);
CREATE INDEX IF NOT EXISTS idx_user_collection_items_collection_id ON user_collection_items(collection_id);

-- 3. Calendar Sync Preferences
CREATE TABLE IF NOT EXISTS user_calendar_syncs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')),
    sync_enabled BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider)
);
CREATE INDEX IF NOT EXISTS idx_user_calendar_syncs_user_id ON user_calendar_syncs(user_id);

-- RLS Policies
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_syncs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reviews" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for events they attended" ON user_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own reviews" ON user_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON user_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own collections" ON user_collections FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can manage own collections" ON user_collections FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view collection items" ON user_collection_items FOR SELECT USING (true);
CREATE POLICY "Users can manage own collection items" ON user_collection_items FOR ALL USING (
    EXISTS (SELECT 1 FROM user_collections WHERE id = collection_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage own calendar syncs" ON user_calendar_syncs FOR ALL USING (auth.uid() = user_id);
