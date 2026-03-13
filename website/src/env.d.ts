/// <reference types="astro/client" />

interface Window {
  posthog?: {
    capture: (event: string, data?: Record<string, string | number | boolean>) => void;
  };
}
