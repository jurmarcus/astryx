// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {Section} from '@astryxdesign/core/Section';
import {CodeExampleBlock} from './CodeExampleBlock';
import {packages} from '../generated/packageRegistry';

// Strip "Theme: " prefix and " Theme" suffix from the registered displayName
// so headings read as the brand wordmark ("Y2K") rather than "Theme: Y2K Theme".
function brandLabel(displayName: string): string {
  return displayName.replace(/^Theme:\s*/, '').replace(/\s*Theme$/, '');
}

interface ThemeInstallBlockProps {
  /** Full npm package name, e.g. `@astryxdesign/theme-y2k`. */
  packageName: string;
}

/**
 * "Use this theme" snippet shown below the themed preview on /themes —
 * `npm install` + the matching import so visitors can copy both without
 * leaving the page.
 */
export function ThemeInstallBlock({packageName}: ThemeInstallBlockProps) {
  const pkg = packages.find(p => p.name === packageName);
  const themeLabel = pkg
    ? brandLabel(pkg.displayName) || pkg.displayName
    : '';
  const slug = packageName.replace(/^@astryxdesign\/theme-/, '');
  const importName = `${slug}Theme`;
  const installCode = `npm install ${packageName}`;
  const importCode = `import {Theme} from '@astryxdesign/core';
import {${importName}} from '${packageName}';

<Theme theme={${importName}}>{/* your app */}</Theme>`;

  return (
    <Section>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2} type="display-3">
            Use the {themeLabel} theme
          </Heading>
          <Text type="body" color="secondary">
            Install the package, then wrap your app in {'<Theme>'}. See the{' '}
            <Link
              type="body"
              color="secondary"
              href="/docs/theme"
              hasUnderline>
              Theme System guide
            </Link>{' '}
            for SSR, light/dark mode, and customization.
          </Text>
        </VStack>
        <CodeExampleBlock
          code={installCode}
          language="bash"
          hasCopyButton
          isWrapped
          width="100%"
        />
        <CodeExampleBlock
          code={importCode}
          language="tsx"
          hasCopyButton
          isWrapped
          width="100%"
        />
      </VStack>
    </Section>
  );
}
