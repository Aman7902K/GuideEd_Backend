# Auto-Reminder System - Car Maintenance Scheduler

A full-stack web application for automated car maintenance reminders via WhatsApp Cloud API.

## Features

- 📝 Web form to capture car maintenance details
- 📊 Display recent maintenance entries in a table
- ⏰ Automated daily cron job to check for upcoming service dates
- 📱 WhatsApp notifications via Meta WhatsApp Cloud API
- 💾 MongoDB database for persistent storage
- 🔄 Automatic calculation of next service date (90 days from last service)

## Tech Stack

### Backend
- **Node.js** with **Express.js** (latest)
- **MongoDB** with **Mongoose**
- **node-cron** for scheduled tasks
- **axios** for WhatsApp API integration

### Frontend
- **React** (v19.2.0)
- **Tailwind CSS** (v4.1.18)
- **Vite** (v7.2.4) for fast development and builds

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.0 or higher)
- Meta WhatsApp Business Account with Cloud API access

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Aman7902K/GuideEd_Backend.git
cd GuideEd_Backend
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your credentials
# MONGODB_URL=mongodb://localhost:27017
# PORT=8000
# WHATSAPP_ACCESS_TOKEN=your_actual_token
# PHONE_NUMBER_ID=your_phone_number_id
# WABA_ID=your_waba_id
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment variables
cp .env.example .env

# Edit .env if needed
# VITE_API_BASE_URL=http://localhost:8000
# VITE_CAR_MAINTENANCE=true
```

### 4. WhatsApp Cloud API Setup

To use the WhatsApp Cloud API, you need to:

1. **Create a Meta Business Account**: Go to [Meta Business Suite](https://business.facebook.com/)
2. **Set up WhatsApp Business Platform**: Navigate to [Meta for Developers](https://developers.facebook.com/)
3. **Create an App** with WhatsApp product
4. **Get Credentials**:
   - `WHATSAPP_ACCESS_TOKEN`: System User Token from App Dashboard
   - `PHONE_NUMBER_ID`: From WhatsApp > API Setup
   - `WABA_ID`: WhatsApp Business Account ID
5. **Create a Message Template**:
   - Name: `maintenance_reminder`
   - Category: Transactional
   - Language: English
   - Body with variables: "Hello! Your car {{1}} is due for maintenance on {{2}}. Please schedule your service appointment."
   - Get it approved by Meta

## Running the Application

### Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath /path/to/your/data/directory
```

### Start Backend Server

```bash
# From project root
npm run dev
```

The backend will start on `http://localhost:8000`

### Start Frontend Development Server

```bash
# From frontend directory
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or similar port)

## API Endpoints

### Car Maintenance Endpoints

#### Create Maintenance Record
```http
POST /api/v1/car-maintenance
Content-Type: application/json

{
  "carRegistrationNumber": "MH12AB1234",
  "ownerWhatsAppNumber": "+919876543210",
  "lastServiceDate": "2024-01-15",
  "meterReading": 50000,
  "serviceCost": 5000
}
```

#### Get Recent Records
```http
GET /api/v1/car-maintenance/recent?limit=10
```

#### Get All Records
```http
GET /api/v1/car-maintenance
```

#### Get Record by ID
```http
GET /api/v1/car-maintenance/:id
```

## Automated Reminders

The system uses **node-cron** to run a daily check at **9:00 AM** (configurable in `src/services/cron.services.js`).

### How It Works:

1. **Daily Cron Job** runs at 9:00 AM IST
2. **Queries MongoDB** for records where `nextServiceDate` is today
3. **Sends WhatsApp message** using Meta Cloud API
4. **Marks reminder as sent** to prevent duplicates

### Cron Schedule

The default schedule is `0 9 * * *` (9:00 AM daily). You can modify this in `src/services/cron.services.js`:

```javascript
cron.schedule("0 9 * * *", checkAndSendReminders, {
  timezone: "Asia/Kolkata", // Change timezone as needed
});
```

## Project Structure

```
GuideEd_Backend/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── CarMaintenanceForm.jsx  # Main form component
│   │   ├── App.jsx                 # App entry point
│   │   └── ...
│   ├── .env.example
│   └── package.json
├── src/                         # Backend source
│   ├── models/
│   │   └── carmaintenance.model.js  # Car maintenance schema
│   ├── controllers/
│   │   └── carmaintenance.controller.js  # API controllers
│   ├── routes/
│   │   └── carmaintenance.routes.js  # API routes
│   ├── services/
│   │   ├── whatsapp.services.js  # WhatsApp integration
│   │   └── cron.services.js      # Cron job logic
│   ├── app.js                   # Express app setup
│   └── index.js                 # Server entry point
├── .env.example
├── package.json
└── README.md
```

## Database Schema

### CarMaintenance Collection

```javascript
{
  carRegistrationNumber: String,    // Required, uppercase
  ownerWhatsAppNumber: String,      // Required, with country code
  lastServiceDate: Date,            // Required
  meterReading: Number,             // Required
  serviceCost: Number,              // Required
  nextServiceDate: Date,            // Auto-calculated (lastServiceDate + 90 days)
  reminderSent: Boolean,            // Default: false
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

## Features Breakdown

### Frontend Form Fields

1. **Car Registration Number** - Text input, converted to uppercase
2. **Owner WhatsApp Number** - Telephone input with country code
3. **Last Service Date** - Date picker
4. **Meter Reading** - Number input (km)
5. **Service Cost** - Number input (₹)

### Recent Entries Table

Displays the 10 most recent maintenance records with:
- Car Registration Number
- WhatsApp Number
- Last Service Date
- Next Service Date (auto-calculated)
- Meter Reading
- Service Cost

### Error Handling

- **Frontend**: Displays error messages for failed API calls
- **Backend**: Returns proper HTTP status codes and error messages
- **WhatsApp API**: Logs errors and continues processing other records

## Environment Variables

### Backend (.env)

```env
MONGODB_URL=mongodb://localhost:27017
PORT=8000
WHATSAPP_ACCESS_TOKEN=your_token
PHONE_NUMBER_ID=your_phone_id
WABA_ID=your_waba_id
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CAR_MAINTENANCE=true
VITE_DEMO_MODE=false
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Verify database permissions

### WhatsApp API Errors
- Verify your access token is valid
- Ensure phone number is registered in WhatsApp Business
- Check if message template is approved
- Verify phone number format includes country code

### Cron Job Not Running
- Check server logs for cron initialization message
- Verify timezone setting in `cron.services.js`
- Ensure server is running continuously

### Frontend Not Loading Data
- Check CORS settings in backend `app.js`
- Verify API base URL in frontend `.env`
- Check browser console for errors

## Development

### Run Backend in Development Mode
```bash
npm run dev
```

### Run Frontend in Development Mode
```bash
cd frontend
npm run dev
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Meta WhatsApp Cloud API Documentation
- Express.js Framework
- React + Vite
- Tailwind CSS
- node-cron

---

**Note**: This is a development version. For production deployment:
- Use environment-specific configurations
- Set up proper SSL/TLS certificates
- Use production-grade MongoDB instance
- Implement proper authentication and authorization
- Add rate limiting for API endpoints
- Set up monitoring and logging
