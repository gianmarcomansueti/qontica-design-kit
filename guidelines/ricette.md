# Ricette

Ogni ricetta punta a una pagina che l'utente ha approvato (2026-10-29). Apri i file prima di scrivere. Percorsi relativi a `app/(logged-in)/org/[slug]/`.

I riferimenti hanno ancora dei riquadri grigi (indicati sotto): prendine la struttura, non i box.

## Scheletro di ogni pagina

- `PageTitle` (`studio/components/ui.tsx`): `h1` `text-2xl font-semibold tracking-tight`, azioni a destra, `mb-8`. Una sola azione `default` (la principale, a destra), le altre `outline`.
- Sotto il titolo, al massimo una riga di metadati in `text-muted-foreground text-sm`, separati da spazio (`gap-4`), non da box.
- Sezioni: `h2` `text-base font-semibold`; nei laterali `text-sm font-semibold`. Spazio fra sezioni `space-y-10`/`gap-12`, dentro una sezione `space-y-3`/`space-y-4`.
- Niente `Card` per inquadrare una sezione della pagina. La pagina è già il contenitore.

## Lista con tabella

Riferimento: **Clienti** (`studio/clienti/page.tsx`, `components/clients-columns.tsx`, `clients-filters.tsx`, `clients-data-table.tsx`), **Pratiche** (`studio/pratiche/page.tsx`, `practices-*.tsx`).

- Titolo con il totale accanto in `text-muted-foreground` (vedi Clienti).
- Una riga: `SearchField` a sinistra, filtri `Pick` a destra. Se gli stati sono pochi e sono il modo principale di navigare, tab sopra la riga (Pratiche).
- `StudioTable`: righe `h-12`, prima colonna con nome in `font-medium` e dettaglio in `text-xs text-muted-foreground` (`AvatarName`), azione di riga come link testuale a destra («Apri scheda») più menu `…`.
- `Status` è l'unico colore nella tabella, e solo per gli stati che chiedono attenzione.
- Empty: `Empty` («Nessun risultato con questi filtri.»), solo testo.
- Da non copiare: l'intestazione grigia di `StudioTable` (`bg-muted/50` sul `TableRow` dell'header).

## Dettaglio

Riferimento: **Pratica** (`studio/pratiche/components/practice-detail.tsx`), **Scheda cliente** (`studio/clienti/components/client-detail.tsx`, `client-overview.tsx`).

- Breadcrumb di contesto piccolo sopra il titolo (pratica: «cliente / periodo»), poi `PageTitle` con le azioni in fila.
- Metadati in linea sotto il titolo: stato (`Status`), date, responsabile.
- `SectionTabs` se ci sono più viste.
- Corpo a due colonne: `grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]` (pratica) o `lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]` (cliente). A sinistra il lavoro (elenco con `divide-y`, righe `py-4`), a destra un `aside` stretto con `space-y-8`.
- Nell'`aside`, coppie etichetta-valore con `dl`: `dt` `text-muted-foreground`, `dd` a destra `tabular-nums`. Senza sfondo.
- Da non copiare: `bg-muted/40 rounded-lg p-5` su «Il cliente in breve» (`client-overview.tsx:156`) e sul riquadro del cliente (`practice-detail.tsx:464`, `:527`), i banner `bg-muted` (`practice-detail.tsx:638`, `:650`).

## Impostazioni

Riferimento: `app/(logged-in)/settings/` dal 2026-10-31, disegnata dall'utente in Claude Design (`layout.tsx`, `components/settings-ui.tsx`, `page.tsx`, `members/`, `studio/`).

- Colonna sinistra: «Impostazioni», poi due gruppi (Account con la mail, l'organizzazione con il ruolo) e le voci, solo il titolo. La voce attiva ha `bg-muted`.
- A destra: etichetta del gruppo in `text-xs`, `h1` della sezione, stato del salvataggio («Tutto salvato») e l'unica azione primaria; sotto, blocchi bordati (`SettingsBlock`) con righe `SettingsRow`: etichetta a sinistra, controllo a destra. Nessun sottotitolo, da nessuna parte (richiesta dell'utente 2026-10-31).
- Si salva da soli (`useAutosave`, `useDraft`): niente bottone Salva, tranne nei dialog.
- Qui il bordo attorno al blocco è voluto: è l'eccezione alla regola delle card, decisa dall'utente.

## Numeri di sintesi

Le righe di numeri in cima a una pagina (Le mie attività, Antiriciclaggio) si tengono, **senza sfondo**:

```tsx
<dl className="flex flex-wrap gap-x-16 gap-y-6">
  <div>
    <dt className="text-muted-foreground text-sm">Pratiche aperte</dt>
    <dd className="mt-1 text-3xl font-semibold tabular-nums">2</dd>
  </div>
</dl>
```

- Etichetta che basta da sola, nessuna didascalia sotto il numero.
- Colore solo sul numero che chiede attenzione (`text-destructive`), mai sullo sfondo.
- Se il numero porta a una lista, tutto il blocco è un `Link`.
- Se tutti i valori sono 0, la riga non si mostra: al suo posto la frase vuota della lista sotto.

## Numeri contabili

- Cifre sempre `tabular-nums`, allineate a destra, formato italiano (`studioMoney`, `lib/studio/labels.ts`, o il formatter dell'area).
- Il negativo con il segno meno, non in rosso, salvo che il rosso sia il significato (scostamento, ritardo).
- Unità nell'intestazione della colonna, non ripetuta in ogni cella quando è la stessa.

## Dialog con form

Riferimento: `studio/clienti/components/client-form-dialog.tsx`.

- `Controller` + `Field`/`FieldLabel`/`FieldError` (`CLAUDE.md`, Forms). `FieldDescription` solo se il campo è ambiguo, una frase.
- Titolo del dialog = l'azione («Nuovo cliente»), niente `DialogDescription` che ripete il titolo.
- Bottoni: annulla `outline` a sinistra, conferma `default` a destra, con `Loader2` durante il salvataggio.

## Area Advisory

Da completare: dashboard, bilanci, planning e archivio non sono stati guardati (2026-10-29: la sessione su staging non aveva il modulo). Quando l'utente indica una pagina Advisory buona, la ricetta va qui.
