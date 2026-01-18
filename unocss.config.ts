import extratorUna from '@una-ui/extractor-vue-script'
import presetUna from '@una-ui/preset'
import prefixes from '@una-ui/preset/prefixes'
import presetAnimations from 'unocss-preset-animations'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'

import {
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default {
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWebFonts({
      provider: 'fontshare',
      fonts: {
        body: 'Nunito',
        sans: 'General Sans',
        serif: 'Gambetta',
        subtitle: 'Pilcrow rounded',
        title: 'Khand',
      },
      processors: [
        createLocalFontProcessor({
          cacheDir: 'node_modules/.cache/unocss/fonts',
          fontAssetsDir: 'public/fonts',
          fontServeBaseUrl: '/fonts',
        }),
      ],
    }),
    presetUna(),
    presetAnimations(),
  ],
  safelist: [
    // Ensure these rules are always generated
    // because they are generated dynamically in some cases
    // Border color utilities used dynamically by components (dark mode hover)
    'dark:hover:b-red',
    'dark:hover:b-blue',
    'dark:hover:b-purple',
    'dark:hover:b-green',
    'dark:hover:b-orange',
    'dark:hover:b-pink',
    'dark:hover:b-yellow',
    'dark:hover:b-indigo',
    'dark:hover:b-cyan',
    'dark:hover:b-gray',
    'dark:hover:b-slate',
    'dark:hover:b-violet',
    // fallback / legacy
    'dark:hover:b-lime',
    // Dynamic badge utilities - these are used in shortcuts but need to be pre-generated
    // Status colors (used in badge-soft-* shortcuts)
    'bg-yellow-50', 'bg-green-50', 'bg-red-50', 'bg-gray-50',
    'n-yellow-700', 'n-green-700', 'n-red-700', 'n-gray-700',
    'ring-yellow-700/10', 'ring-green-700/10', 'ring-red-700/10', 'ring-gray-700/10',
    'dark:bg-yellow-400/10', 'dark:bg-green-400/10', 'dark:bg-red-400/10', 'dark:bg-gray-400/10',
    'dark:n-yellow-400', 'dark:n-green-400', 'dark:n-red-400', 'dark:n-gray-400',
    'dark:ring-yellow-400/30', 'dark:ring-green-400/30', 'dark:ring-red-400/30', 'dark:ring-gray-400/30',
    // Type colors (used in badge-outline-* shortcuts)
    'n-blue-700', 'n-purple-700', 'n-orange-700', 'n-pink-700', 'n-indigo-700',
    'ring-blue-700/10', 'ring-purple-700/10', 'ring-orange-700/10', 'ring-pink-700/10', 'ring-indigo-700/10',
    'dark:n-blue-400', 'dark:n-purple-400', 'dark:n-orange-400', 'dark:n-pink-400', 'dark:n-indigo-400',
    'dark:ring-blue-400/30', 'dark:ring-purple-400/30', 'dark:ring-orange-400/30', 'dark:ring-pink-400/30', 'dark:ring-indigo-400/30',
  ],
  shortcuts: [
  ],
  extractors: [
    extratorUna({
      prefixes,
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
}
