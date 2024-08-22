import * as promClient from 'prom-client';

export const defaultMetrics = promClient.collectDefaultMetrics;

defaultMetrics({ register: promClient.register });

export default promClient;