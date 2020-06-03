/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const plugin = require('tailwindcss/plugin');

module.exports = {
  purge: {
    // The default here targets a standard CRA
    // setup, but can be overridden as needed
    content: ['./src/**/*.tsx', './public/index.html'],
    whitelist: [],
  },
  theme: {
    extend: {
      padding: {
        7: '1.75rem',
      },
      margin: {
        11: '2.75rem',
        18: '4.5rem',
      },
      borderRadius: {
        xl: '.75rem',
      },
      flex: {
        2: '2',
        4: '4',
        7: '7',
      },
    },
    screens: {
      mobileLandscape: '480px',
      tablet: { raw: '(min-width: 768px) and (min-height: 481px)' },
      desktop: '1024px',
      desktopXl: '1441px',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '22px',
      xxl: '28px',
      xxxl: '32px',
    },
    fontFamily: {
      body: [
        'Inter',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        '"Fira Sans"',
        '"Droid Sans"',
        '"Helvetica Neue"',
        'sans-serif',
      ],
      header: [
        'Metropolis',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        '"Fira Sans"',
        '"Droid Sans"',
        '"Helvetica Neue"',
        'sans-serif',
      ],
      mono: [
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    // These colors are based on Protocol but are
    // slightly different. They can be viewed here:
    // https://bit.ly/fxa-settings-colors
    colors: {
      transparent: 'transparent',
      black: '#000',
      white: '#fff',
      grey: {
        10: '#FAFAFB',
        50: '#F9F9FA',
        100: '#E7E7E7',
        200: '#C2C2C2',
        300: '#9E9E9E',
        400: '#6D6D6E',
        500: '#3D3D3D',
        600: '#0C0C0D',
      },
      pink: {
        50: '#FFDEF0',
        100: '#FFB4DB',
        200: '#FF8AC5',
        300: '#FF6BBA',
        400: '#FF4AA2',
        500: '#FF298A',
        600: '#E31587',
        700: '#C60084',
        800: '#7F145B',
        900: '#50134B',
      },
      red: {
        50: '#FFDFE7',
        100: '#FFBDC5',
        200: '#FF9AA2',
        300: '#FF848B',
        400: '#FF6A75',
        500: '#FF4F5E',
        600: '#E22850',
        700: '#C50042',
        800: '#810220',
        900: '#440306',
      },
      yellow: {
        50: '#FFFFCC',
        100: '#FFFF98',
        200: '#FFEA80',
        300: '#FFD567',
        400: '#FFBD4F',
        500: '#FFA436',
        600: '#E27F2E',
        700: '#C45A27',
        800: '#A7341F',
        900: '#960E18',
      },
      orange: {
        50: '#FFF4DE',
        100: '#FFD5B2',
        200: '#FFB587',
        300: '#FFA266',
        400: '#FF8A50',
        500: '#FF7139',
        600: '#E25920',
        700: '#CC3D00',
        800: '#9E280B',
        900: '#7C1504',
      },
      blue: {
        50: '#AAF2FF',
        100: '#80EBFF',
        200: '#00DDFF',
        300: '#00B3F4',
        400: '#0090ED',
        500: '#0060DF',
        600: '#0250BB',
        700: '#054096',
        800: '#073072',
        900: '#09204D',
      },
      green: {
        50: '#E3FFF3',
        100: '#D1FFEE',
        200: '#B3FFE3',
        300: '#88FFD1',
        400: '#54FFBD',
        500: '#3FE1B0',
        600: '#3AD5B3',
        700: '#1CC5A0',
        800: '#00A49A',
        900: '#00736C',
      },
      violet: {
        50: '#F7E2FF',
        100: '#F6B8FF',
        200: '#F68FFF',
        300: '#F770FF',
        400: '#D74CF0',
        500: '#B833E1',
        600: '#952BB9',
        700: '#722291',
        800: '#4E1A69',
        900: '#2B1141',
      },
      purple: {
        50: '#E7DFFF',
        100: '#D9BFFF',
        200: '#CB9EFF',
        300: '#C689FF',
        400: '#AB71FF',
        500: '#9059FF',
        600: '#7542E5',
        700: '#592ACB',
        800: '#45278D',
        900: '#321C64',
      },
    },
  },
  variants: {
    width: ['responsive', 'hover', 'focus'],
    height: ['responsive', 'hover', 'focus'],
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const customUtilities = {
        '.clip-auto': {
          clip: 'auto',
        },
      };

      addUtilities(customUtilities, ['responsive', 'hover', 'focus']);
    }),
  ],
};
