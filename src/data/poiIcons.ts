export const poiIcons = {
  temple: { label: 'Temple', url: '/icons/tabler/temple.svg' },
  daishido: { label: 'Daishi-dō', url: '/icons/tabler/daishido.svg' },
  shrine: { label: 'Shrine', url: '/icons/tabler/shrine.svg' },
  cave: { label: 'Cave / Rock', url: '/icons/tabler/cave.svg' },
  'pilgrim-lodging': { label: 'Pilgrim lodging', url: '/icons/tabler/pilgrimlodging.svg' },
  'enclosed-hut': { label: 'Enclosed hut', url: '/icons/tabler/enclosedhut.svg' },
  'semi-enclosed-hut': { label: 'Semi-enclosed hut', url: '/icons/tabler/semienclosedhut.svg' },
} as const;

export type PoiIconKey = keyof typeof poiIcons;
