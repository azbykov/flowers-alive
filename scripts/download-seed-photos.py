#!/usr/bin/env python3
"""Download seed flower photos from Wikimedia Commons into supabase/seed-photos/.

Run from repo root:  python3 scripts/download-seed-photos.py
Then upload to Storage:  npm run seed:storage
"""

from __future__ import annotations

import os
import time
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..", "supabase", "seed-photos")
UA = "SecondLifeFlowersSeed/1.0 (local demo; flowers-alive)"

# Stable Wikimedia Commons thumbs (~960px). Sources credited in CREDITS.txt.
DOWNLOADS = {
    "roses.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/"
        "Bouquet_de_roses_roses.jpg/960px-Bouquet_de_roses_roses.jpg"
    ),
    "tulips.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/"
        "Yellow-tulip-bouquet-stems_%28Unsplash%29.jpg/"
        "960px-Yellow-tulip-bouquet-stems_%28Unsplash%29.jpg"
    ),
    "peonies.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/"
        "Pink_Peony_Flower.jpg/960px-Pink_Peony_Flower.jpg"
    ),
    "mixed.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/"
        "Mixed_Flower_Power.jpg/960px-Mixed_Flower_Power.jpg"
    ),
    "hydrangeas.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/"
        "Blue_Hydrangea_%28common_names_hydrangea_or_hortensia%29.jpg/"
        "960px-Blue_Hydrangea_%28common_names_hydrangea_or_hortensia%29.jpg"
    ),
    "sunflowers.jpg": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/"
        "Sunflower_sky_backdrop.jpg/960px-Sunflower_sky_backdrop.jpg"
    ),
}


def main() -> None:
    os.makedirs(ROOT, exist_ok=True)
    opener = urllib.request.build_opener()
    opener.addheaders = [("User-Agent", UA)]
    urllib.request.install_opener(opener)

    for name, url in DOWNLOADS.items():
        path = os.path.join(ROOT, name)
        print(f"Downloading {name}…")
        urllib.request.urlretrieve(url, path)
        print(f"  {os.path.getsize(path)} bytes")
        time.sleep(1.5)

    print("Done →", os.path.abspath(ROOT))
    print("Next: npm run seed:storage")


if __name__ == "__main__":
    main()
