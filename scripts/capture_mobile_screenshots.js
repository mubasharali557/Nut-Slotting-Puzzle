import fs from 'node:fs';
import { spawn } from 'node:child_process';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Edge for Stage 2 & responsive verification...');
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
    const targetTab = tabs.find((t) => t.type === 'page');
    if (!targetTab) throw new Error('No page tab found');

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

    await send('Page.enable');
    await send('DOM.enable');

    // 1. Mobile Portrait: 390x844
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' },
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true });

    console.log('Navigating to http://localhost:5173/ ...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });

    // Set Stage 2 in localStorage and bypass auth
    for (let attempt = 0; attempt < 15; attempt++) {
      await sleep(1000);
      const evalCheck = await send('Runtime.evaluate', {
        expression: `
          (() => {
            localStorage.setItem('watersort_stage', '2');
            localStorage.setItem('watersort_highest_stage', '2');
            const guestBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('guest'));
            if (guestBtn) {
              guestBtn.click();
              return 'clicked_guest';
            }
            const playBtn = Array.from(document.querySelectorAll('button')).find(b => (b.title && b.title.includes('Play')) || (b.querySelector && b.querySelector('img[src*="play_button"]')));
            if (playBtn) return 'on_home';
            return 'waiting';
          })()
        `,
      });
      console.log('Mount attempt ' + attempt + ':', evalCheck.result?.value);
      if (evalCheck.result?.value === 'clicked_guest') {
        await sleep(2000);
        break;
      }
      if (evalCheck.result?.value === 'on_home') break;
    }

    await sleep(2000);

    // Click Play to load Stage 2
    console.log('Clicking Play...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('watersort_stage', '2');
          const buttons = Array.from(document.querySelectorAll('button'));
          const playBtn = buttons.find(b => 
            (b.title && b.title.toLowerCase().includes('play')) || 
            (b.getAttribute('aria-label') && b.getAttribute('aria-label').toLowerCase().includes('play')) ||
            (b.querySelector('img') && b.querySelector('img').src.includes('play_button'))
          );
          if (playBtn) playBtn.click();
        })()
      `,
    });

    await sleep(3500);

    // Capture Mobile Stage 2
    console.log('Capturing mobile_stage2_verified.png (390x844)...');
    const mobileScreen = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_stage2_verified.png', Buffer.from(mobileScreen.data, 'base64'));
    console.log('Saved mobile_stage2_verified.png');

    // 2. Desktop Mode: 1280x720
    console.log('Switching to Desktop 1280x720...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
      screenOrientation: { angle: 0, type: 'landscapePrimary' },
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: false });

    await sleep(2000);

    console.log('Capturing desktop_stage2_verified.png (1280x720)...');
    const desktopScreen = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('desktop_stage2_verified.png', Buffer.from(desktopScreen.data, 'base64'));
    console.log('Saved desktop_stage2_verified.png');

    ws.close();
  } finally {
    edgeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Error running test capture:', err);
  process.exit(1);
});
