-- Phase 7.1: Analytics Database Views

-- 1. Tenant Analytics Summary
CREATE OR REPLACE VIEW tenant_analytics_summary WITH (security_invoker = true) AS
SELECT
    o.id AS organization_id,
    COUNT(DISTINCT e.id) AS total_events,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status != 'completed') AS upcoming_events,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') AS completed_events,
    (SELECT COUNT(*) FROM registrations r WHERE r.organization_id = o.id) AS total_registrations,
    (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.organization_id = o.id AND p.status = 'succeeded') AS total_revenue
FROM organizations o
LEFT JOIN events e ON o.id = e.organization_id
GROUP BY o.id;

-- 2. Revenue Trend Analytics (Time-series)
CREATE OR REPLACE VIEW revenue_trend_analytics WITH (security_invoker = true) AS
SELECT
    organization_id,
    DATE_TRUNC('day', created_at) AS date,
    SUM(amount) AS revenue,
    COUNT(id) AS payments_count
FROM payments
WHERE status = 'succeeded'
GROUP BY organization_id, DATE_TRUNC('day', created_at);

-- 3. Registration Trend Analytics (Time-series)
CREATE OR REPLACE VIEW registration_trend_analytics WITH (security_invoker = true) AS
SELECT
    organization_id,
    DATE_TRUNC('day', created_at) AS date,
    COUNT(id) AS registration_count
FROM registrations
GROUP BY organization_id, DATE_TRUNC('day', created_at);

-- 4. Event Analytics
CREATE OR REPLACE VIEW event_analytics WITH (security_invoker = true) AS
SELECT
    e.id AS event_id,
    e.organization_id,
    e.title,
    e.category_id,
    e.start_date,
    e.status,
    COUNT(DISTINCT r.id) AS total_registrations,
    COALESCE(SUM(p.amount), 0) AS total_revenue
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
LEFT JOIN payments p ON r.id = p.registration_id AND p.status = 'succeeded'
GROUP BY e.id, e.organization_id, e.title, e.category_id, e.start_date, e.status;
