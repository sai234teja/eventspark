-- Phase 7.1.5: Analytics Performance Indexes

-- Index for tenant_analytics_summary upcoming/completed filters
CREATE INDEX IF NOT EXISTS idx_events_org_status 
ON events(organization_id, status);

-- Index for registration_trend_analytics
CREATE INDEX IF NOT EXISTS idx_registrations_org_date 
ON registrations(organization_id, created_at);

-- Index for revenue_trend_analytics
CREATE INDEX IF NOT EXISTS idx_payments_org_status_date 
ON payments(organization_id, status, created_at);

-- Additional covering index for event_analytics joins
CREATE INDEX IF NOT EXISTS idx_registrations_event_id 
ON registrations(event_id);

-- Additional index for event analytics date filtering
CREATE INDEX IF NOT EXISTS idx_events_org_date 
ON events(organization_id, start_date);
