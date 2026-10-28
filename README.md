# CampusConnect (front-end MVP)

Mobile-first web app for IBA Karachi students to find or create small activities (badminton, table tennis, book chats) and meet on campus. Built for an HCI course project. **No backend**: everything is dummy data kept in the browser (`localStorage`).

## Run

```bash
npm install
npm run dev      # open the printed URL, ideally at phone width
npm test         # Vitest tests for the rules in src/logic
npm run build    # typecheck + production build
```

Stack: React + TypeScript + Vite + Tailwind, Zustand store persisted to `localStorage`. Design decisions are in [DESIGN.md](DESIGN.md).

## Baseline switch for the study

`src/config.ts` has `GAME_LAYER` (true/false). When `false`: people show as a coloured initial (no avatars), and twists, quests, points and the private "play again?" step are removed; the after-game screen instead shows plain **Follow** and **Message** buttons. Everything else is identical. Restart the dev server after changing it and use **Me → Demo tools → Reset data** (or clear site data) between runs.

## Where things are

- `src/seed.ts` — all dummy data (students, places, types, activities, communities, threads, quests, canned chat text).
- `src/logic/` — pure rules + tests: states, joining checks, deadline cancel, create validation, filters, play-again privacy, points, email/nickname validation.
- `src/store.ts` — single Zustand store, simulated students (timers, `SIM_DELAY_MS` = 4 s in `config.ts`).
- `src/screens/`, `src/components/`, `src/avatar/` — UI and the SVG avatar system.

## Dummy data

- **Students:** Mango (Intermediate), Moonbeam (Beginner), Pixel (Advanced), Rally (Advanced), Inkwell (Beginner), Comet (Intermediate), each with a distinct avatar.
- **Places:** Library, Tennis Court, Badminton Court, OBS Courtyard, Girls Common Room, Student Centre (plus any typed place).
- **Activity types:** Badminton, Table tennis, Reading (plus any you add).
- **Open activities:** Fast rallies (Badminton, Advanced), Easy table tennis, Short story swap (group, 2 of 4 RSVPs, waiting), Beginner doubles warm-up (confirmed and full), Quiet reading hour, Doubles fun (group), Poetry open mic (community only). Two finished activities appear in History (with Pixel and Inkwell as mutual preferred partners; Comet did not match).
- **Communities:** Book Lovers (literature), Racquet Friends, Campus Explorers, each with sample discussions and replies.
- **Quests:** Find a quiet reading spot, Spot a butterfly together, Learn one new word, Share a book or topic, Try something new.

## Running the two scenarios

1. **Badminton partner:** Find → Badminton, Tomorrow, around 3:00 PM → "Nothing matches" → *Create this activity* (filters prefilled) → publish. A simulated student joins after about 4 s and the plan is confirmed; open the chat, then *We're done* → play again.
2. **Book Baithak:** Groups → join Book Lovers → Events → Create an event (group, limit 8, minimum 4, deadline, "Community and general list"). Simulated students RSVP one at a time until it is confirmed.

Alternative outcomes: **Me → Demo tools** can turn off simulated joining, make someone withdraw (or the host cancel), make the RSVP deadline pass, or make the planned time pass. A cancelled plan offers "Propose a different time".

## Notes

- Sign-up checks that the email ends with `@khi.iba.edu.pk` and then discards it; only the nickname is stored or shown.
- The app never says whether a place is free or busy. It shows only: "Places aren't booked through CampusConnect."
- Simulated students use timers, so closing the page mid-simulation pauses them; they resume on reload.
