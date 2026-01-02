import { useState, useRef, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

function AddressForm() {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const autocompleteRef = useRef(null);

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.address_components) {
        const addressComponents = place.address_components;
        
        let street = '';
        let city = '';
        let state = '';
        let zipCode = '';
        let country = '';
        
        // Extract street number and route
        const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
        const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
        street = `${streetNumber} ${route}`.trim();
        
        // Extract city
        city = addressComponents.find(c => c.types.includes('locality'))?.long_name || 
               addressComponents.find(c => c.types.includes('sublocality'))?.long_name || '';
        
        // Extract state
        state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
        
        // Extract zip code
        zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';
        
        // Extract country
        country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';
        
        setAddress({
          street,
          city,
          state,
          zipCode,
          country
        });
      }
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowApiInput(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (showApiInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Google Maps API Key</h2>
          <p className="text-gray-600 mb-6">
            Please enter your Google Maps API key to use the address autocomplete feature.
          </p>
          <form onSubmit={handleApiKeySubmit}>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Google Maps API Key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continue
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4">
            Don't have an API key? Get one from the{' '}
            <a 
              href="https://console.cloud.google.com/google/maps-apis" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Cloud Console
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Address Finder</h1>
            <p className="text-gray-600 mb-8">
              Search for an address using Google Maps and auto-fill the form below
            </p>
            
            <div className="space-y-6">
              {/* Autocomplete Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Address
                </label>
                <Autocomplete
                  onLoad={onLoad}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    type="text"
                    placeholder="Start typing an address..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </Autocomplete>
                <p className="text-xs text-gray-500 mt-2">
                  Begin typing to see address suggestions
                </p>
              </div>

              {/* Address Fields */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Address Details</h2>
                
                <div className="space-y-4">
                  {/* Street */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="123 Main St"
                    />
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="New York"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  {/* Zip Code and Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={address.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="10001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setAddress({ street: '', city: '', state: '', zipCode: '', country: '' })}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Clear
                </button>
                <button
                  onClick={() => console.log('Address submitted:', address)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Tip:</span> Start typing in the search box to see address suggestions from Google Maps. 
              Select an address to automatically fill in all the fields below.
            </p>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}

export default AddressForm;
