import type { Accessory, AvatarSpec, Expression, HairStyle } from '../types';

export const SKINS = [
  { name: 'Porcelain', value: '#FDE0CC' },
  { name: 'Peach', value: '#F6C9A5' },
  { name: 'Honey', value: '#E5A877' },
  { name: 'Caramel', value: '#C98A5B' },
  { name: 'Cocoa', value: '#9C6740' },
  { name: 'Espresso', value: '#6B4328' },
];
export const HAIR_COLORS = [
  { name: 'Black', value: '#2B2230' },
  { name: 'Brown', value: '#5B3A29' },
  { name: 'Auburn', value: '#9A4B2E' },
  { name: 'Blonde', value: '#E2B857' },
  { name: 'Ginger', value: '#D9763A' },
  { name: 'Pink', value: '#E58AB6' },
  { name: 'Blue', value: '#6FA3E8' },
  { name: 'Lilac', value: '#A78BDA' },
];
export const OUTFITS = [
  { name: 'Coral', value: '#F4978E' },
  { name: 'Mint', value: '#7FCFAF' },
  { name: 'Sky', value: '#7FB5EA' },
  { name: 'Lavender', value: '#B39DEB' },
  { name: 'Butter', value: '#F2CB5F' },
  { name: 'Rose', value: '#EE8FB4' },
  { name: 'Teal', value: '#4FA9A3' },
  { name: 'Slate', value: '#8E9AAF' },
];
export const BGS = [
  { name: 'Peach', value: '#FFE3D6' },
  { name: 'Mint', value: '#D9F3E6' },
  { name: 'Sky', value: '#DCEBFB' },
  { name: 'Lilac', value: '#E9E0FB' },
  { name: 'Butter', value: '#FFF3C4' },
  { name: 'Rose', value: '#FBDCE8' },
];
export const HAIR_STYLES: { id: HairStyle; name: string }[] = [
  { id: 'short', name: 'Short' },
  { id: 'long', name: 'Long' },
  { id: 'curly', name: 'Curly' },
  { id: 'bun', name: 'Bun' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'scarf', name: 'Scarf' },
  { id: 'bald', name: 'No hair' },
];
export const ACCESSORIES: { id: Accessory; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'glasses', name: 'Glasses' },
  { id: 'sunglasses', name: 'Sunglasses' },
  { id: 'headphones', name: 'Headphones' },
  { id: 'flower', name: 'Flower clip' },
];
export const EXPRESSIONS: { id: Expression; name: string }[] = [
  { id: 'smile', name: 'Smile' },
  { id: 'grin', name: 'Big grin' },
  { id: 'calm', name: 'Calm' },
  { id: 'wow', name: 'Surprised' },
];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export function randomAvatar(): AvatarSpec {
  return {
    skin: Math.floor(Math.random() * SKINS.length),
    hairStyle: pick(HAIR_STYLES).id,
    hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
    outfit: Math.floor(Math.random() * OUTFITS.length),
    accessory: pick(ACCESSORIES).id,
    expression: pick(EXPRESSIONS).id,
    bg: Math.floor(Math.random() * BGS.length),
  };
}
