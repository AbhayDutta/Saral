import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Saral',
    description: 'Fill Indian government and bank forms by voice.',
    permissions: ['sidePanel', 'storage', 'activeTab', 'scripting'],
    host_permissions: ['https://api.sarvam.ai/*', 'https://openrouter.ai/*'],
    icons: {
      16: 'icon/icon16.png',
      32: 'icon/icon32.png',
      48: 'icon/icon48.png',
      128: 'icon/icon128.png',
    },
    action: {
      default_title: 'Saral',
      default_icon: {
        16: 'icon/icon16.png',
        32: 'icon/icon32.png',
        48: 'icon/icon48.png',
        128: 'icon/icon128.png',
      },
    },
    commands: {
      'open-saral': {
        suggested_key: {
          default: 'Ctrl+Shift+S',
          mac: 'Command+Shift+S',
        },
        description: 'Open the Saral side panel',
      },
    },
  },
});
