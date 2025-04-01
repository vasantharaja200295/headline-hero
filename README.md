# HeadlineHero

HeadlineHero is a SaaS application that uses AI to generate compelling newsletter headlines to help content creators improve their open rates. The platform offers a credit-based system where users can purchase credits and use them to generate headlines in batches.

## Features

- AI-powered headline generation using Google Gemini API
- Email-based authentication with Supabase
- Credit-based system for headline generation
- Payment processing with Razorpay
- Responsive design with Tailwind CSS
- Modern UI components with Headless UI

## Tech Stack

- Next.js 14
- Supabase (Auth & Database)
- Google Gemini API
- Razorpay Payment Gateway
- Tailwind CSS
- Headless UI

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key
- Razorpay account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/headline-hero.git
cd headline-hero
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Create the following tables:
     - `users` (handled by Supabase Auth)
     - `credits` (user_id, amount, created_at, updated_at)
     - `headline_history` (user_id, topic, audience, tone, keywords, results, created_at)
     - `transactions` (user_id, amount, currency, payment_id, status, created_at)

5. Set up Razorpay:
   - Create a Razorpay account
   - Get your API keys
   - Configure webhook URL: `https://your-domain.com/api/webhooks/razorpay`

6. Get Google Gemini API key:
   - Create a Google Cloud project
   - Enable the Gemini API
   - Create API credentials

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel
4. Deploy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 