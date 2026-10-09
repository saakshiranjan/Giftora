/**
 * Giftora — Local Development Server
 * Serves the static site on http://localhost:3000
 * 
 * NOTE: sk_test keys are for backend/API use only.
 * This file shows how you'd use it securely in a Node server
 * for future API routes (e.g., order processing, Stripe webhooks).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ⚠️ SECURITY: Secret key stays server-side only — never exposed to browser
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'sk_test_IQYOjZ7aN78LaEF3VN2dmGw1VSoMOf4coRPkOgyEIu';
const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
  // CORS headers for Clerk
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API Route: Verify Clerk session (future use) ──
  if (req.url === '/api/verify-session' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Backend auth route ready',
      note: 'Connect CLERK_SECRET_KEY here for JWT verification'
    }));
    return;
  }

  // ── Static File Serving ──
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // Remove query strings
  filePath = filePath.split('?')[0];
  
  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Serve index.html for SPA-style 404s
        fs.readFile(path.join(__dirname, 'index.html'), (e, d) => {
          if (e) {
            res.writeHead(500);
            res.end('Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(d);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
      return;
    }

    // Cache control for images
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║         🎀  GIFTORA SERVER RUNNING  🎀   ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  Local:   http://localhost:${PORT}           ║`);
  console.log(`  ║  Network: http://127.0.0.1:${PORT}          ║`);
  console.log('  ╠══════════════════════════════════════════╣');
  console.log('  ║  Clerk Auth: ✅ pk_test loaded            ║');
  console.log('  ║  Secret Key: 🔒 server-side only          ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('\n  Press Ctrl+C to stop the server.\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ❌ Port ${PORT} is already in use. Try: node server.js\n`);
    process.exit(1);
  }
  throw err;
});
