import { useState, useEffect } from 'react'
import { Alert } from 'react-bootstrap'

interface IUserLocationProps {
  onLocationFound: (location: { lat: number; lng: number }) => void
}

const UserLocation: React.FC<IUserLocationProps> = ({ onLocationFound }) => {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La geolocalizzazione non è supportata dal tuo browser.')
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords
      const userLocation = { lat: latitude, lng: longitude }
      onLocationFound(userLocation) // Notifica il componente genitore
    }

    const handleError = (err: GeolocationPositionError) => {
      setError('Non è stato possibile ottenere la tua posizione.')
      console.error(err)
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError)
  }, [onLocationFound])

  return (
    <>
      {error && (
        <Alert
          variant='danger'
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
        >
          {error}
        </Alert>
      )}
    </>
  )
}

export default UserLocation
