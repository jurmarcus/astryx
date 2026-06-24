// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Send, Check} from 'lucide-react';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Text} from '@astryxdesign/core/Text';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
} from '@astryxdesign/core/theme/tokens.stylex';

// Live "chat composer" composition for the home page's CLI feature
// card ("A design system that your agent can use"). This replaces the
// former baked PNG (/feature-cli.png) which could not adapt to dark
// mode — it stayed light on the dark surface. Rendering real, theme-
// aware markup instead means the preview re-themes automatically via
// the same light-dark() tokens every other component uses, so it
// reads correctly in both light and dark.
//
// The composition mirrors the reference screenshot, top to bottom:
//   1. muted helper text ("How can i help you today?")
//   2. a single chat-input "pill": a rounded surface bar holding the
//      message text + a circular send button (paper-plane icon)
//
// Why a hand-composed pill instead of <ChatComposer>: the reference is
// a single-line input bar (text left, circular send button right).
// ChatComposer is a multi-row layout shell — it renders the input and
// the send button on separate rows and carries its own popover
// surface + hover/focus shadows — so it neither matches the one-line
// pill shape nor stays lightweight for a decorative preview. TextInput
// can't hold a trailing button (it only exposes startIcon), so the
// cleanest theme-aware match is a surface-token pill + the real
// IconButton for the circular send affordance.
//
// The send button is decorative but kept as a genuine, interactive
// IconButton (with minimal local "sent" state) rather than static
// markup, mirroring ComponentsPreview — the preview still behaves like
// a real component if poked.

const styles = stylex.create({
  // Outer frame. The card supplies the 40px inset padding around the
  // preview (innerPaddingImageInset via the previewWrap), so this just
  // stacks the helper text above the pill. maxWidth keeps the composer
  // from stretching uncomfortably wide on the desktop bento card while
  // staying fluid on narrow screens.
  root: {
    width: '100%',
    maxWidth: 360,
    marginInline: 'auto',
  },
  // Nudge the helper text in so it aligns with the pill's text rather
  // than sitting flush against the pill's rounded left edge — matches
  // the reference where the helper text is slightly inset.
  helper: {
    paddingInlineStart: spacingVars['--spacing-3'],
  },
  // The chat-input pill. Uses a surface token for the background so it
  // inverts in dark mode (white in light, dark surface in dark), a
  // full radius for the pill shape, and a soft shadow so it lifts off
  // the card's pastel backdrop like the reference. Generous inline
  // padding on the start (text) side; tighter on the end so the round
  // send button sits in a balanced inset.
  pill: {
    width: '100%',
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-full'],
    boxShadow: shadowVars['--shadow-low'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInlineStart: spacingVars['--spacing-5'],
    paddingInlineEnd: spacingVars['--spacing-2'],
  },
  // Message text fills the row and truncates rather than wrapping so
  // the pill keeps its single-line height on narrow cards.
  message: {
    minWidth: 0,
    flex: 1,
  },
  // Circular send button — overrides IconButton's variant surface with
  // the inverted token so it reads as the near-black filled circle in
  // the reference (and flips to a light circle in dark mode, proving
  // the whole preview is theme-aware). xstyle is applied last by
  // Button, so these win over the variant's own colors.
  sendButton: {
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
    backgroundColor: colorVars['--color-background-inverted'],
    color: colorVars['--color-background-surface'],
  },
});

export function CliPreview() {
  // Decorative state — the send button toggles a transient "sent" look
  // so the preview is a real, pokeable component rather than static
  // markup. It resets on its own so the reference composition is what
  // the page shows at rest.
  const [sent, setSent] = useState(false);

  return (
    <VStack gap={3} align="stretch" xstyle={styles.root}>
      <Text type="supporting" color="secondary" xstyle={styles.helper}>
        How can i help you today?
      </Text>

      <HStack gap={2} vAlign="center" hAlign="between" xstyle={styles.pill}>
        <Text type="body" color="primary" maxLines={1} xstyle={styles.message}>
          Can you create me a table page
        </Text>
        <IconButton
          label={sent ? 'Message sent' : 'Send message'}
          icon={sent ? <Check size={16} /> : <Send size={16} />}
          size="md"
          onClick={() => {
            setSent(true);
            window.setTimeout(() => setSent(false), 600);
          }}
          xstyle={styles.sendButton}
        />
      </HStack>
    </VStack>
  );
}
