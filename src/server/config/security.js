import rateLimit from "express-rate-limit";

function parseOrigins(value = "") {
    return value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

function envLimit(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isInteger(value) && value > 0 ? value : fallback;
}

export const allowedOrigins = parseOrigins(process.env.CORS_ALLOWED_ORIGINS);

export const corsOptions = {
    origin(origin, callback) {
        // Requests without Origin are same-origin or non-browser requests.
        callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400
};

export const helmetOptions = {
    contentSecurityPolicy: process.env.NODE_ENV === "production"
        ? {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                connectSrc: ["'self'", ...allowedOrigins],
                fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                objectSrc: ["'none'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]
            }
        }
        : false,
    crossOriginEmbedderPolicy: false
};

const rateLimitOptions = {
    windowMs: 15 * 60 * 1000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." }
};

export const apiLimiter = rateLimit({
    ...rateLimitOptions,
    limit: envLimit("API_RATE_LIMIT_MAX", 300)
});

export const loginLimiter = rateLimit({
    ...rateLimitOptions,
    limit: envLimit("LOGIN_RATE_LIMIT_MAX", 5)
});
