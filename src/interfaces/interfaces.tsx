export interface IMain {
  coord: ICoord
  weather: IWeather[]
  base: string
  main: IMainClass
  visibility: number
  wind: IWind
  clouds: IClouds
  dt: number
  sys: ISys
  timezone: number
  id: number
  name: string
  cod: number
}

export interface IClouds {
  all: number
}

export interface ICoord {
  lon: number
  lat: number
}

export interface IMainClass {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
  sea_level: number
  grnd_level: number
}

export interface ISys {
  type: number
  id: number
  country: string
  sunrise: number
  sunset: number
}

export interface IWeather {
  id: number
  main: string
  description: string
  icon: string
}

export interface IWind {
  speed: number
  deg: number
  gust: number
}

export interface IForecast {
  cod: string
  message: number
  cnt: number
  list: IList[]
  city: ICity
}

export interface ICity {
  id: number
  name: string
  coord: ICoord
  country: string
  population: number
  timezone: number
  sunrise: number
  sunset: number
}

export interface IList {
  dt: number
  main: IMainClass
  weather: IWeather[]
  clouds: IClouds
  wind: IWind
  visibility: number
  pop: number
  rain?: IRain
  sys: IListSys
  dt_txt: Date
}

export interface IRain {
  '3h': number
}

export interface IListSys {
  pod: IPod
}

export enum IPod {
  D = 'd',
  N = 'n',
}

export enum IDescription {
  CieloCoperto = 'cielo coperto',
  CieloSereno = 'cielo sereno',
  NubiSparse = 'nubi sparse',
  PioggiaLeggera = 'pioggia leggera',
  PocheNuvole = 'poche nuvole',
}

export enum IMainEnum {
  Clear = 'Clear',
  Clouds = 'Clouds',
  Rain = 'Rain',
}

export interface ILocation {
  id: number
  name: string
  state: string
  country: string
  coord: ICoord
}
