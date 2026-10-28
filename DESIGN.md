# CampusConnect: design note

**Layout.** One phone-width column (max 448px), centred on larger screens. Every screen has a sticky top bar with a labelled "Back" button (except the four tab roots). Content scrolls; the main action sits near the bottom where a thumb reaches it.

**Navigation.** Bottom tab bar: Home, Find, Groups, Quests, Me. Each tab has an icon and a text label. With `GAME_LAYER = false` the Quests tab is removed. Bell and History live on Home and Me. Every screen opened from another screen can go back; there are no dead ends.

**Colour.** Warm cream page (`#FFF6EA`) with a soft peach-to-lavender wash. Pastel surfaces: peach, mint, lavender, sky, butter, rose. Text is deep plum (`#2E2540`), secondary text `#5B4F6E`. Primary buttons are grape (`#6B4FA0`) with white text (contrast about 6:1). Colour is never the only signal: statuses and selections always carry an icon and a word.

**Typography.** Rounded system font stack (`ui-rounded`, Nunito, system-ui). Body 16px, titles 22–28px bold, short plain sentences. No jargon.

**Components.** Large rounded cards (24px radius) with a 2px soft border. Chips for choices (selected chip shows a check). Buttons are at least 48px tall. Confirmations and destructive actions use a bottom sheet. Status tags: Unconfirmed (clock, butter), Confirmed (check, mint), Done (flag, sky), Cancelled (cross, rose).

**Game layer.** Character avatars drawn as SVG (skin, hair style incl. scarf, hair colour, outfit, accessory, expression, background). Twists, quests, points and the private "play again?" step are all optional and skippable. With `GAME_LAYER = false` people show as a coloured initial and the after-game screen shows plain "Follow" and "Message" buttons.

**Places.** The app never says whether a place is free or busy. The only statement is: "Places aren't booked through CampusConnect."
