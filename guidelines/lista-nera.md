# Lista nera

Ogni voce: il sintomo, perché no, cosa fare. Gli esempi sono pagine vere da non imitare. Le voci segnate ⚙ le cerca anche `controlla.sh`.

## Testi

### Il paragrafo che spiega la funzione

Esempio: impostazioni dello studio, «Posta»: «Le comunicazioni partono dalla tua casella, con la tua firma, e in Comunicazioni trovi la tua posta, ricevuta e inviata, divisa per cliente.» (`studio/impostazioni/components/mailbox-section.tsx`).
Perché no: chi apre la pagina sa già perché è lì. Il paragrafo è scritto per convincere chi l'ha costruita che è chiaro.
Invece: niente. Se manca un'informazione per agire, una frase sola, sotto i 90 caratteri.

### L'elenco di tutto quello che fa

Esempio: «Funzioni AI»: «lo studio si fa proporre il testo delle mail, smista la posta dei clienti sulle pratiche, controlla i documenti…» (`studio/impostazioni/components/ai-section.tsx`).
Invece: etichetta e stato. Il dettaglio sta nell'aiuto, raggiungibile con un link.

### La giustificazione legale o tecnica

Esempi: OpenAI «sub-responsabile del trattamento» nelle impostazioni; la nota CNDCEC in fondo ad Antiriciclaggio (`studio/antiriciclaggio/page.tsx`).
Perché no: è vero e importante, ma non è lì che si legge. Sporca ogni visita per servire una sola lettura.
Invece: dove l'utente acconsente (il dialog che accende la funzione) o in una pagina di aiuto. Se proprio deve stare sulla pagina, un link di una riga.

### La didascalia sotto il numero o il titolo

Esempio: «Pratiche con documenti ricevuti o da riguardare» sotto «Documenti da verificare» (`studio/components/studio-home.tsx`).
Invece: un'etichetta che basta da sola.

### Il sottotitolo che ripete il titolo

`DialogDescription`, `CardDescription` o un `<p>` sotto un `h1`/`h2` che dicono la stessa cosa con più parole.
Invece: toglierlo.

### Tono

- ⚙ Trattini lunghi (`—`, `–`): mai (`CLAUDE.md`).
- Niente «Qui puoi…», «Questa sezione ti permette di…», «Scopri…», punti esclamativi, maiuscole enfatiche.
- Bottoni con il verbo dell'azione («Salva», «Invia richiesta»), non «Procedi», «Conferma» generici.
- Errori: cosa è successo e cosa fare, una frase. Niente «Ops».
- ⚙ Testo visibile lungo: due o più righe di prosa di seguito nel JSX (un paragrafo), o una stringa oltre 80 caratteri, vanno giustificate.

## Contenitori

### Il riquadro grigio ⚙

`bg-muted`, `bg-muted/40`, `bg-muted/50`… con `rounded-*` e `p-*` attorno a un gruppo di contenuti.
Esempi: logo in `logo-section.tsx:91`, «Questa settimana» in `studio-home.tsx:243`, tile di Antiriciclaggio `antiriciclaggio/page.tsx:67`, «Il cliente in breve» `client-overview.tsx:156`.
Perché no: è il modo di un modello di dire «questo è un gruppo» senza decidere la gerarchia. Su una pagina con tre box grigi nessuno è più importante.
Invece: spazio bianco e un titolo `text-sm font-semibold`. Il logo sta da solo, alla sua dimensione.
Ammesso: stati interattivi (`hover:`, `data-[state=…]:`, selezionato), `Skeleton`, la barra di azioni su una selezione multipla, il chip del conteggio in una tab.

### La card per sezione ⚙

`Card` o `border rounded-lg p-*` per inquadrare una sezione della pagina, e peggio card dentro card.
Esempio: la griglia «Top 5 / Flop 5» di Controllo di gestione (`studio/onorari/components/management-summary.tsx`).
Invece: sezioni con titolo e spazio. La `Card` va bene per un oggetto che si sposta o si seleziona come unità (un elemento di una griglia di scelta), non per impaginare.

### La griglia di tile tutte uguali

Quattro box della stessa misura, ognuno con titolo, numero, didascalia e icona freccia (Le mie attività).
Invece: la riga di numeri senza sfondo di `ricette.md`.

### Lo sfondo colorato per lo stato ⚙

`bg-destructive/10` o `bg-primary/5` su un intero riquadro per dire «attenzione».
Invece: il colore va sul numero o su `Status`, mai sulla superficie.

## Decorazione

- Icone nei titoli di sezione e davanti a ogni voce di un elenco. Le icone stanno nei bottoni e nei controlli, dove riconoscerle fa risparmiare tempo.
- Badge decorativi («Nuovo», «Beta», «AI») non chiesti.
- ⚙ Gradienti (`bg-gradient-*`, `bg-linear-*`), ⚙ ombre forti (`shadow-md` e oltre), animazioni di ingresso.
- Separatori (`Separator`, `border-t` fra sezioni) quando c'è già lo spazio.
- Avatar, illustrazioni o icone grandi negli empty state (`CLAUDE.md`).
- Emoji.

## Colori e stile ⚙

- Scale Tailwind (`bg-blue-500`, `text-gray-600`), hex, `rgb()`: solo token (`CLAUDE.md`).
- `style={{…}}`: mai.
- Raggi diversi dal default di shadcn (`rounded-2xl`, `rounded-3xl`).

## Composizione

- Tutto centrato: le pagine dell'app sono allineate a sinistra, il centro è per gli empty state.
- La colonna stretta con mezza pagina vuota a destra. Bocciata dall'utente sulle impostazioni (2026-10-29: «perché vedo tutto quello spazio bianco a destra?»). Le pagine dell'app usano tutta la larghezza, come Clienti; `max-w-*` solo su un singolo blocco di testo o un campo, mai sul contenitore della pagina.

### Tutto nero e grigio

Bocciato dall'utente sulle impostazioni (2026-10-29: «non mi piace tutto questo nero e grigio»): etichette grigie, valori neri, azioni `ghost` nere. Togliere i riquadri non vuol dire togliere il colore.
Invece: le azioni testuali sono link nel colore primario (`Button variant="link"`, come «Tutte le pratiche» in `client-overview.tsx`), gli stati sono `Status` con il loro colore, l'unico bottone pieno è l'azione principale. Il colore segna ciò che si può fare o ciò che chiede attenzione, non decora.

- Più di un bottone `default` nella stessa area.
- Gli stessi dati mostrati due volte (numero in alto e di nuovo nella tabella sotto).
