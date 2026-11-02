"""Local-only RTSP/USB camera bridge + TableSight preview server.

Camera frames are streamed in memory; no video or JPEG files are written.
Copyright (c) 2026 Md Najmul Hossain. All rights reserved.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Generator

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

APP_ROOT = Path(__file__).resolve().parents[1]
DOCS = APP_ROOT / "docs"
app = FastAPI(
    title="TableSight Local IP Camera Bridge",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)
app.mount("/static", StaticFiles(directory=DOCS), name="static")


@app.get("/")
def dashboard() -> FileResponse:
    return FileResponse(DOCS / "index.html", headers={"Cache-Control": "no-store"})


@app.get("/styles.css")
def css() -> FileResponse:
    return FileResponse(DOCS / "styles.css", media_type="text/css")


@app.get("/app.js")
def js() -> FileResponse:
    return FileResponse(
        DOCS / "app.js",
        media_type="application/javascript",
        headers={"Cache-Control": "no-store"},
    )


@app.get("/health")
def health() -> JSONResponse:
    """Do not leak IP addresses, URLs or camera credentials in metadata."""
    return JSONResponse({
        "ok": True,
        "camera_configured": bool(os.environ.get("CAMERA_SOURCE")),
        "video_recording": False,
        "inference_location": "browser",
        "security": "bind to loopback by default",
    })


def camera_id(source: str) -> str | int:
    """Accept a numeric OpenCV index or an RTSP/HTTP camera URI."""
    if source.isdecimal():
        return int(source)
    if source.startswith(("rtsp://", "rtsps://", "http://", "https://")):
        return source
    raise ValueError("CAMERA_SOURCE must be a nonnegative device index or RTSP/HTTP(S) URL")


def frames(cap, cv2) -> Generator[bytes, None, None]:
    """Render low-resolution MJPEG in memory. Release source on disconnect."""
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            h, w = frame.shape[:2]
            if w > 960:
                frame = cv2.resize(frame, (960, round(h * 960 / w)))
            ok, data = cv2.imencode(
                ".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 65]
            )
            if not ok:
                continue
            yield (
                b"--frame\r\nContent-Type: image/jpeg\r\n"
                b"Cache-Control: no-store\r\n\r\n" + data.tobytes() + b"\r\n"
            )
    finally:
        cap.release()


@app.get("/stream.mjpg")
def stream():
    """Only local/trusted users should reach this endpoint.

    Cross-origin requests are not enabled: serve the page and bridge on the
    same loopback origin. Never put this service directly on the public internet.
    """
    source = os.environ.get("CAMERA_SOURCE", "").strip()
    if not source:
        raise HTTPException(status_code=503, detail="CAMERA_SOURCE is not configured")
    try:
        src = camera_id(source)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid CAMERA_SOURCE type")
    try:
        import cv2  # Optional; only needed for camera streaming.
    except ImportError:
        raise HTTPException(status_code=503, detail="Install bridge/requirements-camera.txt")
    # Only allow 1 stream unless the camera/NVR is known to support more.
    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        cap.release()
        raise HTTPException(status_code=503, detail="Camera currently unavailable")
    return StreamingResponse(
        frames(cap, cv2),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer",
        },
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="TableSight local camera bridge")
    parser.add_argument("--host", default="127.0.0.1",
                        help="Loopback default. Do not expose this service to the Internet.")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    import uvicorn
    uvicorn.run(app, host=args.host, port=args.port, access_log=False)


if __name__ == "__main__":
    main()
