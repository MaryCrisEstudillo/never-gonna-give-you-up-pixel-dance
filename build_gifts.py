#!/usr/bin/env python3
"""
Generate a personalized rickroll QR code for each person.

Each line of people.csv is:   photo_filename, Display Name
  e.g.   alex.jpg, Alex Cruz

For every person this builds the live URL (their face on the dancing
figure, Rick's pompadour on top, name caption) and writes a QR PNG to qr/.
The QR encodes the URL directly, so scanning it just opens their page —
no redirect server needed.

Run:  python3 build_gifts.py
"""

import csv
import os
import re
from urllib.parse import quote

import segno

# The deployed GitHub Pages base URL for this project.
BASE = "https://marycrisestudillo.github.io/never-gonna-give-you-up-pixel-dance/"

HERE = os.path.dirname(os.path.abspath(__file__))
PEOPLE = os.path.join(HERE, "people.csv")
FACES = os.path.join(HERE, "faces")
QRDIR = os.path.join(HERE, "qr")


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or "friend"


def build_url(photo, name):
    q = f"?face=faces/{quote(photo)}&hair=1&name={quote(name)}"
    return BASE + q


def main():
    if not os.path.exists(PEOPLE):
        print("No people.csv found. Create one with lines like:")
        print("    alex.jpg, Alex Cruz")
        return

    os.makedirs(QRDIR, exist_ok=True)
    rows = []
    with open(PEOPLE, newline="") as f:
        for raw in csv.reader(f):
            if not raw or raw[0].strip().startswith("#"):
                continue
            if len(raw) < 2:
                print(f"! skipping malformed line: {raw}")
                continue
            photo, name = raw[0].strip(), raw[1].strip()
            rows.append((photo, name))

    if not rows:
        print("people.csv has no entries yet.")
        return

    print(f"Building {len(rows)} personalized rickroll(s):\n")
    for photo, name in rows:
        if not os.path.exists(os.path.join(FACES, photo)):
            print(f"! WARNING: faces/{photo} not found (add the photo)")
        url = build_url(photo, name)
        slug = slugify(name)
        out = os.path.join(QRDIR, f"{slug}.png")
        segno.make(url, error="m").save(out, scale=10, border=4, dark="#1a1526")
        print(f"  {name}")
        print(f"    url: {url}")
        print(f"    qr : qr/{slug}.png\n")

    print("Done. Send each person their qr/<name>.png (print it or drop it in a card).")


if __name__ == "__main__":
    main()
