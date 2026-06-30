// Copyright (c) Meta Platforms, Inc. and affiliates.

import {validateConfig} from './lib/config-schema.mjs';

/**
 * Type-preserving helper for the Astryx config file.
 *
 * This is an intentionally tiny runtime identity function. Its value is the
 * exported TypeScript surface from `@astryxdesign/cli/config`, so config files
 * can get editor/type feedback without coupling to CLI internals.
 *
 * @template {import('./types/config').AstryxConfig} T
 * @param {T} config
 * @returns {T}
 */
export function createConfig(config) {
  validateConfig(config);
  return config;
}
