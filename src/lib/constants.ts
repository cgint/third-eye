export const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;
export const GEMINI_MODEL_NAME: string = import.meta.env.VITE_GEMINI_MODEL_NAME;
export const TALK_PASSWORD: string = import.meta.env.VITE_TALK_PASSWORD;

export const IMAGE_MIME_TYPE = import.meta.env.VITE_IMAGE_MIME_TYPE || 'image/webp';
export const IMAGE_EXTENSION = import.meta.env.VITE_IMAGE_EXTENSION || 'webp';
export const IMAGE_QUALITY = import.meta.env.VITE_IMAGE_QUALITY || 0.5;
export const IMAGE_WIDTH = import.meta.env.VITE_IMAGE_WIDTH || 2048;
export const IMAGE_HEIGHT = import.meta.env.VITE_IMAGE_HEIGHT || 2048;