import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { env } from './config/env/env.js';

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'backend',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const exporter = new OTLPTraceExporter({
  url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
});

const sdk = new NodeSDK({
  resource,
  traceExporter: exporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-pino': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  void sdk.shutdown().finally(() => process.exit(0));
});
