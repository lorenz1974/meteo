import React, { useEffect, useState } from 'react'
import { Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap'
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
    <>
      <Card
        id='weatherPopup'
        className='sticky-bottom'
        style={{
          zIndex: 1200,
        }}
      >
        <Card.Header className='position-relative d-flex justify-content-between align-items-start pe-1 fw-bold'>
          Situazione Attuale
          <div className='d-flex text-nowrap'>
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
        <Card.Body>
          <Row>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                <FaCity className='text-black p-0 m-0 pe-1' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Luogo:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{name}</span>
              </p>
            </Col>
            <Col className='m-0 p-0'>
              {' '}
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                <FaMapMarkerAlt className='text-primary' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Lat / Long:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{coord.lat.toFixed(3)}</span> /{' '}
                {coord.lon.toFixed(3)}
              </p>
            </Col>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                <FaThermometerHalf className='text-success' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Temperatura:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{main.temp}°C</span>{' '}
              </p>
            </Col>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                {' '}
                <IoIosBody className='text-black' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Percepita:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{main.feels_like}°C</span>{' '}
              </p>
            </Col>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                {' '}
                <FaThermometerHalf className='text-primary' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Min:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{main.temp_min}°C</span>
                <FaThermometerHalf className='text-danger' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Max:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{main.temp_max}°C</span>{' '}
              </p>
            </Col>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                {' '}
                <FaCloudSun className='text-warning' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Condizioni:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{weather[0].description}</span>{' '}
              </p>
            </Col>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                {' '}
                <FaHandHoldingWater className='text-primary' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Umidità:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{main.humidity}%</span>{' '}
              </p>
            </Col>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                {' '}
                <FaWind className='text-info' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Vento:&nbsp;
                </span>
                <span className='ps-1 pe-0'>{wind.speed} m/s</span>{' '}
              </p>
            </Col>
            <Col className='m-0 p-0'>
              <p className='d-flex flex-nowrap align-items-center text-nowrap border border-0 border-bottom p-1'>
                {' '}
                <FiSunrise className='text-red' />
                <span className='d-none d-sm-inline ps-1 pe-0 fw-bold'>
                  Alba:&nbsp;
                </span>
                <span className='ps-1 pe-1'>
                  {' '}
                  {formatTime(weatherData.sys.sunrise)}
                </span>{' '}
                <FiSunset className='text-black' />
                <span className='d-none d-sm-inline ps-1 pe-1 fw-bold'>
                  {' '}
                  Tramonto:&nbsp;
                </span>
                <span className='ps-1 pe-0'>
                  {' '}
                  {formatTime(weatherData.sys.sunset)}
                </span>{' '}
              </p>
            </Col>
          </Row>
        </Card.Body>
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
    </>
  )
}

export default WeatherPopup
