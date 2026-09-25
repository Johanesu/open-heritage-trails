export const poiIcons = {
  temple: { label: 'Temple', url: '/icons/henro-hub/temple.svg' },
  daishido: { label: 'Daishi-dō', url: '/icons/henro-hub/daishido.svg' },
  shrine: { label: 'Shrine', url: '/icons/henro-hub/shrine.svg' },
  cave: { label: 'Cave / Rock', url: '/icons/henro-hub/cave.svg' },
  'pilgrim-lodging': { label: 'Pilgrim lodging', url: '/icons/henro-hub/pilgrimlodging.svg' },
  'enclosed-hut': { label: 'Enclosed hut', url: '/icons/henro-hub/enclosedhut.svg' },
  'semi-enclosed-hut': { label: 'Semi-enclosed hut', url: '/icons/henro-hub/semienclosedhut.svg' },
} as const;

export type PoiIconKey = keyof typeof poiIcons;
