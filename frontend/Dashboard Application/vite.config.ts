import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets for better performance
    assetsInlineLimit: 2048, // Inline assets < 2KB
    rollupOptions: {
      output: {
        // Optimize asset file names for caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Manual chunk splitting for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries - Radix UI components
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-icons',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-toggle',
            '@radix-ui/react-tooltip',
          ],
          // TanStack Query for data fetching
          'query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          // Charts and data visualization
          'charts': ['recharts'],
          // Form handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    // Enable source maps for debugging but exclude from production
    sourcemap: process.env.NODE_ENV === 'development',
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'date-fns',
      'recharts',
    ],
    // Don't pre-bundle lucide-react to enable tree-shaking
    exclude: ['lucide-react'],
  },
  // Improve dev server performance
  server: {
    fs: {
      // Allow serving files outside of the root
      strict: false,
    },
  },
});
