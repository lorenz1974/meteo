import React, { useEffect, useState } from 'react'
import { Button, Modal, Spinner, Alert, ListGroup } from 'react-bootstrap'
import { IForecast, IList } from '../interfaces/interfaces'
import axios from 'axios'
import Slider from 'react-slick'
import { apiKey } from '../config'

import {
  FaCalendarAlt,
  FaThermometerHalf,
  FaWind,
  FaCloudSun,
  FaHandHoldingWater,
} from 'react-icons/fa'

import { IoIosBody } from 'react-icons/io'
import { TbCloudSearch, TbRulerMeasure2 } from 'react-icons/tb'
import { BiDroplet as NoRain, BiSolidDroplet as Rain } from 'react-icons/bi'
import { CgDropOpacity as HalfRain } from 'react-icons/cg'

interface IForecastPopupProps {
  lon: number
  lat: number
  onClose: () => void
}

const convertDate = (date: string) => {
  const d = new Date(date)
  return (
    d.toLocaleDateString() +
    ' ' +
    d
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      .replace(/^0/, '')
  )
}

const ForecastPopup: React.FC<IForecastPopupProps> = ({
  lon,
  lat,
  onClose,
}) => {
  const [forecastData, setForecastData] = useState<IForecast | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get<IForecast>(
          `https://api.openweathermap.org/data/2.5/forecast`,
          {
            params: {
              lat,
              lon,
              appid: apiKey,
              units: 'metric',
              lang: 'it',
            },
          }
        )
        setForecastData(response.data)
      } catch (error) {
        setIsError(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [lat, lon])

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  return (
    <Modal show={true} onHide={onClose} animation={false}>
      <Modal.Header className='bg-yellow' closeButton>
        <Modal.Title>Previsioni</Modal.Title>
      </Modal.Header>
      <Modal.Body className='mb-0 pb-0'>
        {isLoading && (
          <div className='d-flex justify-content-center align-items-center'>
            <Spinner animation='border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </Spinner>
          </div>
        )}
        {isError && <Alert variant='danger'>Error: {isError.message}</Alert>}
        {!isLoading && !isError && forecastData && (
          <>
            <h3 className='text-center fw-bold py-3'>
              {forecastData.city.name}
            </h3>
            <Slider {...sliderSettings} className='m-3'>
              {forecastData.list.map((forecast: IList, index) => (
                <ListGroup key={index} variant='flush'>
                  <ListGroup.Item className='d-flex justify-content-center align-items-center ps-0 py-2 bg-gray text-white'>
                    <FaCalendarAlt className='my-auto mx-2' />
                    {convertDate(forecast.dt_txt.toString())}
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <FaThermometerHalf className='text-success w-15' />
                    <span className='fw-bold'>Temperatura:</span>&nbsp;
                    {forecast.main.temp}°C
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <IoIosBody className='text-black w-15' />
                    <span className='fw-bold'>Percepita:</span>&nbsp;
                    {forecast.main.feels_like}°C
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <FaThermometerHalf className='text-primary w-15' />
                    <span className='fw-bold'>Min:</span>&nbsp;
                    {forecast.main.temp_min}°C
                    <FaThermometerHalf className='text-danger w-15' />
                    <span className='fw-bold'>Max:</span>&nbsp;
                    {forecast.main.temp_max}°C
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <FaCloudSun className='text-warning w-15 text-nowrap' />
                    <span className='fw-bold'>Condizioni:</span>&nbsp;
                    <p className='text-nowrap m-0 p-0'>
                      {forecast.weather[0].description}
                    </p>
                    <img
                      className='ms-1'
                      alt='Weather Icon'
                      width='35px'
                      src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                    />
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <FaHandHoldingWater className='text-primary w-15 text-nowrap' />
                    <span className='fw-bold'>Umidità:</span>&nbsp;
                    <p className='text-nowrap m-0 p-0'>
                      {forecast.main.humidity}%
                    </p>
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <FaWind className='text-info w-15' />
                    <span className='fw-bold'>Vento:</span>&nbsp;
                    {forecast.wind.speed} m/s
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    {forecast.pop < 0.33 ? (
                      <NoRain className='text-success w-15' />
                    ) : forecast.pop < 0.66 ? (
                      <HalfRain className='text-warning w-15' />
                    ) : (
                      <Rain className='text-black w-15' />
                    )}
                    <span className='fw-bold'>Probabilità di pioggia:</span>
                    &nbsp;
                    {(forecast.pop * 100).toFixed(0)}%
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <TbRulerMeasure2 className='text-primary w-15' />
                    <span className='fw-bold'>mm in 3h:</span>&nbsp;
                    {forecast.rain?.['3h'] || 0}
                  </ListGroup.Item>

                  <ListGroup.Item className='d-flex align-items-center ps-0'>
                    <TbCloudSearch className='text-primary w-15' />
                    <span className='fw-bold'>Nuvolosità:</span>&nbsp;
                    {forecast.clouds.all}%
                  </ListGroup.Item>
                </ListGroup>
              ))}
            </Slider>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className='bg-gray-300'>
        <Button variant='warning' onClick={onClose}>
          Chiudi
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ForecastPopup
