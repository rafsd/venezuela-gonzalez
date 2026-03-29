export const MONTHS: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAY_NAMES: string[] = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export const DOWS: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const PERSON_PALETTE: string[] = [
  '#2C5F8A',
  '#2E8B9A',
  '#B05478',
  '#2E7A5B',
  '#7050A8',
  '#8A6B2C',
  '#2E6A8A'
];

export interface PlaceCat {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export const PLACE_CATS: Record<string, PlaceCat> = {
  attraction: {
    label: 'Atracción',
    icon: '🏛️',
    color: '#1E6FA8',
    bg: 'rgba(30,111,168,0.09)'
  },
  restaurant: {
    label: 'Restaurante',
    icon: '🍽️',
    color: '#A85C28',
    bg: 'rgba(168,92,40,0.09)'
  },
  beach: {
    label: 'Playa / Naturaleza',
    icon: '🌊',
    color: '#1A7A58',
    bg: 'rgba(26,122,88,0.09)'
  },
  activity: {
    label: 'Actividad',
    icon: '🎭',
    color: '#8A3060',
    bg: 'rgba(138,48,96,0.09)'
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: '#6B5220',
    bg: 'rgba(107,82,32,0.09)'
  },
  other: {
    label: 'Otro',
    icon: '📍',
    color: '#4E4A44',
    bg: 'rgba(78,74,68,0.08)'
  }
};
