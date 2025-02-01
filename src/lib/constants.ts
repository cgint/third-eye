import { NoopLogger } from "./logging/RemoteRestLogger";
import { RemoteRestLogger } from "./logging/RemoteRestLogger";

export const APP_NAME = 'third-eye';

export const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY;
export const GEMINI_MODEL_NAME: string = import.meta.env.VITE_GEMINI_MODEL_NAME;
export const TALK_PASSWORD: string = import.meta.env.VITE_TALK_PASSWORD;
export const REMOTE_LOGGER_BASE_URL: string = import.meta.env.VITE_REMOTE_LOGGER_BASE_URL;
export const REMOTE_LOGGER_PASSWORD: string = import.meta.env.VITE_REMOTE_LOGGER_PASSWORD;

export const IMAGE_MIME_TYPE = import.meta.env.VITE_IMAGE_MIME_TYPE || 'image/webp';
export const IMAGE_EXTENSION = import.meta.env.VITE_IMAGE_EXTENSION || 'webp';
export const IMAGE_QUALITY_MAX = import.meta.env.VITE_IMAGE_QUALITY_MAX || 0.8;
export const IMAGE_WIDTH = import.meta.env.VITE_IMAGE_WIDTH || 1024;
export const IMAGE_HEIGHT = import.meta.env.VITE_IMAGE_HEIGHT || 1024;

export const remote_logger = REMOTE_LOGGER_BASE_URL != "" ? new RemoteRestLogger(REMOTE_LOGGER_BASE_URL, REMOTE_LOGGER_PASSWORD, APP_NAME) : new NoopLogger();
