import React, { useEffect, useState } from 'react'
import { Card, ListGroup, Button, Spinner, Alert } from 'react-bootstrap'
import axios from 'axios'
import { apiKey } from '../config'
import {
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaWind,
  FaCloudSun,
  FaArrowsAlt,
  FaTimes,
  FaCity,
  FaHandHoldingWater,
} from 'react-icons/fa'
import { IoIosBody } from 'react-icons/io'
import { FiSunrise, FiSunset } from 'react-icons/fi'

import { ICoord, IMain } from '../interfaces/interfaces'

import ForecastPopup from './ForecastPopup'

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

interface IWeatherPopupProps {
  coord: ICoord
  onClose: () => void
  onRecenter: () => void
}

const WeatherPopup: React.FC<IWeatherPopupProps> = ({
  coord,
  onClose,
  onRecenter,
}) => {
  const [weatherData, setWeatherData] = useState<IMain | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<string | null>(null)
  const [showForecast, setShowForecast] = useState<boolean>(false)

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true)
      setIsError(null)

      try {
        const response = await axios.get<IMain>(
          `https://api.openweathermap.org/data/2.5/weather`,
          {
            params: {
              lat: coord.lat,
              lon: coord.lon,
              appid: apiKey,
              units: 'metric', // Per ottenere i dati in gradi Celsius
              lang: 'it', // Per ottenere la descrizione meteo in italiano
            },
          }
        )
        setWeatherData(response.data)
      } catch (error: any) {
        setIsError(error.response?.data?.message || 'Errore nella fetch')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeather()
  }, [coord])

  if (isLoading) {
    return (
      <Card
        className='position-absolute top-50 start-50 translate-middle'
        style={{ zIndex: 1200, width: 300 }}
      >
        <Card.Body className='d-flex justify-content-center'>
          <Spinner animation='border' />
        </Card.Body>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card
        className='position-absolute top-50 start-50 translate-middle'
        style={{ zIndex: 1200, width: 300 }}
      >
        <Card.Body>
          <Alert variant='danger'>{isError}</Alert>
        </Card.Body>
      </Card>
    )
  }

  if (!weatherData) {
    return null
  }

  const { main, weather, wind, name } = weatherData

  return (
    <Card className='sticky-bottom' style={{ zIndex: 900, width: 300 }}>
      <Card.Header className='position-relative d-flex justify-content-between align-items-center pe-1 fw-bold'>
        Situazione Attuale
        <div>
          <Button
            variant='light'
            size='sm'
            className='m-0 p-1'
            onClick={onRecenter}
            title='Ricentra la mappa'
          >
            <FaArrowsAlt />
          </Button>
          <Button
            variant='light'
            size='sm'
            className='m-0 p-1'
            onClick={onClose}
            title='Chiudi il popup'
          >
            <FaTimes />
          </Button>
        </div>
      </Card.Header>
      <ListGroup variant='flush'>
        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FaCity className='text-black w-15' />
          <div>
            <span className='fw-bold'>Luogo:</span>&nbsp;
            {name}
          </div>
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FaMapMarkerAlt className='text-primary w-15' />
          <div>
            <span className='fw-bold'>Lat / Long:</span>&nbsp;
            {coord.lat.toFixed(3)} / {coord.lon.toFixed(3)}
          </div>
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FaThermometerHalf className='text-success w-15' />
          <span className='fw-bold'>Temperatura:</span>&nbsp;{main.temp}°C
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <IoIosBody className='text-black w-15' />
          <span className='fw-bold'>Percepita:</span>&nbsp;{main.feels_like}°C
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FaThermometerHalf className='text-primary w-15' />
          <span className='fw-bold'>Min:</span>&nbsp;{main.temp_min.toString()}
          °C
          <FaThermometerHalf className='text-danger w-15' />
          <span className='fw-bold'>Max:</span>&nbsp;{main.temp_max}°C
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FaCloudSun className='text-warning w-15 text-nowrap' />
          <span className='fw-bold'>Condizioni:</span>&nbsp;
          <p className='text-nowrap m-0 p-0'>{weather[0].description}</p>
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FaHandHoldingWater className='text-primary w-15 text-nowrap' />
          <span className='fw-bold'>Umidità:</span>&nbsp;
          <p className='text-nowrap m-0 p-0'>{main.humidity}%</p>
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FaWind className='text-info w-15' />
          <span className='fw-bold'>Vento:</span>&nbsp;{wind.speed} m/s
        </ListGroup.Item>

        <ListGroup.Item className='d-flex align-items-center ps-0'>
          <FiSunrise className='text-red w-15' />
          <span className='fw-bold'>Alba:</span>&nbsp;
          {formatTime(weatherData.sys.sunrise)}
          <FiSunset className='text-blck w-15' />
          <span className='fw-bold'>Tramonto:</span>&nbsp;
          {formatTime(weatherData.sys.sunset)}
        </ListGroup.Item>
      </ListGroup>

      <Card.Footer className='bg-gray-300'>
        <Button
          variant='warning'
          onClick={() => setShowForecast(true)}
          title='Visualizza previsioni'
        >
          Previsioni
        </Button>
      </Card.Footer>
      {showForecast && (
        <ForecastPopup
          lon={coord.lon}
          lat={coord.lat}
          onClose={() => setShowForecast(false)}
        />
      )}
    </Card>
  )
}

export default WeatherPopup
