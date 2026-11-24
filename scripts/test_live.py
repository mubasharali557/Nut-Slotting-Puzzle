import urllib.request
import re

domain = 'https://nut-slotting-puzzle.vercel.app/'
req = urllib.request.Request(domain, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as res:
        html = res.read().decode('utf-8')
        print("Live HTML length:", len(html))
        print("HTML snippet:\n", html[:400])
        js_files = re.findall(r'src=["\']([^"\']+\.js)["\']', html)
        print("JS files in live HTML:", js_files)
        
        for asset in ['game_mobile.webp', 'game.webp', 'playbg3.webp', 'mobile_hero_banner.webp', 'mobile_hero_banner.png']:
            a_url = domain + asset
            try:
                a_req = urllib.request.Request(a_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(a_req) as a_res:
                    data = a_res.read()
                    print(f"  {asset}: {a_res.status} (size={len(data)})")
            except Exception as e:
                print(f"  {asset}: ERROR {e}")
except Exception as e:
    print("Failed to fetch domain:", e)
