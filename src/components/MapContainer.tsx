import React, { useEffect, useRef, useState } from 'react'
import L, { Map, Marker } from 'leaflet'
import WeatherPopup from './WeatherPopup'
import SearchBox from './SearchBox'
import { ICoord } from '../interfaces/interfaces'
import { Alert } from 'react-bootstrap'

import { FaRegHandPointUp, FaSearchLocation } from 'react-icons/fa'
import { FiTarget } from 'react-icons/fi'
import { IoInformationCircleOutline } from 'react-icons/io5'

const MapContainer: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null) // Riferimento al contenitore della mappa
  const mapRef = useRef<Map | null>(null) // Riferimento alla mappa Leaflet
  const markerRef = useRef<Marker | null>(null) // Riferimento per il marker
  const [initialPosition, setInitialPosition] = useState<ICoord | null>(null)
  const [currentPosition, setCurrentPosition] = useState<ICoord | null>(null)

  const iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png' // Icona personalizzata

  // Funzione per aggiornare la vista della mappa e il marker
  const updateMapPosition = (position: ICoord) => {
    if (mapRef.current) {
      const { lat, lon } = position
      mapRef.current.setView([lat, lon], 10)

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon])
      } else {
        markerRef.current = L.marker([lat, lon], {
          icon: L.icon({
            iconUrl: iconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        }).addTo(mapRef.current)
      }
    }
  }

  // Effetto per aggiornare la mappa quando cambia `currentPosition`
  useEffect(() => {
    if (currentPosition) {
      updateMapPosition(currentPosition)
    }
  }, [currentPosition])

  useEffect(() => {
    if (!mapRef.current) {
      if (mapContainer.current) {
        mapRef.current = L.map(mapContainer.current).setView([0, 0], 2)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapRef.current)

        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng
          const newPosition = { lat, lon: lng }
          setCurrentPosition(newPosition)
        })
      } else {
        console.error('Mappa non inizializzata: mapContainer è null.')
      }
    }
  }, [])

  useEffect(() => {
    if (!initialPosition) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const userLocation = { lat: latitude, lon: longitude }
          setInitialPosition(userLocation)
          setCurrentPosition(userLocation)

          if (mapRef.current) {
            updateMapPosition(userLocation)
          }
        },
        () => {
          const romeLocation = { lat: 41.9028, lon: 12.4964 }
          setInitialPosition(romeLocation)
          setCurrentPosition(romeLocation)

          if (mapRef.current) {
            updateMapPosition(romeLocation)
          }
        }
      )
    }
  }, [initialPosition])

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <SearchBox setCurrentPosition={setCurrentPosition} />

      <div
        ref={mapContainer}
        style={{
          height: '100%',
          width: '100%',
        }}
      ></div>
      {!currentPosition && (
        <Alert
          variant='info'
          className='position-absolute bottom-0 start-50 translate-middle-x text-center w-100'
          style={{ zIndex: 1000 }}
        >
          Scorri la mappa <FaRegHandPointUp /> e poi clicca su un punto{' '}
          <FiTarget /> o effettua una ricerca <FaSearchLocation /> per ottenere
          le informazioni meteo <IoInformationCircleOutline />.
        </Alert>
      )}
      {currentPosition && (
        <WeatherPopup
          coord={currentPosition}
          onClose={() => setCurrentPosition(null)}
          onRecenter={() => {
            if (initialPosition) updateMapPosition(initialPosition)
          }}
        />
      )}
    </div>
  )
}

export default MapContainer
