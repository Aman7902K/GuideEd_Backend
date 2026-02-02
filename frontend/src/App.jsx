import AddressForm from './AddressForm'
import AddressFormDemo from './AddressFormDemo'
import CarMaintenanceForm from './CarMaintenanceForm'

function App() {
  // Check which mode to use
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const isCarMaintenance = import.meta.env.VITE_CAR_MAINTENANCE === 'true';
  
  // Default to CarMaintenanceForm, or use existing modes if specified
  if (isCarMaintenance !== false && !isDemoMode) {
    return <CarMaintenanceForm />
  }
  
  return isDemoMode ? <AddressFormDemo /> : <AddressForm />
}

export default App
