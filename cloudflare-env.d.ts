/// <reference types="@cloudflare/workers-types" />

export type AppEnv = {
  DB: D1Database;
  MEDIA: R2Bucket;
  CACHE: KVNamespace;
  ASSETS?: Fetcher;
  SESSION_SECRET?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
  ENVIRONMENT?: string;
  SALON_NAME?: string;
  SALON_PHONE_PRIMARY?: string;
  SALON_PHONE_SECONDARY?: string;
  SALON_ADDRESS?: string;
  EMAIL?: {
    send: (msg: {
      to: string | string[];
      from: { email: string; name?: string };
      subject: string;
      html?: string;
      text?: string;
    }) => Promise<unknown>;
  };
};

export {};
