import type { Preview } from '@storybook/react-vite';
import { ReactFlowProvider } from 'reactflow';
import type { Decorator } from '@storybook/react';

import 'reactflow/dist/style.css';

const withReactFlow: Decorator = (Story) => (
  <ReactFlowProvider>
    <div style={{ width: '100%', height: '600px', background: '#0b0c0f' }}>
      <Story />
    </div>
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
