import { useState, useEffect } from 'react';

function CarMaintenanceForm() {
  const [formData, setFormData] = useState({
    carRegistrationNumber: '',
    ownerWhatsAppNumber: '',
    lastServiceDate: '',
    meterReading: '',
    serviceCost: '',
  });
  
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Fetch recent entries on component mount
  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/car-maintenance/recent?limit=10`);
      const data = await response.json();
      if (data.success) {
        setRecentEntries(data.data);
      }
    } catch (err) {
      console.error('Error fetching recent entries:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/car-maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Maintenance record created successfully!');
        // Reset form
        setFormData({
          carRegistrationNumber: '',
          ownerWhatsAppNumber: '',
          lastServiceDate: '',
          meterReading: '',
          serviceCost: '',
        });
        // Refresh recent entries
        fetchRecentEntries();
      } else {
        setError(data.message || 'Failed to create maintenance record');
      }
    } catch (err) {
      setError('Error submitting form: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Auto-Reminder System
          </h1>
          <p className="text-lg text-gray-600">
            Car Maintenance Scheduler with WhatsApp Notifications
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white shadow-xl rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Add Maintenance Record
          </h2>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Car Registration Number */}
            <div>
              <label
                htmlFor="carRegistrationNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Car Registration Number
              </label>
              <input
                type="text"
                id="carRegistrationNumber"
                name="carRegistrationNumber"
                value={formData.carRegistrationNumber}
                onChange={handleChange}
                required
                placeholder="e.g., MH12AB1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Owner WhatsApp Number */}
            <div>
              <label
                htmlFor="ownerWhatsAppNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Owner WhatsApp Number (with country code)
              </label>
              <input
                type="tel"
                id="ownerWhatsAppNumber"
                name="ownerWhatsAppNumber"
                value={formData.ownerWhatsAppNumber}
                onChange={handleChange}
                required
                placeholder="e.g., +919876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Last Service Date */}
            <div>
              <label
                htmlFor="lastServiceDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Service Date
              </label>
              <input
                type="date"
                id="lastServiceDate"
                name="lastServiceDate"
                value={formData.lastServiceDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Meter Reading */}
            <div>
              <label
                htmlFor="meterReading"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Meter Reading (km)
              </label>
              <input
                type="number"
                id="meterReading"
                name="meterReading"
                value={formData.meterReading}
                onChange={handleChange}
                required
                placeholder="e.g., 50000"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Service Cost */}
            <div>
              <label
                htmlFor="serviceCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Service Cost (₹)
              </label>
              <input
                type="number"
                id="serviceCost"
                name="serviceCost"
                value={formData.serviceCost}
                onChange={handleChange}
                required
                placeholder="e.g., 5000"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Record'}
            </button>
          </form>
        </div>

        {/* Recent Entries Table */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Recent Entries
          </h2>
          
          {recentEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No entries yet. Submit the form above to add your first entry.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WhatsApp Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meter Reading
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.carRegistrationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.ownerWhatsAppNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.lastServiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.nextServiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.meterReading.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{entry.serviceCost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarMaintenanceForm;
