declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    API_PREFIX?: string;
    NODE_ENV?: string;
    MONGODB_URI?: string;
    DATABASE_NAME?: string;
    REDIS_URL?: string;
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_TTL?: string;
    MAX_FILE_SIZE?: string;
    JWT_SECRET?: string;
    JWT_EXPIRE?: string;
    GOOGLE_OAUTH_CLIENT_ID?: string;
    GOOGLE_OAUTH_CLIENT_SECRET?: string;
    GOOGLE_OAUTH_REDIRECT?: string;
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    GEMINI_API_KEY?: string;
    GROQ_API_KEY?: string;
    GMAIL_USER?: string;
    GMAIL_PASS?: string;
    PYTHON_SERVICE_URL?: string;
    INTERNAL_API_KEY?: string;
  }
}
