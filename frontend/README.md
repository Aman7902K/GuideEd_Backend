# React Google Maps Address Finder

A simple React application built with Vite and Tailwind CSS that integrates with Google Maps API to provide address autocomplete functionality.

## Features

- 🗺️ Google Maps Places Autocomplete integration
- 📝 Auto-fill address fields (Street, City, State, Zip Code, Country)
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Vite

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API Key with Places API enabled

## Getting Started

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the **Places API**
4. Create credentials (API Key)
5. Copy your API key

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Run the Application

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 4. Enter Your API Key

When you first open the application, you'll be prompted to enter your Google Maps API Key. Paste your key and click "Continue".

## How to Use

1. **Enter API Key**: On first load, enter your Google Maps API key
2. **Search Address**: Start typing an address in the search box
3. **Select from Suggestions**: Choose an address from the dropdown suggestions
4. **Auto-filled Fields**: All address fields will be automatically populated
5. **Edit if Needed**: You can manually edit any field after auto-fill
6. **Submit**: Click the Submit button to process the address (currently logs to console)

## Project Structure

```
frontend/
├── src/
│   ├── AddressForm.jsx    # Main address form component
│   ├── App.jsx            # Root component
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS imports
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **@react-google-maps/api** - Google Maps integration for React
- **Google Maps Places API** - Address autocomplete service

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Customization

### Styling

The application uses Tailwind CSS. You can customize colors, spacing, and other styles by:
- Modifying `tailwind.config.js`
- Editing classes in `AddressForm.jsx`

### Form Submission

Currently, the Submit button logs the address to the console. To integrate with your backend:

1. Open `AddressForm.jsx`
2. Find the submit button's `onClick` handler
3. Replace `console.log` with your API call:

```javascript
const handleSubmit = async () => {
  try {
    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address)
    });
    // Handle response
  } catch (error) {
    console.error('Error submitting address:', error);
  }
};
```

## Environment Variables (Optional)

For production, you can use environment variables for the API key:

1. Create a `.env` file:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Update `AddressForm.jsx` to use the env variable:
```javascript
const [apiKey, setApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
```

## Troubleshooting

### API Key Issues
- Ensure Places API is enabled in Google Cloud Console
- Check API key restrictions (HTTP referrers, API restrictions)
- Verify billing is enabled on your Google Cloud project

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.

