"""Regenerates assets/img/cloud-*.webp: fractal value noise shaped by an elliptical falloff.

Usage: python3 src/clouds.py assets/img   (needs numpy and Pillow)
"""
import sys
import numpy as np
from PIL import Image

W, H = 1400, 800

def fbm(seed, base=4, octaves=7):
    rng = np.random.default_rng(seed)
    out = np.zeros((H, W), dtype=np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = base * 2 ** o
        grid = (rng.random((max(2, n * H // W + 1), n + 1)) * 255).astype(np.uint8)
        layer = np.asarray(Image.fromarray(grid).resize((W, H), Image.BICUBIC), dtype=np.float32) / 255
        out += layer * amp
        total += amp
        amp *= 0.55
    return out / total

def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def cloud(seed, blobs, name):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    shape = np.zeros((H, W), dtype=np.float32)
    for cx, cy, rx, ry in blobs:
        d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
        shape = np.maximum(shape, 1 - smooth(d, 0.15, 1.0))
    n = fbm(seed)
    detail = fbm(seed + 7, base=10, octaves=6)
    density = shape * 0.95 + (n - 0.5) * 1.05 + (detail - 0.5) * 0.45
    alpha = smooth(density, 0.38, 0.78) * smooth(shape, 0.0, 0.15)  # no stray wisps outside the shape
    # soft lighting: thicker parts are whiter, thin and lower parts pick up sky blue
    light = np.clip(smooth(density, 0.45, 1.0) * 0.75 + (1 - y / H) * 0.35 + (detail - 0.5) * 0.3, 0, 1)
    lo, hi = np.array([168, 208, 250], np.float32), np.array([255, 255, 255], np.float32)
    rgb = lo + (hi - lo) * light[..., None]
    img = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(name + '.webp', quality=78, method=6)

out = sys.argv[1] if len(sys.argv) > 1 else '.'
cloud(11, [(700, 430, 520, 170), (520, 360, 260, 190), (860, 340, 300, 210), (1050, 430, 230, 130)], out + '/cloud-1')
cloud(42, [(700, 420, 480, 130), (600, 380, 260, 150), (900, 400, 220, 140)], out + '/cloud-2')
