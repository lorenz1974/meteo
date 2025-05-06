import React, { useEffect, useRef, useState } from 'react' // Import di React e dei relativi hook
import L, { Map, Marker } from 'leaflet' // Import di Leaflet per la gestione della mappa
import WeatherPopup from './WeatherPopup' // Componente per il popup meteo
import SearchBox from './SearchBox' // Componente per la barra di ricerca
import { ICoord } from '../interfaces/interfaces' // Interfaccia per rappresentare le coordinate
import { Alert } from 'react-bootstrap' // Componente Alert di Bootstrap
import { DEFAULT_ZOOM, ROME_LOCATION } from '../config' // Import delle costanti per i livelli di zoom

// Import delle icone utilizzate nel layout
import { FaRegHandPointUp, FaSearchLocation } from 'react-icons/fa'
import { FiTarget } from 'react-icons/fi'
import { IoInformationCircleOutline } from 'react-icons/io5'

const MapContainer: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null) // Riferimento al contenitore DOM della mappa
  const mapRef = useRef<Map | null>(null) // Riferimento all'istanza della mappa Leaflet
  const markerRef = useRef<Marker | null>(null) // Riferimento al marker della mappa
  const [initialPosition, setInitialPosition] = useState<ICoord | null>(null) // Stato per la posizione iniziale dell'utente
  const [currentPosition, setCurrentPosition] = useState<ICoord | null>(null) // Stato per la posizione attuale sulla mappa
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM) // Stato per il livello di zoom della mappa

  const iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png' // URL per l'icona personalizzata del marker

  // Funzione per aggiornare la posizione della mappa e del marker
  const updateMapPosition = (position: ICoord, mapZoom: number) => {
    if (mapRef.current) {
      const { lat, lon } = position
      //console.log(`Centrando mappa su lat: ${lat}, lon: ${lon}, zoom: ${mapZoom}`) // Debug
      mapRef.current.flyTo([lat, lon], mapZoom)

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
    } else {
      console.error('Mappa non inizializzata: mapRef è null.') // Messaggio di errore se la mappa non è stata inizializzata
    }
    setZoom(mapZoom)
  }

  // Inizializza la mappa al primo rendering del componente
  useEffect(() => {
    // Controlla che la mappa non sia già stata creata
    if (!mapRef.current) {
      // Controlla che il riferimento al contenitore non sia nullo
      if (mapContainer.current) {
        // Crea una nuova mappa con zoom di default
        mapRef.current = L.map(mapContainer.current).setView(
          { lat: 41.9028, lng: 12.4964 }, // Coordinata di Roma
          DEFAULT_ZOOM
        )

        // Aggiunge i tile di OpenStreetMap alla mappa
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors', // Attribuzione
        }).addTo(mapRef.current)

        // Aggiunge un listener per il clic sulla mappa
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          //console.log(`Clic su mappa:`, e) // Debug
          const lat = e.latlng.lat // Recupera le coordinate del clic
          const lon = e.latlng.lng // !!!NOTARE!!!: Leaflet usa lng al posto di lon
          setCurrentPosition({ lat, lon }) // Aggiorna la posizione corrente
        })
      } else {
        console.error('Mappa non inizializzata: mapContainer è null.') // Messaggio di errore se il contenitore è nullo
      }
    }
  }, []) // L'effetto viene eseguito solo al primo rendering

  useEffect(() => {
    // Recupera la posizione iniziale dell'utente tramite geolocalizzazione
    if (!initialPosition) {
      // Controlla che la posizione iniziale non sia già stata impostata
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // console.log('Geolocalizzazione riuscita:', position) // Debug
          const { latitude, longitude } = position.coords // Recupera le coordinate GPS
          const userLocation = { lat: latitude, lon: longitude } // Crea un oggetto con le coordinate
          setInitialPosition(userLocation) // Imposta la posizione iniziale
          setCurrentPosition(userLocation) // Imposta la posizione corrente
          updateMapPosition(userLocation, DEFAULT_ZOOM) // Aggiorna la mappa con la posizione e lo zoom di default
        },
        () => {
          // Se la geolocalizzazione fallisce, imposta una posizione di fallback (Roma)
          setInitialPosition(ROME_LOCATION)
          setCurrentPosition(ROME_LOCATION)
          updateMapPosition(ROME_LOCATION, DEFAULT_ZOOM) // Aggiorna la mappa con la posizione di fallback
        }
      )
    }
  }, [mapRef.current]) // L'effetto viene eseguito solo al primo rendering

  // Aggiorna la mappa quando cambia la posizione corrente
  useEffect(() => {
    // Esegue questo controllo per Typescript
    if (currentPosition) {
      // Aggiorna la vista con la posizione corrente e lo zoom corrente
      updateMapPosition(currentPosition, zoom)
    }
  }, [currentPosition]) // L'effetto dipende dalla modifica della posizione corrente

  return (
    <div
      style={{ height: '100vh' }}
      className='w-100 position-relative overflow-hidden'
    >
      {/* Componente per la barra di ricerca */}
      <SearchBox
        setCurrentPosition={setCurrentPosition} // Permette di aggiornare la posizione corrente dalla barra di ricerca
        setZoom={(zoomLevel) => {
          // Permette di aggiornare lo zoom dalla barra di ricerca
          setZoom(zoomLevel) // Imposta il livello di zoom nello stato
        }}
      />

      {/* Contenitore della mappa */}
      <div
        ref={mapContainer} // Riferimento al contenitore DOM
        style={{
          height: '100%', // Altezza del contenitore
          width: '100%', // Larghezza del contenitore
        }}
      ></div>

      {/* Mostra un messaggio di istruzioni se non c'è una posizione corrente */}
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

      {/* Mostra il popup meteo se c'è una posizione corrente */}
      {currentPosition && (
        <WeatherPopup
          coord={currentPosition} // Passa la posizione corrente al popup
          onClose={() => setCurrentPosition(null)} // Chiude il popup azzerando la posizione corrente
          onRecenter={() => {
            if (initialPosition) {
              setZoom(DEFAULT_ZOOM)
              // Ricentra sulla posizione iniziale
              setCurrentPosition(initialPosition)
              //console.log('Ricentrando sulla posizione iniziale', initialPosition) // Debug
            }
          }}
        />
      )}
    </div>
  )
}

export default MapContainer // Esporta il componente
