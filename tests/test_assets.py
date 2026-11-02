"""Regression checks for the public cinematic site.
No browser or camera needed; CI validates the source package and licensing.
"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class CinematicAssetTests(unittest.TestCase):
    def test_bundled_approved_image(self):
        image = ROOT / "docs" / "assets" / "restaurant-reference.webp"
        data = image.read_bytes()
        self.assertGreater(len(data), 30_000)
        self.assertEqual(data[:4], b"RIFF")
        self.assertEqual(data[8:12], b"WEBP")

    def test_cinematic_default_has_no_missing_image_prompt(self):
        js = (ROOT / "docs" / "cinematic-floor.js").read_text(encoding="utf-8")
        html = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")
        self.assertIn('./assets/restaurant-reference.webp', js)
        self.assertIn("cinematic-floor.js", html)
        self.assertNotIn("Original artwork not yet", js)
        self.assertNotIn('file.type.startsWith("image/")', js)
        self.assertNotIn('digital-twin.js"></script>', html)

    def test_copyright_license(self):
        license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
        self.assertIn("Md Najmul Hossain", license_text)
        self.assertIn("All rights reserved", license_text)
if __name__ == "__main__":
    unittest.main()
