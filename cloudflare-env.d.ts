/// <reference types="@cloudflare/workers-types" />

export type AppEnv = {
  DB: D1Database;
  MEDIA: R2Bucket;
  CACHE: KVNamespace;
  ASSETS?: Fetcher;
  SESSION_SECRET?: string;
  GOOGLE_PLACES_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
  ENVIRONMENT?: string;
  SALON_NAME?: string;
  SALON_PHONE_PRIMARY?: string;
  SALON_PHONE_SECONDARY?: string;
  SALON_ADDRESS?: string;
  EMAIL?: {
    send: (msg: unknown) => Promise<unknown>;
  };
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_FROM_APPOINTMENTS?: string;
  MAIL_FROM_GIFTS?: string;
  MAIL_FROM_STAFF?: string;
  MAIL_FROM_NAME?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CF_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
};

export {};
