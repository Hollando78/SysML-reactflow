import type { Preview } from '@storybook/react-vite';
import { ReactFlowProvider } from 'reactflow';
import type { Decorator } from '@storybook/react';

import 'reactflow/dist/style.css';

const withReactFlow: Decorator = (Story) => (
  <ReactFlowProvider>
    <Story />
  </ReactFlowProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      },
    },
    layout: 'fullscreen',
  },
  decorators: [withReactFlow],
};

export default preview;
