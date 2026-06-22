// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {List, ListItem} from '@astryxdesign/core/List';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Selector} from '@astryxdesign/core/Selector';
import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Outline, type OutlineItem} from '@astryxdesign/core/Outline';
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const OUTLINE_ITEMS: OutlineItem[] = [
  {id: 'prerequisites', label: 'Prerequisites', level: 2},
  {id: 'install-package', label: 'Install the package', level: 2},
  {id: 'configure-theming', label: 'Configure theming', level: 2},
  {id: 'next-steps', label: 'Next steps', level: 2},
];

const OUTLINE_OPTIONS = OUTLINE_ITEMS.map(item => ({
  value: item.id,
  label: item.label,
}));

const styles = stylex.create({
  docGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr) 220px',
      '@media (max-width: 768px)': 'minmax(0, 1fr)',
    },
    gap: 32,
    maxWidth: 960,
    marginInline: 'auto',
  },
  docBody: {
    minWidth: 0,
  },
  outlineAside: {
    paddingBlockStart: 120,
    display: {
      default: 'block',
      '@media (max-width: 768px)': 'none',
    },
  },
  outlineSticky: {
    position: 'sticky',
    top: 24,
    alignSelf: 'start',
  },
  mobileOutlineSelector: {
    display: {
      default: 'none',
      '@media (max-width: 768px)': 'block',
    },
  },
});

function getScrollRoot(element: HTMLElement | null): HTMLElement | Window {
  let current = element?.parentElement ?? null;

  while (current != null) {
    const style = window.getComputedStyle(current);
    const isScrollable =
      /(auto|scroll|overlay)/.test(style.overflowY) &&
      current.scrollHeight > current.clientHeight;

    if (isScrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return window;
}

function getScrollTop(root: HTMLElement | Window): number {
  return root instanceof Window ? window.scrollY : root.scrollTop;
}

function getViewportHeight(root: HTMLElement | Window): number {
  return root instanceof Window ? window.innerHeight : root.clientHeight;
}

function getScrollHeight(root: HTMLElement | Window): number {
  return root instanceof Window
    ? document.documentElement.scrollHeight
    : root.scrollHeight;
}

function getRootTop(root: HTMLElement | Window): number {
  return root instanceof Window ? 0 : root.getBoundingClientRect().top;
}

function scrollRootTo(root: HTMLElement | Window, top: number) {
  root.scrollTo({top, behavior: 'smooth'});
}

function usePageOutline(items: OutlineItem[]) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState(items[0]?.id);

  const scrollToId = (id: string) => {
    const target = document.getElementById(id);
    const root = getScrollRoot(contentRef.current);
    if (target == null) {
      setActiveId(id);
      return;
    }

    const nextTop =
      getScrollTop(root) +
      target.getBoundingClientRect().top -
      getRootTop(root);

    scrollRootTo(root, nextTop);
    setActiveId(id);
    window.history.pushState(null, '', `#${id}`);
  };

  useEffect(() => {
    const updateActiveId = () => {
      const root = getScrollRoot(contentRef.current);
      let nextId = items[0]?.id;
      let closestTop = Number.NEGATIVE_INFINITY;
      const rootTop = getRootTop(root);

      for (const item of items) {
        const target = document.getElementById(item.id);
        if (target == null) {
          continue;
        }

        const top = target.getBoundingClientRect().top - rootTop;
        if (top <= 96 && top > closestTop) {
          closestTop = top;
          nextId = item.id;
        }
      }

      if (
        getScrollTop(root) + getViewportHeight(root) >=
        getScrollHeight(root) - 2
      ) {
        nextId = items[items.length - 1]?.id;
      }

      setActiveId(nextId);
    };

    updateActiveId();
    // Capture scroll events from the page, the docsite preview frame, or any
    // nested scroll container that hosts the template.
    document.addEventListener('scroll', updateActiveId, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', updateActiveId);

    return () => {
      document.removeEventListener('scroll', updateActiveId, true);
      window.removeEventListener('resize', updateActiveId);
    };
  }, [items]);

  return {activeId, contentRef, scrollToId};
}

export default function TechnicalDocumentationPage() {
  const {activeId, contentRef, scrollToId} = usePageOutline(OUTLINE_ITEMS);

  return (
    <Layout
      height="auto"
      content={
        <LayoutContent ref={contentRef} isScrollable={false} padding={8}>
          <section {...stylex.props(styles.docGrid)}>
            <article {...stylex.props(styles.docBody)}>
              <VStack gap={8}>
                <VStack gap={2}>
                  <Text type="display-1">
                    Getting started with Product Name
                  </Text>
                  <Text type="supporting" color="secondary">
                    Last updated March 30, 2026
                  </Text>
                  <div {...stylex.props(styles.mobileOutlineSelector)}>
                    <Selector
                      label="On this page"
                      isLabelHidden
                      options={OUTLINE_OPTIONS}
                      value={activeId}
                      onChange={scrollToId}
                      width="100%"
                    />
                  </div>
                </VStack>

                <Card>
                  <VStack gap={3}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <HStack gap={2} vAlign="center">
                          <Icon
                            icon={SparklesIcon}
                            size="sm"
                            color="secondary"
                          />
                          <Text type="body" weight="semibold">
                            AI Assistance
                          </Text>
                        </HStack>
                      </StackItem>
                      <Button
                        label="Copy prompt"
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={ClipboardDocumentIcon} />}
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            'Help me get set up with Product Name. Based on my project, do the following: 1. Install @astryxdesign/core and the StyleX compiler. 2. Wrap my app in ThemeProvider. 3. Replace one existing component with an XDS equivalent. After setup, suggest relevant next steps based on my project.',
                          );
                        }}
                      />
                      <DropdownMenu
                        button={{
                          label: 'More options',
                          variant: 'ghost',
                          size: 'sm',
                          isIconOnly: true,
                          icon: <Icon icon={ChevronDownIcon} />,
                        }}
                        items={[
                          {label: 'Open in v0', onClick: () => {}},
                          {label: 'Open in Claude', onClick: () => {}},
                          {label: 'Open in ChatGPT', onClick: () => {}},
                          {label: 'Open in Cursor', onClick: () => {}},
                        ]}
                      />
                    </HStack>
                    <Text type="body" color="secondary">
                      Help me get set up with Product Name. Based on my project,
                      do the following: 1. Install @astryxdesign/core and the StyleX
                      compiler. 2. Wrap my app in ThemeProvider. 3. Replace one
                      existing component with an XDS equivalent.
                    </Text>
                  </VStack>
                </Card>

                <VStack gap={4}>
                  <Heading id="prerequisites" level={2}>
                    Prerequisites
                  </Heading>
                  <List density="compact" listStyle="disc">
                    <ListItem label="Node.js 18+" />
                    <ListItem label="React 18 or 19" />
                    <ListItem label="A package manager (npm, yarn, or pnpm)" />
                  </List>
                </VStack>

                <Divider />

                <VStack gap={4}>
                  <Heading id="install-package" level={2}>
                    Install the package
                  </Heading>
                  <Text type="body">
                    Every project starts with installing the core package. This
                    gives you access to all components, tokens, and utilities.
                  </Text>
                  <VStack gap={2}>
                    <Text type="body" weight="bold">
                      Step 1: Install the core package
                    </Text>
                    <CodeBlock
                      code="npm install @astryxdesign/core"
                      language="bash"
                      width="100%"
                    />
                  </VStack>
                  <VStack gap={2}>
                    <Text type="body" weight="bold">
                      Step 2: Add the StyleX compiler
                    </Text>
                    <Text type="body" color="secondary">
                      XDS uses StyleX for styling. Add the compiler plugin to
                      your build configuration.
                    </Text>
                    <CodeBlock
                      code="npm install @stylexjs/babel-plugin"
                      language="bash"
                      width="100%"
                    />
                  </VStack>
                  <VStack gap={2}>
                    <Text type="body" weight="bold">
                      Step 3: Import your first component
                    </Text>
                    <CodeBlock
                      code={`import { Button } from '@astryxdesign/core/Button';

export default function App() {
  return <Button label="Hello XDS" variant="primary" />;
}`}
                      language="tsx"
                      width="100%"
                    />
                  </VStack>
                </VStack>

                <Divider />

                <VStack gap={4}>
                  <Heading id="configure-theming" level={2}>
                    Configure theming
                  </Heading>
                  <Text type="body">
                    XDS ships with a default theme that works out of the box. To
                    customize colors, typography, and spacing, wrap your app in
                    a theme provider.
                  </Text>
                  <CodeBlock
                    code={`import { ThemeProvider } from '@astryxdesign/core/Theme';

export default function App({ children }) {
  return (
    <ThemeProvider theme="default">
      {children}
    </ThemeProvider>
  );
}`}
                    language="tsx"
                    width="100%"
                  />
                  <Text type="body" color="secondary">
                    See the theming guide for the full list of customizable
                    tokens.
                  </Text>
                </VStack>

                <Divider />

                <VStack gap={4}>
                  <Heading id="next-steps" level={2}>
                    Next steps
                  </Heading>
                  <List density="compact" listStyle="disc">
                    <ListItem label="Fundamental concepts — How theming, layout, and composition work" />
                    <ListItem label="Component API reference — Props, variants, and examples for every component" />
                    <ListItem label="Accessibility — Built-in a11y features and ARIA patterns" />
                    <ListItem label="CLI tools — Scaffold projects and manage templates" />
                    <ListItem label="Design tokens — Colors, spacing, typography, and sizing" />
                  </List>
                </VStack>
              </VStack>
            </article>
            <aside {...stylex.props(styles.outlineAside)}>
              <div {...stylex.props(styles.outlineSticky)}>
                <Outline
                  items={OUTLINE_ITEMS}
                  activeId={activeId}
                  onActiveIdChange={scrollToId}
                />
              </div>
            </aside>
          </section>
        </LayoutContent>
      }
    />
  );
}
