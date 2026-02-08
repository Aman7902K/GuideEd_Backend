# Car Spare Parts ERP System

A comprehensive inventory and Point of Sale (POS) system for managing car spare parts business with automated WhatsApp reminders for car maintenance.

## 🎯 Project Overview

This repository contains two main applications:
1. **Car Maintenance Reminder System** - Automated WhatsApp notifications for car service reminders
2. **Car Spare Parts ERP** - Full-featured inventory and billing system (NEW)

## 📦 Repository Structure

```
GuideEd_Backend/
├── src/                          # Backend API (Node.js + Express)
│   ├── models/                  # Mongoose schemas
│   │   ├── carmaintenance.model.js
│   │   ├── product.model.js     # ✨ NEW - ERP Product model
│   │   ├── transaction.model.js # ✨ NEW - Sales/Purchase transactions
│   │   └── ledger.model.js      # ✨ NEW - Financial ledger
│   ├── controllers/             # Business logic
│   ├── routes/                  # API endpoints
│   └── services/                # Background services
├── frontend/                    # React app (Car Maintenance)
│   └── src/
└── erp-frontend/                # ✨ NEW - Next.js ERP System
    ├── app/                     # Next.js App Router
    ├── components/              # Shadcn UI components
    └── lib/                     # API client & utilities
```

## 🚀 Features

### Car Spare Parts ERP (NEW)

#### ✅ Implemented Features
- **Stock Management**
  - Complete CRUD operations for products
  - Real-time search and filtering
  - Low stock alerts (< 10 items highlighted in red)
  - SKU, Category, Price, and Stock tracking
  - Product compatibility information
  
- **Dashboard**
  - KPI cards for key metrics
  - Quick action buttons
  - Modern, responsive UI

- **Professional UI**
  - Built with Shadcn/UI components
  - Tailwind CSS styling
  - Sidebar navigation
  - Mobile-responsive design

#### 🚧 Coming Soon
- **Billing POS** - Cart system with discount calculations
- **UPI QR Code** - Real-time UPI payment QR generation
- **Analytics** - Charts for sales vs purchases, stock distribution
- **Ledger** - Complete transaction history with CSV export

### Car Maintenance Reminder (Existing)
- Web form for car maintenance data entry
- Automated WhatsApp reminders via Meta Cloud API
- Daily cron job to check service dates
- Recent entries table display

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Automation**: node-cron for scheduled tasks
- **Messaging**: Meta WhatsApp Cloud API
- **Security**: Rate limiting with express-rate-limit

### ERP Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **UI Library**: Shadcn/UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Viz**: Recharts (for future analytics)
- **QR Generation**: qrcode.react (for UPI payments)

### Legacy Frontend (React)
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js 18+
- MongoDB 4.0+
- Meta WhatsApp Business Account (for maintenance reminders)

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/Aman7902K/GuideEd_Backend.git
cd GuideEd_Backend
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
```

**Required Environment Variables:**
```env
MONGODB_URL=mongodb://localhost:27017
PORT=8000
WHATSAPP_ACCESS_TOKEN=your_token
PHONE_NUMBER_ID=your_phone_id
WABA_ID=your_waba_id
```

### 3. ERP Frontend Setup
```bash
cd erp-frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

### 4. Legacy Frontend Setup (Optional)
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env
```

## 🏃 Running the Applications

### Start MongoDB
```bash
mongod --dbpath /path/to/data
```

### Start Backend API
```bash
# From project root
npm run dev
```
Server runs on `http://localhost:8000`

### Start ERP Frontend
```bash
cd erp-frontend
npm run dev
```
ERP app runs on `http://localhost:3000`

### Start Legacy Frontend (Optional)
```bash
cd frontend
npm run dev
```
Maintenance app runs on `http://localhost:5173`

## 📡 API Endpoints

### Car Spare Parts ERP

#### Products
- `GET /api/v1/products` - Get all products (with pagination & filters)
- `POST /api/v1/products` - Create new product
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/low-stock` - Get low stock items
- `GET /api/v1/products/categories` - Get all categories
- `PATCH /api/v1/products/:id/stock` - Update stock quantity

#### Transactions
- `GET /api/v1/transactions` - Get all transactions
- `POST /api/v1/transactions` - Create transaction (Sale/Purchase)
- `GET /api/v1/transactions/:id` - Get transaction by ID
- `GET /api/v1/transactions/analytics/sales` - Get sales analytics
- `GET /api/v1/transactions/analytics/monthly` - Get monthly data

#### Ledger
- `GET /api/v1/ledger` - Get all ledger entries
- `GET /api/v1/ledger/:id` - Get ledger entry by ID
- `GET /api/v1/ledger/balance` - Get current balance
- `GET /api/v1/ledger/summary` - Get ledger summary
- `GET /api/v1/ledger/export` - Export ledger to CSV

### Car Maintenance (Existing)
- `POST /api/v1/car-maintenance` - Create maintenance record
- `GET /api/v1/car-maintenance/recent` - Get recent records
- `GET /api/v1/car-maintenance` - Get all records
- `GET /api/v1/car-maintenance/:id` - Get record by ID

## 🗄️ Database Schemas

### Product Schema
```javascript
{
  name: String,
  sku: String (unique),
  category: String,
  price: Number,
  purchasePrice: Number,
  stockQuantity: Number,
  compatibility: [String],
  description: String
}
```

### Transaction Schema
```javascript
{
  type: "Sale" | "Purchase",
  items: [{
    product: ObjectId,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  discount: Number,
  finalAmount: Number,
  paymentMethod: "Cash" | "UPI" | "Card" | "Credit"
}
```

### Ledger Schema
```javascript
{
  transaction: ObjectId,
  transactionType: "Sale" | "Purchase",
  amount: Number,
  balance: Number,
  entityType: "Customer" | "Supplier",
  entityName: String
}
```

## 🔒 Security Features

- Rate limiting on all API endpoints (100-200 requests per 15 minutes)
- Input validation with Mongoose schemas
- MongoDB ObjectId format validation
- Environment variable protection
- CORS configuration
- Error handling to prevent information disclosure

## 🎨 UI Screenshots

### ERP Dashboard
- KPI cards showing business metrics
- Quick action buttons for common tasks
- Clean, modern interface

### Stock Management
- Searchable product table
- Add/Edit/Delete dialogs
- Low stock highlighting (red background for < 10 items)
- SKU and category filters

## 📝 Development Workflow

### Backend Development
```bash
npm run dev  # Nodemon auto-restart
```

### Frontend Development
```bash
cd erp-frontend
npm run dev  # Hot reload enabled
```

### Building for Production
```bash
# Backend - no build needed
npm start

# ERP Frontend
cd erp-frontend
npm run build
npm start
```

## 🧪 Testing

The project currently focuses on manual testing. To test:

1. **Backend**: Use Postman/curl to test API endpoints
2. **Frontend**: Navigate through UI and test CRUD operations
3. **Integration**: Ensure frontend successfully communicates with backend

## 📦 Dependencies

### Backend Main Dependencies
- express@5.1.0
- mongoose@8.18.0
- node-cron@4.2.1
- express-rate-limit@8.2.1
- axios@1.11.0

### ERP Frontend Main Dependencies
- next@16.1.6
- react@19.2.0
- lucide-react@latest
- recharts@latest
- qrcode.react@latest
- @radix-ui components

## 🚧 Roadmap

### Phase 1: Foundation (✅ Complete)
- ✅ Backend models and controllers
- ✅ API endpoints with rate limiting
- ✅ Next.js frontend setup
- ✅ Stock management UI

### Phase 2: Billing System (In Progress)
- [ ] Cart functionality
- [ ] Discount calculations
- [ ] Invoice generation
- [ ] UPI QR code integration

### Phase 3: Analytics & Reporting
- [ ] Sales vs Purchase charts (Recharts)
- [ ] Stock distribution pie charts
- [ ] KPI calculations and display
- [ ] Date range filters

### Phase 4: Ledger & Export
- [ ] Transaction history view
- [ ] Running balance calculation
- [ ] CSV export functionality
- [ ] Financial reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC License

## 👤 Author

**Aman Kumar**
- GitHub: [@Aman7902K](https://github.com/Aman7902K)

## 🙏 Acknowledgments

- Meta WhatsApp Cloud API
- Shadcn UI for beautiful components
- Next.js team for the amazing framework
- MongoDB for flexible database solution

---

**Note**: This is an active development project. The ERP system is being built incrementally with core features implemented first, followed by advanced features like analytics and reporting.

For detailed documentation on specific components:
- See `erp-frontend/README.md` for frontend-specific documentation
- See `WHATSAPP_TEMPLATE_SETUP.md` for WhatsApp integration guide
- See `PROJECT_SUMMARY.md` for car maintenance system details
