export const MONTHS: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAY_NAMES: string[] = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export const DOWS: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const PERSON_PALETTE: string[] = [
  '#7A9C7E',
  '#8A9EB8',
  '#B87878',
  '#9E8A72',
  '#7A8E9E',
  '#9E9A72',
  '#7E8A9E'
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
    color: '#5A7EA0',
    bg: 'rgba(90,126,160,0.08)'
  },
  restaurant: {
    label: 'Restaurante',
    icon: '🍽️',
    color: '#A87850',
    bg: 'rgba(168,120,80,0.08)'
  },
  beach: {
    label: 'Playa',
    icon: '🌊',
    color: '#5A9E82',
    bg: 'rgba(90,158,130,0.08)'
  },
  activity: {
    label: 'Actividad',
    icon: '🎭',
    color: '#9E6878',
    bg: 'rgba(158,104,120,0.08)'
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: '#8A7A50',
    bg: 'rgba(138,122,80,0.08)'
  },
  other: {
    label: 'Otro',
    icon: '📍',
    color: '#7A7570',
    bg: 'rgba(122,117,112,0.08)'
  }
};
