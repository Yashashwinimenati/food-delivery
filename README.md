# 🍕 Food Delivery API

A comprehensive backend API for a food delivery platform similar to Swiggy, built with Node.js, Express.js, and SQLite.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role-based access
- **Restaurant Management** - Search, browse, and view restaurant details
- **Menu Management** - Categories and items with pricing and availability
- **Shopping Cart** - Add, update, and manage cart items
- **Order Management** - Create, track, and manage orders
- **Payment Processing** - Multiple payment methods with transaction tracking
- **Address Management** - Multiple delivery addresses per user
- **Review System** - Rate and review restaurants and delivery experience
- **Order Tracking** - Real-time order status updates

### Technical Features
- **RESTful API Design** - Clean, consistent API endpoints
- **Input Validation** - Comprehensive validation using Joi
- **Error Handling** - Centralized error handling with proper HTTP status codes
- **Security** - Helmet, CORS, rate limiting, and JWT authentication
- **Database** - SQLite with proper relationships and constraints
- **Documentation** - Auto-generated API documentation
- **Logging** - Request logging and error tracking

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-delivery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Initialize Database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **users** - User accounts and profiles
- **addresses** - User delivery addresses
- **restaurants** - Restaurant information and ratings
- **menu_categories** - Menu category organization
- **menu_items** - Individual menu items with pricing
- **cart** - Shopping cart items
- **orders** - Order information and status
- **order_items** - Items within each order
- **payments** - Payment transactions and status
- **reviews** - User reviews and ratings
- **delivery_partners** - Delivery partner information
- **order_tracking** - Order status tracking

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `PUT /change-password` - Change password (protected)
- `DELETE /account` - Delete account (protected)

#### Restaurants (`/restaurants`)
- `GET /search` - Search restaurants
- `GET /:restaurantId` - Get restaurant details
- `GET /:restaurantId/menu` - Get restaurant menu
- `GET /:restaurantId/categories` - Get menu categories
- `GET /:restaurantId/categories/:categoryId/items` - Get category items

#### Cart (`/cart`) - All protected
- `GET /` - Get user cart
- `POST /items` - Add item to cart
- `PUT /items/:itemId` - Update cart item
- `DELETE /items/:itemId` - Remove item from cart
- `DELETE /` - Clear cart

#### Orders (`/orders`) - All protected
- `POST /` - Create new order
- `GET /` - Get order history
- `GET /:orderId` - Get order details
- `GET /:orderId/tracking` - Track order
- `PUT /:orderId/cancel` - Cancel order
- `POST /:orderId/reorder` - Reorder

#### Addresses (`/addresses`) - All protected
- `GET /` - Get user addresses
- `POST /` - Add new address
- `GET /:addressId` - Get address details
- `PUT /:addressId` - Update address
- `DELETE /:addressId` - Delete address
- `PUT /:addressId/set-default` - Set default address

#### Payments (`/payments`) - All protected
- `POST /process` - Process payment
- `GET /history` - Get payment history
- `GET /methods` - Get payment methods
- `GET /:paymentId` - Get payment details
- `POST /:paymentId/refund` - Refund payment

#### Reviews (`/reviews`)
- `GET /restaurant/:restaurantId` - Get restaurant reviews
- `GET /restaurant/:restaurantId/stats` - Get review statistics
- `POST /` - Create review (protected)
- `GET /user` - Get user reviews (protected)
- `PUT /:reviewId` - Update review (protected)
- `DELETE /:reviewId` - Delete review (protected)

## 🔧 Usage Examples

### User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Search Restaurants
```bash
curl "http://localhost:3000/api/restaurants/search?query=pizza&location=New%20York"
```

### Add Item to Cart
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "REST001",
    "menuItemId": "ITEM001",
    "quantity": 2,
    "specialInstructions": "Extra cheese please"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "ADDR001",
    "paymentMethod": "card",
    "specialInstructions": "Ring doorbell twice"
  }'
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📦 Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run init-db` - Initialize database with schema and seed data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Comprehensive validation using Joi
- **Rate Limiting** - Prevent abuse with request limiting
- **CORS Protection** - Configured CORS for security
- **Helmet** - Security headers middleware
- **SQL Injection Protection** - Parameterized queries

## 🏗️ Project Structure

```
food-delivery/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── initDatabase.js      # Database initialization
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── restaurantController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── addressController.js
│   │   ├── paymentController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Input validation
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── restaurants.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── addresses.js
│   │   ├── payments.js
│   │   └── reviews.js
│   ├── utils/
│   │   ├── constants.js         # Application constants
│   │   └── helpers.js           # Helper functions
│   └── app.js                   # Main application file
├── database/
│   ├── schema.sql               # Database schema
│   └── seeds.sql                # Seed data
├── tests/                       # Test files
├── .env.example                 # Environment variables example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Deployment

### Environment Variables
Make sure to set the following environment variables in production:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://yourdomain.com
```

### Database
For production, consider using a more robust database like PostgreSQL or MySQL instead of SQLite.

### Process Management
Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/app.js --name "food-delivery-api"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@fooddelivery.com or create an issue in the repository.

## 🔄 API Versioning

The current API version is v1.0.0. All endpoints are prefixed with `/api/`. Future versions will be available at `/api/v2/`, etc.

## 📊 Monitoring

The API includes health check endpoints and logging for monitoring:
- Health check: `GET /health`
- API documentation: `GET /api/docs`

## 🎯 Roadmap

- [ ] Real-time order tracking with WebSockets
- [ ] Push notifications
- [ ] Restaurant owner dashboard
- [ ] Delivery partner mobile app API
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Image upload for menu items
- [ ] Loyalty program integration 

🚀 Food Delivery API server running on port 3000
... 