import type { CorsOptions } from 'cors';

const production: CorsOptions = {
    origin: ["https://example.com", "https://app.example.com"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

const develop: CorsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

const corsConfig = { production, develop };

export type CorsConfig = typeof corsConfig;

export default corsConfig;
