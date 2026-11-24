import fs from 'node:fs';
import { spawn } from 'node:child_process';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Edge on port 9222...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  await sleep(2500);

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    console.log('Open tabs:', tabs.length);
    const targetTab = tabs.find((t) => t.type === 'page');
    if (!targetTab) throw new Error('No page tab found');
    console.log('Selected page tab:', targetTab.title, targetTab.id);

    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    let id = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    console.log('Enabling Page & Emulating Device 390x844...');
    await send('Page.enable');
    await send('DOM.enable');

    // Emulate iPhone 14 / modern phone (390 x 844, scale 2)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' },
    });

    await send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
    });

    console.log('Navigating to http://localhost:5173/ ...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    
    // Wait until React mounts
    let guestClicked = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      await sleep(1000);
      const evalCheck = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const guestBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('guest'));
            if (guestBtn) {
              guestBtn.click();
              return 'clicked_guest';
            }
            // Check if already on Home screen
            const playBtn = Array.from(document.querySelectorAll('button')).find(b => (b.title && b.title.includes('Play')) || (b.querySelector && b.querySelector('img[src*=\"play_button\"]')));
            if (playBtn) return 'on_home_screen';
            return 'waiting';
          })()
        `,
      });
      console.log('Mount attempt ' + attempt + ':', evalCheck.result?.value);
      if (evalCheck.result?.value === 'clicked_guest') {
        guestClicked = true;
        await sleep(2500);
        break;
      }
      if (evalCheck.result?.value === 'on_home_screen') {
        break;
      }
    }

    console.log('Waiting for Home Screen...');
    await sleep(2500);

    // Capture SCREEN 1: Mobile Home Screen
    console.log('Capturing Mobile Home Screen...');
    const homeScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_home_verified.png', Buffer.from(homeScreenshot.data, 'base64'));
    console.log('Saved mobile_home_verified.png');

    // Click PLAY button to go to Gameplay screen
    console.log('Clicking PLAY button...');
    const playClick = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const playBtn = buttons.find(b => 
            (b.title && b.title.toLowerCase().includes('play')) || 
            (b.getAttribute('aria-label') && b.getAttribute('aria-label').toLowerCase().includes('play')) ||
            (b.querySelector('img') && b.querySelector('img').src.includes('play_button'))
          );
          if (playBtn) {
            playBtn.click();
            return 'clicked_play';
          }
          return 'no_play_btn: ' + buttons.map(b => b.title || b.getAttribute('aria-label') || b.textContent).join(' | ');
        })()
      `,
    });
    console.log('Play button click:', playClick.result?.value);
    await sleep(3500);

    // Capture SCREEN 2: Mobile Gameplay Screen
    console.log('Capturing Mobile Gameplay Screen...');
    const gameScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_gameplay_verified.png', Buffer.from(gameScreenshot.data, 'base64'));
    console.log('Saved mobile_gameplay_verified.png');

    ws.close();
  } finally {
    edgeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Error running capture:', err);
  process.exit(1);
});
