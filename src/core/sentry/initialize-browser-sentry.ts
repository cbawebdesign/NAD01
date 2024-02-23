import configuration from '~/configuration';
import { isBrowser } from '~/core/generic/is-browser';

let initialized = false;

/**
 * @description Loads and initializes Sentry for tracking runtime errors
 */
export async function initializeBrowserSentry() {
  const dsn = configuration.sentry.dsn;

  if (!isBrowser() || initialized) {
    return;
  }

  if (!dsn) {
    if (!configuration.production) {
      warnSentryNotConfigured();
    }

    return;
  }

  const { Integrations: SentryIntegrations } = await import('@sentry/tracing');
  const Sentry = await import('@sentry/react');

  Sentry.init({
    dsn,
    integrations: [new SentryIntegrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: configuration.environment,
  });

  initialized = true;
}

function warnSentryNotConfigured() {
  console.warn(
    `Sentry DSN was not provided. Please add a SENTRY_DSN environment variable to enable error tracking.`,
  );
}
