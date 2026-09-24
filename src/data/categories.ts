import type { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface Category {
  id: string;
  name: string;
  tagline: string;
  icon: IconName;
  gradient: readonly [string, string];
}

export const CATEGORIES: Category[] = [
  { id: 'crochet', name: 'Crochet', tagline: 'Yarn & warmth', icon: 'flower-outline', gradient: ['#D9A94A', '#8B5E34'] },
  { id: 'jewellery', name: 'Handmade Jewellery', tagline: 'Timeless adornments', icon: 'diamond-outline', gradient: ['#B98A2E', '#6E4A1E'] },
  { id: 'resin', name: 'Resin Art', tagline: 'Crystallised moments', icon: 'water-outline', gradient: ['#A77038', '#5C3A20'] },
  { id: 'woolen', name: 'Woolen Flowers', tagline: 'Petals that never wilt', icon: 'leaf-outline', gradient: ['#8B9B5A', '#4E5A2F'] },
  { id: 'pottery', name: 'Pottery', tagline: 'Earth & fire', icon: 'wine-outline', gradient: ['#BF7B4A', '#6E3A22'] },
  { id: 'candles', name: 'Candles', tagline: 'Hand poured glow', icon: 'flame-outline', gradient: ['#C68A3F', '#7A4A20'] },
  { id: 'paintings', name: 'Paintings', tagline: 'Stories in colour', icon: 'brush-outline', gradient: ['#B56A52', '#6E352A'] },
  { id: 'embroidery', name: 'Embroidery', tagline: 'Needle & thread tales', icon: 'ribbon-outline', gradient: ['#A96A4B', '#5E3A27'] },
  { id: 'home-decor', name: 'Home Décor', tagline: 'Character for every home', icon: 'home-outline', gradient: ['#9C7A44', '#57432A'] },
  { id: 'gifts', name: 'Customized Gifts', tagline: 'Made all about you', icon: 'gift-outline', gradient: ['#B98A2E', '#7A5A24'] },
];

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}