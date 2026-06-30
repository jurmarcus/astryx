// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * A command to run as part of a post-codemod hook. Returned by a hook's
 * `buildCommand` and executed via `execFile` after codemods write files.
 */
export interface PostCodemodCommand {
  command: string;
  args?: string[];
  options?: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    timeout?: number;
  };
}

/**
 * A post-codemod hook. `buildCommand` receives the package directory and the
 * list of files changed by codemods, and returns the command to run (or a
 * nullish value to skip).
 */
export type PostCodemodHook = {
  name?: string;
  buildCommand: (ctx: {
    packageDir: string;
    files: string[];
  }) =>
    | PostCodemodCommand
    | null
    | undefined
    | Promise<PostCodemodCommand | null | undefined>;
};

/** User config exported from astryx.config.{ts,mjs,js}. */
export interface AstryxConfig {
  /** Integration package names to load. */
  integrations?: string[];
  /** Where to file issues/feedback for this project. */
  issuesUrl?: string;
  /** Lifecycle hooks. */
  hooks?: {
    postCodemod?: PostCodemodHook[];
  };
}

export declare function createConfig<T extends AstryxConfig>(config: T): T;
