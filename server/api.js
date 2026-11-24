import {
  createUser,
  findUserByUsername,
  findUserById,
  verifyPassword,
  createSession,
  getSession,
  deleteSession,
  updateUserProgress,
} from './db.js';

// Parse JSON helper from incoming request stream
async function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Safeguard against oversized payload
      if (body.length > 1e6) {
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.end(JSON.stringify(data));
}

function extractToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export async function handleApiRequest(req, res, next) {
  const url = req.url ? req.url.split('?')[0] : '';

  // Only handle routes under /api/
  if (!url.startsWith('/api/')) {
    if (next) return next();
    return false;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.end();
    return true;
  }

  try {
    // 1. POST /api/auth/register
    if (url === '/api/auth/register' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { username, password } = body;

      if (!username || typeof username !== 'string' || username.trim().length < 3) {
        return sendJson(res, 400, {
          error: 'Username must be at least 3 characters long.',
        });
      }

      if (!password || typeof password !== 'string' || password.length < 4) {
        return sendJson(res, 400, {
          error: 'Password must be at least 4 characters long.',
        });
      }

      // Check for valid characters in username (letters, numbers, underscore, hyphen)
      if (!/^[a-zA-Z0-9_\-\s]+$/.test(username.trim())) {
        return sendJson(res, 400, {
          error: 'Username can only contain letters, numbers, hyphens, and underscores.',
        });
      }

      try {
        const newUser = createUser(username, password);
        const token = createSession(newUser.id, newUser.username);

        return sendJson(res, 201, {
          success: true,
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            createdAt: newUser.createdAt,
          },
          progress: newUser.progress,
        });
      } catch (err) {
        return sendJson(res, 409, {
          error: err.message || 'Username already exists.',
        });
      }
    }

    // 2. POST /api/auth/login
    if (url === '/api/auth/login' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { username, password } = body;

      if (!username || !password) {
        return sendJson(res, 400, {
          error: 'Please provide both username and password.',
        });
      }

      const user = findUserByUsername(username);
      if (!user) {
        return sendJson(res, 401, {
          error: 'Invalid username or password.',
        });
      }

      const isValid = verifyPassword(password, user.salt, user.hash);
      if (!isValid) {
        return sendJson(res, 401, {
          error: 'Invalid username or password.',
        });
      }

      const token = createSession(user.id, user.username);
      return sendJson(res, 200, {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        },
        progress: user.progress,
      });
    }

    // 3. GET /api/auth/me
    if (url === '/api/auth/me' && req.method === 'GET') {
      const token = extractToken(req);
      const session = getSession(token);
      if (!session) {
        return sendJson(res, 401, { error: 'Unauthorized or session expired.' });
      }

      const user = findUserById(session.userId);
      if (!user) {
        return sendJson(res, 401, { error: 'User no longer exists.' });
      }

      return sendJson(res, 200, {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
        },
        progress: user.progress,
      });
    }

    // 4. POST /api/auth/logout
    if (url === '/api/auth/logout' && req.method === 'POST') {
      const token = extractToken(req);
      if (token) {
        deleteSession(token);
      }
      return sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
    }

    // 5. PUT /api/player/progress
    if (url === '/api/player/progress' && req.method === 'PUT') {
      const token = extractToken(req);
      const session = getSession(token);
      if (!session) {
        return sendJson(res, 401, { error: 'Unauthorized. Please log in.' });
      }

      const body = await parseJsonBody(req);
      const updatedProgress = updateUserProgress(session.userId, body);
      if (!updatedProgress) {
        return sendJson(res, 404, { error: 'Player data not found.' });
      }

      return sendJson(res, 200, {
        success: true,
        progress: updatedProgress,
      });
    }

    // 6. GET /api/player/progress
    if (url === '/api/player/progress' && req.method === 'GET') {
      const token = extractToken(req);
      const session = getSession(token);
      if (!session) {
        return sendJson(res, 401, { error: 'Unauthorized. Please log in.' });
      }

      const user = findUserById(session.userId);
      if (!user) {
        return sendJson(res, 404, { error: 'Player data not found.' });
      }

      return sendJson(res, 200, {
        success: true,
        progress: user.progress,
      });
    }

    // Default 404 for unknown /api routes
    return sendJson(res, 404, { error: 'API route not found' });
  } catch (error) {
    console.error('[API Error]:', error);
    return sendJson(res, 500, { error: 'Internal Server Error' });
  }
}

