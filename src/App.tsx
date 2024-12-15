import MapContainer from './components/MapContainer'
import { Container } from 'react-bootstrap'
import 'leaflet/dist/leaflet.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import './assets/css/custom-bootstrap.css'

const App = () => {
  return (
    <Container fluid className='p-0'>
      <MapContainer />
    </Container>
  )
}

export default App
