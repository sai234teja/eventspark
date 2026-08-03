-- Phase 7 Commerce Platform: Invoices, Refunds, GST, Razorpay Tracking

-- 1. Invoices & Receipts
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    subtotal NUMERIC(10,2) NOT NULL,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    billing_address JSONB,
    status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'void', 'refunded')),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(payment_id);

-- 2. Refunds Ledger Expansion
ALTER TABLE refunds 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);

-- 3. Bulk Registrations (Corporate Teams)
CREATE TABLE IF NOT EXISTS bulk_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    purchaser_id UUID NOT NULL REFERENCES auth.users(id),
    corporate_name TEXT,
    ticket_count INTEGER NOT NULL CHECK (ticket_count > 1),
    total_amount NUMERIC(10,2) NOT NULL,
    payment_id UUID REFERENCES payments(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bulk_registrations_event_id ON bulk_registrations(event_id);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own refunds" ON refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bulk registrations" ON bulk_registrations FOR ALL USING (auth.uid() = purchaser_id);
