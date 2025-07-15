import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    backgrounds: {
      default: 'disney-light',
      values: [
        {
          name: 'disney-light',
          value: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #fdf2f8 100%)',
        },
        {
          name: 'white',
          value: '#ffffff',
        },
        {
          name: 'disney-dark',
          value: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #be185d 100%)',
        },
      ],
    },
    docs: {
      story: {
        inline: true,
      },
    },
  },
};

export default preview;