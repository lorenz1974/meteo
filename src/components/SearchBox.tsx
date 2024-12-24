import React, { useState, useMemo, FormEvent } from 'react'
import { useDebounce } from 'use-debounce'
import { Row, Col, Form, ListGroup, InputGroup } from 'react-bootstrap'
import { ILocation, ICoord } from '../interfaces/interfaces'
import { FaSearchLocation } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'

import cityList from '../data/city.list.json'

interface ISearchBoxProps {
  setCurrentPosition: (coord: ICoord) => void // Funzione che riceve una città selezionata
}

const SearchBox: React.FC<ISearchBoxProps> = ({ setCurrentPosition }) => {
  const [search, setSearch] = useState<string>('')
  const [debouncedQuery] = useDebounce(search, 500) // Usa il debounce con 500ms di ritardo

  // Ordina cityList in base a country e poi a name
  const sortedCityList = useMemo(() => {
    return cityList.sort((a, b) => {
      if (a.country < b.country) return -1
      if (a.country > b.country) return 1
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  }, [])

  const handleChange = (value: string) => {
    setSearch(value)
  }

  const hadleClickListItem = (city: ILocation) => {
    handleChange(`${city.name}, ${city.country}`)
    setCurrentPosition({
      lon: city.coord.lon,
      lat: city.coord.lat,
    })
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    // Seleziona la prima città filtrata
    if (filteredCities.length > 0) {
      const firstCity = filteredCities[0]
      handleChange(`${firstCity.name},${firstCity.country}`)
      setCurrentPosition({
        lon: firstCity.coord.lon,
        lat: firstCity.coord.lat,
      })
    }
  }

  const handleClickSearchIcon = () => {
    document.getElementById('searchField')!.style.display = 'block'
    document.getElementById('searchField')!.focus()
    document.getElementById('cancelSearch')!.style.display = 'block'
  }

  const handleCancelSearch = () => {
    search.length > 0 && setSearch('')
    if (search.length === 0) {
      document.getElementById('cancelSearch')!.style.display = 'none'
      document.getElementById('searchField')!.style.display = 'none'
    }
  }

  // Filtro ottimizzato delle città
  const filteredCities: ILocation[] = useMemo(() => {
    if (debouncedQuery.trim().length < 2) return [] // Filtra solo con almeno 2 caratteri
    const lowerCaseSearch = debouncedQuery.toLowerCase()
    const upperCaseSearch = debouncedQuery.toUpperCase()

    // Se l'utente non scrive maiuscolo.
    if (search !== upperCaseSearch) {
      return sortedCityList.filter((city: ILocation) =>
        city.name.toLowerCase().includes(lowerCaseSearch)
      )
    } else {
      // Se scrive maiuscolo effettua la ricerca negli stati
      return sortedCityList.filter((city: ILocation) =>
        city.country.includes(debouncedQuery)
      )
    }
  }, [debouncedQuery])

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
              controlId='formPlaceName'
              id='FormGroup'
            >
              <InputGroup>
                <InputGroup.Text id='placeName'>
                  <FaSearchLocation onClick={() => handleClickSearchIcon()} />
                </InputGroup.Text>
                <Form.Control
                  id='searchField'
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
                className='ms-2'
                onClick={() => handleCancelSearch()}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row>
        <Col>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <ListGroup className='mt-1 shadow'>
              {debouncedQuery.trim().length >= 2 &&
                filteredCities.map((city: ILocation) => (
                  <ListGroup.Item
                    key={city.id}
                    className='py-1 px-2'
                    action
                    onClick={() => hadleClickListItem(city)}
                  >
                    {city.name}, {city.country}
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
