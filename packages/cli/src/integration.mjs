// Copyright (c) Meta Platforms, Inc. and affiliates.

import {validateIntegration} from './lib/config-schema.mjs';

/**
 * Type-preserving helper for an Astryx integration manifest.
 *
 * This is an intentionally tiny runtime identity function. Its value is the
 * exported TypeScript surface from `@astryxdesign/cli/integration`, so
 * manifests can get editor/type feedback without coupling to CLI internals.
 *
 * @template {import('./types/integration').AstryxIntegration} T
 * @param {T} integration
 * @returns {T}
 */
export function createIntegration(integration) {
  validateIntegration(integration);
  return integration;
}
