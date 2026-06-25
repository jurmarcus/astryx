// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Supplies metadata for the /components gallery index. That page is a client
 * component ('use client'), which cannot export metadata, so this server layout
 * provides it. The dynamic /components/[name] pages set their own per-component
 * metadata via generateMetadata, which overrides the defaults declared here.
 */

import type {Metadata} from 'next';
import {pageMetadata} from '../../../lib/pageMetadata';
import {SITE_NAME} from '../../../lib/siteConfig';

// Spread the shared helper for the description + canonical + social cards, then
// override `title` with an explicit default + template. A plain string title on
// this layout would consume the root layout's title template, leaving the
// /components/[name] pages with a bare "<Component>" title instead of
// "<Component> · Astryx"; re-declaring the template here keeps the suffix.
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Components',
    description:
      'Browse every Astryx component with copy-ready examples for each variant, state, and pattern.',
    path: '/components',
  }),
  // `default` is bare; the root layout's template adds the "· Astryx" suffix to
  // it (for the /components index). `template` re-applies the same suffix to the
  // child /components/[name] pages, which would otherwise lose it.
  title: {
    default: 'Components',
    template: `%s · ${SITE_NAME}`,
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
