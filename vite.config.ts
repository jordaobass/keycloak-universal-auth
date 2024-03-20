import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: false,
      outDir: 'dist',
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'angular/index': resolve(__dirname, 'src/adapters/angular/index.ts'),
        'react/index': resolve(__dirname, 'src/adapters/react/index.ts'),
        'vue/index': resolve(__dirname, 'src/adapters/vue/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'keycloak-js',
        /^@angular\//,
        'react',
        'react-dom',
        'react/jsx-runtime',
        'vue',
        /^rxjs/,
      ],
      output: {
        globals: {
          'keycloak-js': 'Keycloak',
          react: 'React',
          'react-dom': 'ReactDOM',
          vue: 'Vue',
        },
      },
    },
  },
});
