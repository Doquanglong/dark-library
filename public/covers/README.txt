Book covers go here.

Save the image as <slug>.jpg matching the book's markdown filename, then point
the `cover:` field at it:

    cover: /covers/horus-rising.jpg

Save the file rather than linking straight to Amazon — their image URLs rotate
and they serve differently depending on who is asking, so hotlinked covers tend
to quietly break later on.

Keep them around 400px wide. Anything bigger just makes the page slower; the
cover is never displayed larger than about 190px.

If a cover is missing or the file fails to load, the site falls back to showing
the title on a plain panel. Nothing breaks.
