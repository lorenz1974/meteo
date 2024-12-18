import React, { useEffect, useRef, useState } from 'react'
import L, { Map, Marker } from 'leaflet'
import WeatherPopup from './WeatherPopup'
import { ICoord } from '../interfaces/interfaces'
import { Alert } from 'react-bootstrap'

import { FaRegHandPointUp } from 'react-icons/fa'
import { FiTarget } from 'react-icons/fi'
import { IoInformationCircleOutline } from 'react-icons/io5'

const MapContainer: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null) // Riferimento al contenitore della mappa
  const mapRef = useRef<Map | null>(null) // Riferimento alla mappa Leaflet
  const markerRef = useRef<Marker | null>(null) // Riferimento per il marker
  const [initialPosition, setInitialPosition] = useState<ICoord | null>(null)
  const [currentPosition, setCurrentPosition] = useState<ICoord | null>(null)

  const iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png' // Icona personalizzata

  // Funzione per ricentrare la mappa sulla posizione iniziale
  const onRecenter = () => {
    if (initialPosition && mapRef.current) {
      const { lat, lon } = initialPosition
      mapRef.current.setView([lat, lon], 13)

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

      setCurrentPosition(initialPosition)
    }
  }

  useEffect(() => {
    if (!mapRef.current) {
      if (mapContainer.current) {
        mapRef.current = L.map(mapContainer.current).setView([0, 0], 2)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapRef.current)

        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng
          setCurrentPosition({ lat, lon: lng })

          // Ricentra la mappa sulla posizione cliccata
          // Fastidioso in modile, lo disattivo
          if (window.innerWidth > 768 && mapRef.current) {
            mapRef.current.setView([lat, lng], 13)
          }
          // else if (mapRef.current) {
          // const offset = mapRef.current.latLngToContainerPoint([lat, lng])
          // const convertedLatLng = mapRef.current.containerPointToLatLng(offset)

          // console.log('innerWidth', window.innerWidth)
          // console.log('offset', offset)
          // console.log('convertedLatLng', convertedLatLng)

          // // Si sposta al centro dell'area libera aggiungendo 300px dalla coordinata x
          // // che sono la larghezza della modale del real time
          // offset.y = offset.x + 300
          // console.log('offset', offset)

          // const newLatLng = mapRef.current.containerPointToLatLng(offset)
          // console.log('newLatLng', newLatLng)
          //mapRef.current.panTo(newLatLng)
          // }

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
          } else if (mapRef.current) {
            markerRef.current = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              }),
            }).addTo(mapRef.current)
          }
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

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13)

            markerRef.current = L.marker([latitude, longitude], {
              icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              }),
            }).addTo(mapRef.current)
          }
        },
        () => {
          // Se non ottiene la posizione dell'utente, centra la mappa su Roma
          console.error("Impossibile ottenere la posizione dell'utente.")
          const romeLocation = { lat: 41.9028, lon: 12.4964 }
          setInitialPosition(romeLocation)

          if (mapRef.current) {
            mapRef.current.setView([romeLocation.lat, romeLocation.lon], 8)

            markerRef.current = L.marker([romeLocation.lat, romeLocation.lon], {
              icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              }),
            }).addTo(mapRef.current)
          }
        }
      )
    }
  }, [initialPosition, currentPosition])

  return (
    <div style={{ height: '100vh', width: '100%' }}>
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
          <FiTarget /> per ottenere le informazioni meteo{' '}
          <IoInformationCircleOutline />.
        </Alert>
      )}
      {currentPosition && (
        <WeatherPopup
          coord={currentPosition}
          onClose={() => setCurrentPosition(null)}
          onRecenter={onRecenter}
        />
      )}
    </div>
  )
}

export default MapContainer
