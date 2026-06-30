// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createConfig} from './config.mjs';
import {createIntegration} from './integration.mjs';

describe('createConfig', () => {
  it('returns a valid minimal config unchanged', () => {
    const config = {integrations: ['@acme/widgets']};
    expect(createConfig(config)).toBe(config);
    expect(createConfig({})).toEqual({});
  });

  it('accepts hooks.postCodemod with a buildCommand function', () => {
    const config = {
      hooks: {postCodemod: [{name: 'format', buildCommand: () => null}]},
    };
    expect(createConfig(config)).toBe(config);
  });

  it('rejects unknown keys (strict)', () => {
    expect(() => createConfig({packages: ['./libs']})).toThrow(/packages/);
  });

  it('rejects a non-array integrations field', () => {
    expect(() => createConfig({integrations: '@acme/widgets'})).toThrow(
      /integrations/,
    );
  });

  it('rejects a non-URL issuesUrl', () => {
    expect(() => createConfig({issuesUrl: 'not-a-url'})).toThrow(/issuesUrl/);
  });

  it('rejects a postCodemod hook without buildCommand', () => {
    expect(() =>
      createConfig({hooks: {postCodemod: [{name: 'empty'}]}}),
    ).toThrow(/buildCommand/);
  });
});

describe('createIntegration', () => {
  it('returns a valid minimal integration unchanged', () => {
    const integration = {components: './src'};
    expect(createIntegration(integration)).toBe(integration);
    expect(createIntegration({})).toEqual({});
  });

  it('rejects unknown keys (strict)', () => {
    expect(() => createIntegration({name: '@acme/widgets'})).toThrow(/name/);
  });

  it('rejects a non-URL issuesUrl', () => {
    expect(() => createIntegration({issuesUrl: 'nope'})).toThrow(/issuesUrl/);
  });
});
