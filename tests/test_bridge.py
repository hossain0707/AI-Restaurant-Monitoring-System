"""TableSight bridge smoke tests. No physical camera required."""
import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from bridge.server import app, camera_id


class BridgeTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_dashboard_renders(self):
        r = self.client.get("/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("TableSight", r.text)
        self.assertIn("Camera laboratory", r.text)

    def test_javascript_served(self):
        r = self.client.get("/app.js")
        self.assertEqual(r.status_code, 200)
        self.assertIn("getUserMedia", r.text)

    def test_health_without_secrets(self):
        with patch.dict(os.environ, {"CAMERA_SOURCE": "rtsp://admin:secret@10.0.0.4/live"}):
            r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["camera_configured"])
        self.assertNotIn("secret", r.text)

    def test_no_camera_is_503(self):
        with patch.dict(os.environ, {}, clear=True):
            r = self.client.get("/stream.mjpg")
        self.assertEqual(r.status_code, 503)

    def test_invalid_camera_source(self):
        for source in ("../file.mp4", "file:///etc/shadow", "-1", "xyz"):
            with self.assertRaises(ValueError):
                camera_id(source)
        self.assertEqual(camera_id("0"), 0)
        self.assertEqual(camera_id("rtsp://camera.test/feed"), "rtsp://camera.test/feed")


if __name__ == "__main__":
    unittest.main()
