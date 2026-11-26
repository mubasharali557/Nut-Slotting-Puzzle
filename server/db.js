import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure database directory and files exist
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

initDb();

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading users.json:', err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing users.json:', err);
  }
}

function readSessions() {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading sessions.json:', err);
    return {};
  }
}

function writeSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing sessions.json:', err);
  }
}

// Secure Password Hashing with unique salt per user & PBKDF2 (SHA-512, 100k iterations)
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  try {
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch (err) {
    return false;
  }
}

// Generate default fresh game progress for a new account
export function getDefaultProgress() {
  return {
    stage: 1,
    highestUnlocked: 1,
    coins: 250,
    stars: 0,
    gems: 0,
    activeTheme: 'playbg3',
    unlockedThemes: ['playbg3'],
    activeSkin: 'classic',
    unlockedSkins: ['classic'],
    activeNutSkin: 'steel_classic',
    unlockedNutSkins: ['steel_classic'],
    soundEnabled: true,
    musicEnabled: false,
    vibrationEnabled: true,
    lastPlayedAt: new Date().toISOString(),
  };
}

// User Operations
export function findUserByUsername(username) {
  if (!username) return null;
  const users = readUsers();
  return users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase()) || null;
}

export function findUserById(id) {
  if (!id) return null;
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

export function createUser(username, password) {
  const trimmed = username.trim();
  const existing = findUserByUsername(trimmed);
  if (existing) {
    throw new Error('Username already exists. Please choose a different username.');
  }

  const { salt, hash } = hashPassword(password);
  const newUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    username: trimmed,
    salt,
    hash,
    createdAt: new Date().toISOString(),
    progress: getDefaultProgress(),
  };

  const users = readUsers();
  users.push(newUser);
  writeUsers(users);

  return newUser;
}

export function updateUserProgress(userId, progressUpdate) {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  // Merge progress cleanly and sanitize values
  user.progress = {
    ...user.progress,
    ...(progressUpdate.stage !== undefined && { stage: Math.max(1, Number(progressUpdate.stage)) }),
    ...(progressUpdate.highestUnlocked !== undefined && {
      highestUnlocked: Math.max(1, Number(progressUpdate.highestUnlocked)),
    }),
    ...(progressUpdate.coins !== undefined && { coins: Math.max(0, Number(progressUpdate.coins)) }),
    ...(progressUpdate.stars !== undefined && { stars: Math.max(0, Number(progressUpdate.stars)) }),
    ...(progressUpdate.gems !== undefined && { gems: Math.max(0, Number(progressUpdate.gems)) }),
    ...(progressUpdate.activeTheme !== undefined && { activeTheme: String(progressUpdate.activeTheme) }),
    ...(Array.isArray(progressUpdate.unlockedThemes) && { unlockedThemes: progressUpdate.unlockedThemes }),
    ...(progressUpdate.activeSkin !== undefined && { activeSkin: String(progressUpdate.activeSkin) }),
    ...(Array.isArray(progressUpdate.unlockedSkins) && { unlockedSkins: progressUpdate.unlockedSkins }),
    ...(progressUpdate.activeNutSkin !== undefined && { activeNutSkin: String(progressUpdate.activeNutSkin) }),
    ...(Array.isArray(progressUpdate.unlockedNutSkins) && { unlockedNutSkins: progressUpdate.unlockedNutSkins }),
    ...(progressUpdate.soundEnabled !== undefined && { soundEnabled: Boolean(progressUpdate.soundEnabled) }),
    ...(progressUpdate.musicEnabled !== undefined && { musicEnabled: Boolean(progressUpdate.musicEnabled) }),
    ...(progressUpdate.vibrationEnabled !== undefined && {
      vibrationEnabled: Boolean(progressUpdate.vibrationEnabled),
    }),
    lastPlayedAt: new Date().toISOString(),
  };

  writeUsers(users);
  return user.progress;
}

// Session Operations
export function createSession(userId, username) {
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readSessions();
  sessions[token] = {
    userId,
    username,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days session
  };
  writeSessions(sessions);
  return token;
}

export function getSession(token) {
  if (!token) return null;
  const sessions = readSessions();
  const session = sessions[token];
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < Date.now()) {
    delete sessions[token];
    writeSessions(sessions);
    return null;
  }
  return session;
}

export function deleteSession(token) {
  if (!token) return;
  const sessions = readSessions();
  if (sessions[token]) {
    delete sessions[token];
    writeSessions(sessions);
  }
}

