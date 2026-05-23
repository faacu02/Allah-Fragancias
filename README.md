<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Allah Fragancias - Luxury Perfumery E-commerce

A premium e-commerce platform for luxury fragrances built with Next.js 15, React, Prisma, and PostgreSQL.

## Features

- **Product Catalog**: Browse luxury fragrances with detailed views
- **Shopping Cart**: Add/remove items, persist cart in localStorage
- **Secure Authentication**: HttpOnly cookies, role-based access (admin/client)
- **Payment Methods**: 
  - Cash on delivery (coordinate with admin)
  - Bank transfer (with WhatsApp confirmation)
- **Admin Dashboard**: 
  - Inventory management (add/edit products, track stock)
  - Order management (approve orders, automatic stock deduction)
  - Sales reports
- **Customer Dashboard**: Order history and details
- **Email Notifications**: Order confirmations, admin alerts
- **Responsive Design**: Optimized for mobile and desktop
- **Animations**: Smooth transitions with Motion and Framer Motion
- **SEO Optimized**: Dynamic meta tags, structured data
- **Accessibility**: ARIA labels, keyboard navigation, proper contrast
- **Performance**: Lazy loading images, code splitting, caching

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context & Hooks
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HttpOnly cookies
- **Payments**: Simulated bank transfer & cash (no third-party fees)
- **Email**: Nodemailer (SMTP)
- **Image Storage**: Cloudinary
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account (for image storage)
- SMTP service (for email notifications)
- Optional: WhatsApp Business for transfer confirmations

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd allah-fragancias---luxury-perfumery
   ```

2. Install dependencies using pnpm (recommended) or npm
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables
   Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```
   # Database
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

   # Next.js
   NEXT_PUBLIC_BASE_URL="http://localhost:3000" # Change in production

   # JWT Authentication
   JWT_SECRET="your_super_secret_key_here"

   # Cloudinary (for product images)
   CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"

   # Email (SMTP)
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_app_password"

   # Bank Transfer Details (for transferencia method)
   BANK_NAME="Your Bank Name"
   ACCOUNT_TYPE="Cuenta Corriente" # or "Cuenta de Ahorro"
   ACCOUNT_NUMBER="your_account_number"
   ALIAS="your_alias" # e.g., ALLAH.FRAGANCIAS
   CUIT="your_tax_id" # e.g., 20-12345678-9
   HOLDER_NAME="Account Holder Name"

   # Optional: Admin notifications
   ADMIN_EMAIL="admin@yourdomain.com"
   ```

4. Initialize the database
   ```bash
   npx prisma migrate dev --name init
   ```

   Optional: Seed with sample data
   ```bash
   npx prisma db seed
   ```

5. Run the development server
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

   The app will be available at http://localhost:3000

### Building for Production

```bash
pnpm build
# or
npm run build

pnpm start
# or
npm start
```

## API Documentation

### Authentication
- `POST /api/auth/login` - Login user (sets HttpOnly cookie)
- `POST /api/auth/register` - Register new user (sets HttpOnly cookie)
- `POST /api/auth/logout` - Clear authentication cookie
- `GET /api/me` - Get current user data

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` (Admin only) - Create new product
- `PUT /api/products/[id]` (Admin only) - Update product
- `DELETE /api/products/[id]` (Admin only) - Delete product

### Orders
- `POST /api/checkout` - Create order (efectivo or transferencia)
- `GET /api/my-orders` - Get current user's orders
- `GET /api/admin/orders` (Admin only) - Get all orders
- `PUT /api/admin/orders/[id]/status` (Admin only) - Update order status

### Admin Reports
- `GET /api/admin/reports/sales` (Admin only) - Get sales report

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/allah_fragancias?schema=public` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the app (used in emails) | `http://localhost:3000` |
| `JWT_SECRET` | Secret for signing JWT tokens | `your_32+_character_random_string` |
| `CLOUDINARY_URL` | Cloudinary connection string | `cloudinary://1234567890:abcdef@mycloud` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdefghijklmnopqrstuvwxyz0123456789` |
| `SMTP_USER` | SMTP username (for emails) | `contacto@yourdomain.com` |
| `SMTP_PASS` | SMTP password or app token | `your_app_password` |
| `BANK_NAME` | Bank name for transfers | `Banco de la Nación Argentina` |
| `ACCOUNT_TYPE` | Account type (Corriente/Ahorro) | `Cuenta Corriente` |
| `ACCOUNT_NUMBER` | Bank account number | `1234567890` |
| `ALIAS` | CBU alias for transfers | `ALLAH.FRAGANCIAS` |
| `CUIT` | Tax ID (Argentina) | `20-12345678-9` |
| `HOLDER_NAME` | Account holder name | `Allah Fragancias` |
| `ADMIN_EMAIL` | Email for admin notifications | `admin@yourdomain.com` |

## Security Features

- **Authentication**: JWT tokens stored in HttpOnly, Secure cookies (XSS protection)
- **CSRF Protection**: Double-submit cookie implementation planned
- **Security Headers**: Implemented via middleware (X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate Limiting**: API route protection against brute force
- **Input Sanitization**: Server-side validation and sanitization of all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Password Hashing**: bcryptjs with salt rounds

## Performance Optimizations

- **Lazy Loading**: Images load only when entering viewport
- **Code Splitting**: Dynamic imports for non-critical components
- **Image Optimization**: Cloudinary automatic formatting and compression
- **Caching**: SWR for client-side data fetching, server-side caching strategies
- **Bundle Analysis**: Built-in Next.js optimization

## Accessibility (a11y)

- ARIA labels for all interactive elements
- Keyboard navigable menus and forms
- Sufficient color contrast (WCAG AA compliant)
- Focus outlines and skip links
- Semantic HTML structure
- Screen reader friendly labels

## SEO Features

- Dynamic meta tags (title, description) using next/head
- Open Graph tags for social sharing
- Structured data (JSON-LD) for products and organization
- XML sitemap generation (planned)
- Clean URL structure
- Canonical tags to prevent duplicate content

## Testing

### Unit Tests
- Jest and React Testing Library for components
- API route testing with supertest

### Integration Tests
- Cypress for end-to-end testing

To run tests:
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the incredible framework
- Tailwind CSS for utility-first styling
- Prisma for type-safe database access
- Lucide React for beautiful icons
- Motion for animations
- Cloudinary for image management
- Nodemailer for email handling