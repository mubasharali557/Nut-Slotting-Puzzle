import math
import os
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = "public/hardware"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. REALISTIC BRIGHT SILVER STAINLESS STEEL BOLT SHAFT
# ---------------------------------------------------------------------------
def generate_bolt_shaft(filename="bolt_shaft.png"):
    w = 240
    h = 720
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    cx = w // 2
    shaft_w = 88
    left_x = cx - shaft_w // 2
    right_x = cx + shaft_w // 2
    top_y = 52
    bottom_y = h - 30

    # 1. Base cylinder with bright stainless steel specular profile
    for x in range(left_x, right_x):
        t = (x - left_x) / shaft_w
        spec = math.exp(-((t - 0.32) ** 2) / 0.035) * 0.70
        diffuse = math.sin(t * math.pi) * 0.40
        rim = math.exp(-((t - 0.92) ** 2) / 0.015) * 0.20
        brightness = max(0.28, min(1.0, 0.48 + diffuse + spec + rim))

        # Silver stainless steel RGB tones
        r = int(185 * brightness + 70 * spec)
        g = int(195 * brightness + 60 * spec)
        b = int(210 * brightness + 45 * spec)
        draw.line([(x, top_y), (x, bottom_y)], fill=(min(255, r), min(255, g), min(255, b), 255))

    # 2. Rounded Top Dome Cap (Hemispherical machine screw top)
    draw.pieslice([cx - shaft_w//2, top_y - shaft_w//2, cx + shaft_w//2, top_y + shaft_w//2], 180, 360, fill=(235, 242, 250, 255))
    draw.ellipse([cx - 16, top_y - 28, cx + 8, top_y - 12], fill=(255, 255, 255, 220))

    # 3. Continuous Helical Spiral Threads
    pitch = 28
    slope = 10
    for y in range(top_y + 8, bottom_y - 10, pitch):
        # Subtle steel gray groove shadow (NOT pitch black!)
        draw.line([(left_x, y), (right_x, y + slope)], fill=(80, 95, 115, 200), width=3)
        # Bright gleaming stainless crest highlight
        draw.line([(left_x, y + 3), (right_x, y + slope + 3)], fill=(255, 255, 255, 240), width=3)

    # 4. Antialiased edges
    draw.line([(left_x, top_y), (left_x, bottom_y)], fill=(70, 85, 105, 210), width=2)
    draw.line([(right_x, top_y), (right_x, bottom_y)], fill=(70, 85, 105, 210), width=2)

    im_blurred = im.filter(ImageFilter.SMOOTH_MORE)
    im = Image.alpha_composite(im_blurred, im)

    path = os.path.join(OUTPUT_DIR, filename)
    im.save(path, "PNG")
    print(f"Saved {path} ({im.size})")

# ---------------------------------------------------------------------------
# 2. REALISTIC HEAVY-DUTY STAINLESS STEEL WASHER BASE
# ---------------------------------------------------------------------------
def generate_bolt_base(filename="bolt_base.png"):
    w = 320
    h = 140
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    cx = w / 2
    cy = h / 2 - 4

    # Contact drop shadow
    shadow_w = 145
    shadow_h = 44
    draw.ellipse([cx - shadow_w, cy + 12 - shadow_h/2, cx + shadow_w, cy + 12 + shadow_h/2], fill=(0, 0, 0, 80))

    # Outer washer thickness
    thick_w = 138
    thick_h = 46
    draw.ellipse([cx - thick_w, cy + 6 - thick_h/2, cx + thick_w, cy + 6 + thick_h/2], fill=(71, 85, 105, 255))

    # Top face of washer
    top_w = 134
    top_h = 44
    for rad_y in range(int(top_h), 0, -2):
        frac = rad_y / top_h
        rw = top_w * frac
        rh = top_h * frac
        b = int(140 + 115 * math.sin(frac * math.pi * 0.95))
        draw.ellipse([cx - rw, cy - rh/2, cx + rw, cy + rh/2], fill=(b, b, min(255, b + 10), 255))

    # Beveled rim highlights
    draw.arc([cx - top_w, cy - top_h/2, cx + top_w, cy + top_h/2], 180, 360, fill=(255, 255, 255, 230), width=2)
    draw.arc([cx - top_w, cy - top_h/2 + 5, cx + top_w, cy + top_h/2 + 5], 0, 180, fill=(51, 65, 85, 220), width=2)

    # Counterbore groove
    inner_w = 76
    inner_h = 24
    draw.ellipse([cx - inner_w, cy - inner_h/2, cx + inner_w, cy + inner_h/2], fill=(51, 65, 85, 255))
    draw.ellipse([cx - inner_w + 3, cy - inner_h/2 + 1, cx + inner_w - 3, cy + inner_h/2 - 1], fill=(148, 163, 184, 255))

    # Center hole transition
    hub_w = 48
    hub_h = 16
    draw.ellipse([cx - hub_w, cy - hub_h/2, cx + hub_w, cy + hub_h/2], fill=(30, 41, 59, 255))

    # Specular gleam
    draw.ellipse([cx - top_w * 0.60, cy - top_h * 0.30, cx - top_w * 0.25, cy - top_h * 0.06], fill=(255, 255, 255, 180))

    path = os.path.join(OUTPUT_DIR, filename)
    im.save(path, "PNG")
    print(f"Saved {path} ({im.size})")

if __name__ == "__main__":
    generate_bolt_shaft("bolt_shaft.png")
    generate_bolt_base("bolt_base.png")
    print("Regenerated photorealistic bright stainless bolt and base!")
