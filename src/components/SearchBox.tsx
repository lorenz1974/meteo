import React, { useState, useEffect, FormEvent } from 'react'
import { useDebounce } from 'use-debounce'
import {
  Row,
  Col,
  Form,
  ListGroup,
  InputGroup,
  Card,
  Alert,
  Spinner,
} from 'react-bootstrap'
import { ILocation, ICoord } from '../interfaces/interfaces'
import { FaSearchLocation } from 'react-icons/fa'
import axios from 'axios'

import { API_KEY, ALERT_TIMEOUT } from '../config'

import { MdCancel } from 'react-icons/md'

interface ISearchBoxProps {
  setCurrentPosition: (coord: ICoord) => void // Funzione che riceve una città selezionata
  setZoom: (zoom: number) => void
}

const SearchBox: React.FC<ISearchBoxProps> = ({
  setCurrentPosition,
  setZoom,
}) => {
  const [search, setSearch] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<string | null>(null)
  const [fetchedCitiesNames, setFetchedCitiesNames] = useState<ILocation[]>([])
  const [debouncedQuery] = useDebounce(search, 500) // Usa il debounce con 500ms di ritardo

  const handleChange = (value: string) => {
    setSearch(value)
  }

  const hadleClickListItem = (city: ILocation) => {
    // handleChange(
    //   `${city.local_names?.it ? city.local_names.it : city.name}, ${
    //     city.state
    //   }, ${city.country}`
    // )
    setZoom(8)
    setCurrentPosition({
      lon: city.lon,
      lat: city.lat,
    })
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    // Seleziona la prima città filtrata
    if (fetchedCitiesNames.length > 0) {
      const firstCity = fetchedCitiesNames[0]
      // handleChange(
      //   `${
      //     firstCity.local_names?.it ? firstCity.local_names.it : firstCity.name
      //   }, ${firstCity.state}, ${firstCity.country}`
      // )
      setCurrentPosition({
        lon: firstCity.lon,
        lat: firstCity.lat,
      })
    }
  }

  const handleClickSearchIcon = () => {
    const searchFieldElement = document.getElementById('searchField')
    const cancelSearchElement = document.getElementById('cancelSearch')
    if (searchFieldElement) {
      searchFieldElement.classList.toggle('d-none')
      searchFieldElement.focus()
    }
    if (cancelSearchElement) {
      cancelSearchElement.classList.toggle('d-none')
    }
  }

  const handleCancelSearch = () => {
    search.length > 0 && setSearch('')
    if (search.length === 0) {
      const cancelSearchElement = document.getElementById('cancelSearch')
      const searchFieldElement = document.getElementById('searchField')
      if (cancelSearchElement) {
        cancelSearchElement.classList.toggle('d-none')
      }
      if (searchFieldElement) {
        searchFieldElement.classList.toggle('d-none')
      }
    }
  }

  useEffect(() => {
    const fetchCitiesNames = async () => {
      if (debouncedQuery.trim().length >= 2) {
        setIsLoading(true)
        setIsError(null)
        try {
          const response = await axios.get<ILocation[]>(
            `https://api.openweathermap.org/geo/1.0/direct`,
            {
              params: {
                appid: API_KEY,
                limit: 5,
                q: debouncedQuery,
                units: 'metric', // Per ottenere i dati in gradi Celsius
                lang: 'it', // Per ottenere la descrizione meteo in italiano
              },
            }
          )

          // Filtra i risultati per città uniche (Si! OpenWeather restituisce duplicati!)
          const uniqueCities = response.data.filter(
            (city, index, self) =>
              index ===
              self.findIndex(
                (c) =>
                  c.name === city.name &&
                  c.state === city.state &&
                  c.country === city.country
              )
          )

          setFetchedCitiesNames(uniqueCities)
          //console.log('SearchBox - fetchedCitiesNames', response.data)
          //console.log('SearchBox - uniqueCities', uniqueCities)
        } catch (error: any) {
          setIsError(error.response?.data?.message || 'Errore nella fetch')
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchCitiesNames()
  }, [debouncedQuery])

  if (isError) {
    setTimeout(() => {
      setIsError(null)
    }, ALERT_TIMEOUT)

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

  return (
    <div
      className='position-absolute top-1 end-1 ms-1 mt-1 bg-light p-3 rounded border border-warning'
      style={{ zIndex: 1200 }}
    >
      <Form onSubmit={(e) => handleSearch(e)}>
        <Row>
          <Col>
            <Form.Group
              className='d-flex align-items-center justify-content-start flex-nowrap'
              id='FormGroup'
            >
              <InputGroup>
                <InputGroup.Text id='placeName'>
                  <FaSearchLocation onClick={() => handleClickSearchIcon()} />
                </InputGroup.Text>
                <Form.Control
                  id='searchField'
                  className='d-none'
                  aria-describedby='placeName'
                  type='text'
                  value={search}
                  size='sm'
                  placeholder='Inserisci il nome del luogo...'
                  onChange={(e) => handleChange(e.target.value)}
                />
              </InputGroup>
              <MdCancel
                id='cancelSearch'
                className='ms-2 d-none text-danger'
                onClick={() => handleCancelSearch()}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row>
        <Col>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {isLoading && (
              <Card>
                <Card.Body className='d-flex justify-content-center'>
                  <Spinner animation='border' />
                </Card.Body>
              </Card>
            )}

            <ListGroup className='mt-1 shadow'>
              {debouncedQuery.trim().length >= 2 &&
                fetchedCitiesNames.map((city: ILocation, i: number) => (
                  <ListGroup.Item
                    key={`${i}-${city.name}-${city.state}-${city.country}`}
                    className='py-1 px-2'
                    action
                    onClick={() => hadleClickListItem(city)}
                  >
                    {city.local_names?.it ? city.local_names.it : city.name},{' '}
                    {city.state}, {city.country}
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default SearchBox
