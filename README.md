# Qontica design kit

Source material for building the Qontica design system. Everything here is copied from the app (branch `development`, 2026-11-10): the real tokens, the real components, the pages the team approved as references.

## Where to look

| Folder | What it holds |
| --- | --- |
| `tokens/globals.css` | Tailwind v4 theme: colour tokens for light and dark (`:root`, `.dark`), radius, custom utilities. Source of truth for colours. |
| `tokens/layout.tsx` | Fonts: Geist (sans) and Geist Mono, from `next/font/google`. |
| `components/ui/` | shadcn/ui components as used in the app, plus Qontica ones (`account-amount`, `italian-amount-input`, `number-input`, `segmented-toggle`). |
| `patterns/studio/` | Approved reference pages: client list with table, client detail, practice detail, form dialog. `studio-ui.tsx` holds the shared page pieces: `PageTitle`, `SectionTabs`, `StudioTable`, `Status`, `Empty`, `Pick`, `SearchField`, `AvatarName`. |
| `patterns/settings/` | Settings hub: left navigation, `SettingsBlock` / `SettingsRow`, autosave. |
| `guidelines/ricette.md` | Page recipes (list, detail, settings, summary numbers, accounting numbers, form dialog), in Italian. |
| `guidelines/lista-nera.md` | What must never appear, with the alternative, in Italian. |
| `brand/` | Logos and pictogram, black and white versions. |

## Principles

Calm, editorial, low density. Title, one line of context, content. Whitespace and headings do the grouping.

1. Clear visual hierarchy: one primary element per screen, then secondary, then tertiary.
2. Generous whitespace on a consistent scale. Between sections `space-y-10` / `gap-12`, inside a section `space-y-3` / `space-y-4`.
3. No over-nesting, no unnecessary borders. No card used as page layout: the page is already the container. The only bordered blocks are the settings blocks.
4. No grey boxes (`bg-muted`, `bg-card` + border) to group content. Group with space, headings and `divide-y`.
5. Copy that does not explain itself. A page says what is there and what you can do, not how it works. At most one sentence of context.
6. Asymmetry and alignment over uniform grids. Detail pages: wide left column for the work, narrow right `aside` (about 300px) with label/value pairs.

## Hard rules

- Colours only from tokens (`bg-background`, `text-muted-foreground`, `text-destructive`, `border-input`, ...). Never hex, rgb or Tailwind scales like `bg-blue-500`. Light and dark must both work.
- Default shadcn radius, no overrides. No decorative separators or icons.
- Icons: Lucide only. Dialog icons `h-5 w-5`.
- Empty states: text only, never icons.
- No em dash (`—`) or en dash (`–`) in any visible text. Use a colon, a comma or two sentences.
- Navigation is a link, an action is a button.
- Create and edit happen in a dialog; viewing happens on a detail page. No back buttons.
- Loading: skeletons matching the real layout. "Saving..." text only on buttons, with a spinner.
- Forms: label above field, error under it, optional description only when the field is ambiguous. Dialog title is the action ("Nuovo cliente"); cancel `outline` on the left, confirm `default` on the right.
- Accounting numbers: `tabular-nums`, right-aligned, Italian format, minus sign rather than red unless red is the meaning. Unit in the column header.
- Page title: `h1` `text-2xl font-semibold tracking-tight`, actions on the right, one `default` button at most, the others `outline`.
- Accessibility WCAG 2.1 AA, mobile first, touch targets of adequate size.

UI copy is in Italian.
