import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import Terminal from 'vite-plugin-terminal';

export default defineConfig({
  plugins: [reactRouter({ future: {} }), tsconfigPaths(), Terminal({console: 'terminal'})],
});
