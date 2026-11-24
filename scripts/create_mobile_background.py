from PIL import Image, ImageFilter

im = Image.open('public/game.webp')
w, h = im.size # 2752, 1536

# Target mobile dimensions: 1080 width x 2340 height (aspect 9:19.5, exactly iPhone/Android)
target_w = 1080
target_h = 2340

# In game.webp, the central content (title + mascots) spans x from ~400 to ~2352 (width 1952)
# Let's crop a clean column centered at x = 1376 (the center of game.webp)
# Crop width 1620, height 1536:
crop_w = 1620
left = (w - crop_w) // 2 # 566
right = left + crop_w   # 2186

# The core puzzle artwork:
core = im.crop((left, 0, right, h)) # 1620 x 1536

# Scale core to fit target_w:
# 1080 / 1620 = 0.6667
# scaled height = 1536 * 0.6667 = 1024
scale_ratio = target_w / crop_w
scaled_h = int(h * scale_ratio) # 1024
core_scaled = core.resize((target_w, scaled_h), Image.Resampling.LANCZOS)

# Create the full mobile canvas (1080 x 2340)
mobile_bg = Image.new('RGB', (target_w, target_h), (20, 12, 8))

# Top extension (from y = 0 to start of core):
# The top of game.webp is workshop wall with warm atmospheric glow
top_wall = im.crop((left, 0, right, 250)).resize((target_w, 400), Image.Resampling.LANCZOS)
top_wall_blurred = top_wall.filter(ImageFilter.GaussianBlur(radius=8))

# Bottom extension (the wooden workbench table):
# The bottom of game.webp (y=1100 to 1536) is rich wooden table with scattered nuts
table_section = im.crop((left, 1100, right, 1536)).resize((target_w, 750), Image.Resampling.LANCZOS)

# Let's place the elements on mobile_bg:
# We place core_scaled such that the title & mascots are comfortably in the upper-middle (from y = 350 to 1374)
core_y = 360

# 1. Fill background with subtle warm gradient from top to bottom
for y in range(target_h):
    frac = y / target_h
    # Dark warm brown tone
    r = int(24 + frac * 12)
    g = int(14 + frac * 8)
    b = int(10 + frac * 6)
    for x in range(target_w):
        mobile_bg.putpixel((x, y), (r, g, b))

# 2. Paste top wall with soft blend downwards
mobile_bg.paste(top_wall, (0, 0))

# 3. Paste the core puzzle (Title + Mascots + Shelf + Table top) at core_y
mobile_bg.paste(core_scaled, (0, core_y))

# 4. Seamlessly blend the table downwards to the bottom:
# In core_scaled, the table starts at around y = (1000 / 1536) * 1024 = 667px relative to core_scaled
# That corresponds to absolute y = core_y + 667 = 1027px
# From 1384px to 2340px (bottom), fill with rich continuous wood table texture
table_wood = im.crop((left, 1250, right, 1536)).resize((target_w, target_h - (core_y + scaled_h) + 100), Image.Resampling.LANCZOS)
mobile_bg.paste(table_wood, (0, core_y + scaled_h - 100))

# Let's smooth any transition using a gradient mask
# Soft blend at core_y (top transition, 60px):
for dy in range(60):
    alpha = dy / 60.0
    y = core_y + dy
    for x in range(target_w):
        c_top = top_wall.getpixel((x, min(399, y)))
        c_core = core_scaled.getpixel((x, dy))
        blended = (
            int(c_top[0] * (1 - alpha) + c_core[0] * alpha),
            int(c_top[1] * (1 - alpha) + c_core[1] * alpha),
            int(c_top[2] * (1 - alpha) + c_core[2] * alpha)
        )
        mobile_bg.putpixel((x, y), blended)

# Soft blend at table transition:
trans_y = core_y + scaled_h - 100
for dy in range(60):
    alpha = dy / 60.0
    y = trans_y + dy
    for x in range(target_w):
        c_core = core_scaled.getpixel((x, scaled_h - 100 + dy))
        c_tab = table_wood.getpixel((x, dy))
        blended = (
            int(c_core[0] * (1 - alpha) + c_tab[0] * alpha),
            int(c_core[1] * (1 - alpha) + c_tab[1] * alpha),
            int(c_core[2] * (1 - alpha) + c_tab[2] * alpha)
        )
        mobile_bg.putpixel((x, y), blended)

mobile_bg.save('test_mobile_bg.png')
print('test_mobile_bg.png created successfully! Size:', mobile_bg.size)

