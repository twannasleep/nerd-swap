import type { MantineColorsTuple } from '@mantine/core';

// Custom primary color palette for Uniswap-like interface - pink/purple
export const primaryColor: MantineColorsTuple = [
  '#FEF6FF', // 0 - Lightest (background tint)
  '#FAECFE', // 1
  '#F5D9FD', // 2
  '#F0C5FB', // 3
  '#E9B1F9', // 4
  '#E29DF8', // 5
  '#DB89F6', // 6 - Base color (similar to Uniswap pink)
  '#C76FE5', // 7
  '#B356D4', // 8
  '#9E3DC3', // 9 - Darkest
];

// Dark color palette optimized for crypto interfaces
export const darkColor: MantineColorsTuple = [
  '#636363', // 0 - Lightest
  '#575757', // 1
  '#4A4A4A', // 2
  '#404040', // 3
  '#333333', // 4
  '#282828', // 5
  '#212121', // 6
  '#191A1F', // 7 - Base color (Uniswap-like dark)
  '#131519', // 8
  '#0A0A0F', // 9 - Darkest
];

// Complementary accent color (Uniswap secondary blue)
export const accentColor: MantineColorsTuple = [
  '#E6F1FF', // 0 - Lightest blue
  '#CCE3FF', // 1
  '#99C7FF', // 2
  '#66ABFF', // 3
  '#338FFF', // 4
  '#0073FF', // 5 - Base color
  '#006AE6', // 6
  '#005CCC', // 7
  '#004EB3', // 8
  '#004099', // 9 - Darkest
];

// Success green that works with purple primary
export const successColor: MantineColorsTuple = [
  '#E8F8F0', // 0 - Lightest green
  '#D1F1E0', // 1
  '#A3E4C1', // 2
  '#75D7A3', // 3
  '#47CA84', // 4
  '#1ABD65', // 5 - Base color
  '#17A65A', // 6
  '#148F4F', // 7
  '#117744', // 8
  '#0E6038', // 9 - Darkest
];

// Error red that works with purple primary
export const errorColor: MantineColorsTuple = [
  '#FFF0F0', // 0 - Lightest red
  '#FFD6D6', // 1
  '#FFB8B8', // 2
  '#FF9999', // 3
  '#FF7A7A', // 4
  '#FF5C5C', // 5 - Base color
  '#FF3D3D', // 6
  '#FF1F1F', // 7
  '#E60000', // 8
  '#CC0000', // 9 - Darkest
];

// Neutral gray palette for UI elements
export const neutralColor: MantineColorsTuple = [
  '#F5F5F5', // 0 - Lightest
  '#E5E5E5', // 1
  '#D4D4D4', // 2
  '#A3A3A3', // 3
  '#737373', // 4
  '#525252', // 5
  '#404040', // 6
  '#303030', // 7
  '#262626', // 8
  '#171717', // 9 - Darkest
];

// Warm accent color (Uniswap-like)
export const warmColor: MantineColorsTuple = [
  '#FFF1E5', // 0 - Lightest
  '#FFE2CC', // 1
  '#FFC599', // 2
  '#FFA866', // 3
  '#FF8B33', // 4
  '#FF6E00', // 5 - Base color
  '#E66300', // 6
  '#CC5800', // 7
  '#B34D00', // 8
  '#994200', // 9 - Darkest
];
