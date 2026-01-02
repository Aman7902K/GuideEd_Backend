import AddressForm from './AddressForm'
import AddressFormDemo from './AddressFormDemo'

function App() {
  // Use demo mode for screenshots, switch to AddressForm for production with real API key
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  
  return isDemoMode ? <AddressFormDemo /> : <AddressForm />
}

export default App
