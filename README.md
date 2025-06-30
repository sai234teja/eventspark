
# EventSpark - Event Management Platform

A modern, full-featured event management system built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 **User Authentication** - Login and signup system
- 🎟️ **Event Registration** - Register for events with payment integration
- 💳 **Payment Integration** - Razorpay integration with UPI support
- 📊 **Dashboard** - User and organizer dashboards
- 🎫 **QR Code Tickets** - Digital tickets with QR codes
- 🌍 **Location Filtering** - Filter events by country and city
- 📱 **Responsive Design** - Mobile-first responsive design
- 🎨 **Modern UI** - Beautiful gradient backgrounds and animations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Payment**: Razorpay integration
- **QR Codes**: react-qr-code
- **Routing**: React Router DOM
- **State Management**: React hooks + localStorage

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd eventspark
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy your app

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

## Configuration

### Payment Setup

1. Sign up for a Razorpay account
2. Get your API keys from the Razorpay dashboard
3. Replace the test key in `src/components/PaymentModal.tsx`:
```typescript
key: "rzp_test_your_key_here", // Replace with your actual Razorpay key
```

### UPI Configuration

The UPI ID is currently set to `9398148549@paytm`. Update this in `PaymentModal.tsx`:
```typescript
method: {
  upi: {
    vpa: "your-upi-id@provider" // Update with your UPI ID
  }
}
```

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   ├── QRCodeComponent.tsx
│   └── PaymentModal.tsx
├── pages/               # Page components
│   ├── Index.tsx        # Landing page
│   ├── Login.tsx        # Login page
│   ├── Signup.tsx       # Signup page
│   ├── Dashboard.tsx    # User dashboard
│   ├── Events.tsx       # Events listing
│   ├── EventDetails.tsx # Event details & registration
│   ├── CreateEvent.tsx  # Create event form
│   └── NotFound.tsx     # 404 page
├── hooks/               # Custom hooks
├── lib/                 # Utilities
└── App.tsx             # Main app component
```

## Features Breakdown

### Event Management
- Create events with detailed information
- Set location (country, city, venue)
- Define capacity and pricing
- Upload event images
- Set registration deadlines

### Registration System
- User registration form with validation
- Payment processing via Razorpay
- QR code ticket generation
- Email confirmation (simulated)

### Filtering & Search
- Search events by title/description
- Filter by category
- Filter by country and city
- Clear all filters option

### Dashboard Analytics
- Total events created
- Total registrations
- Revenue tracking
- Event status management

## Environment Variables

No environment variables are required for basic functionality. For production:

1. Set up Razorpay keys
2. Configure email service (optional)
3. Set up analytics (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@eventspark.com or create an issue in the repository.
