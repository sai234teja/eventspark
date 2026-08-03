# EventSpark v1.8 - Enterprise Event Commerce Platform

![EventSpark Banner](https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop)

EventSpark is a commercial-grade, multi-tenant Event Ticketing and Organizer SaaS built as a comprehensive B.Tech Major Project. It matches the scalability, aesthetic, and functional depth of industry leaders like Eventbrite, Cvent, and Meetup.

## 🚀 Features

### For Attendees (Users)
- **Seamless Discovery**: Vector-based search and filtering for local and virtual events.
- **Wallet & Cashback**: Built-in digital wallet for fast checkouts and affiliate rewards.
- **Secure Ticketing**: Dynamic QR code generation, PDF ticket downloads, and Apple/Google Calendar sync.
- **Verified Reviews**: Post-event rating systems tied exclusively to verified purchasers.
- **Transfer & Refund Engine**: Self-serve ticket transfers and automated Razorpay refund queuing.

### For Organizers
- **Advanced Dashboard**: Real-time analytics built on Recharts and Framer Motion.
- **Financial Center**: Automated GST calculation, bulk invoicing, and payout timelines.
- **Marketing CRM**: Coupon generation, affiliate link tracking, and bulk attendee exports.
- **Staff Management**: Strict Role-Based Access Control (RBAC) separating Owners, Admins, and Event Scanners.
- **Live Event Operations**: Real-time QR scanning limits, capacity tracking, and emergency broadcasting.

## 🛠️ Architecture & Tech Stack

EventSpark utilizes a **Vertical Slice Architecture** to enforce separation of concerns across a modern serverless stack.

- **Framework**: Next.js 14 (App Router)
- **Language**: Strict TypeScript
- **Database**: PostgreSQL (via Supabase) with heavily enforced Row Level Security (RLS)
- **State Management**: React Query (TanStack) & React Server Actions
- **Styling**: Tailwind CSS & Framer Motion (Glassmorphism & Micro-animations)
- **Payments**: Razorpay Gateway with cryptographic Webhook Idempotency
- **Communications**: Resend (Email) & MSG91 (SMS)

## 📁 Folder Structure
```bash
eventspark/
├── app/                  # Next.js 14 App Router routes (Admin, Dashboard, Events)
├── src/
│   ├── components/       # Reusable UI primitives (Tailwind, Radix, Framer)
│   ├── hooks/            # Global React Query data fetching layers
│   ├── lib/              # Utility configurations (Supabase Client, Stripe/Razorpay)
│   ├── services/         # Vertical slice business logic controllers
├── supabase/
│   ├── migrations/       # Version-controlled DB schemas and RLS definitions
```

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/eventspark.git
   cd eventspark
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**
   Rename `.env.example` to `.env.local` and populate your Supabase and Razorpay credentials.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Run Database Migrations**
   Push the latest schemas to your Supabase instance:
   ```bash
   npx supabase db push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`.

## 🛡️ Security & Performance

- **Zero Data Leakage**: Enforced Supabase Row Level Security (RLS) ensures users can only query rows matching `auth.uid()`.
- **Duplicate Payment Protection**: Custom `audit_logs` idempotency layer blocks Razorpay Webhook replay attacks.
- **Core Web Vitals**: Aggressive dynamic `import()` boundaries and Server-Side Rendering (SSR) guarantee a First Load JS < 250kB.
- **Accessibility**: Strict WCAG 2.1 AA compliance including ARIA landmarks and keyboard navigation traps.

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
