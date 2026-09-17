// server.js — Express app entrypoint for CODMTally
const express = require('express');
const path = require('path');
const { PORT } = require('./lib/config');

const app = express();
app.use(express.json());

// CORS — same open policy as MineskiX's overlay server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  next();
});

app.get('/', (req, res) => res.redirect('/html/index.html'));

// Static assets — HTML served fresh every load (routes/lib changes still need
// a server restart; html/ changes take effect on next page load, same
// convention as MineskiX).
app.use(express.static(path.join(__dirname), {
  maxAge: '1d',
  index: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  },
}));

app.use(require('./routes/tally'));
app.use(require('./routes/externalTally'));
app.use(require('./routes/api'));

app.listen(PORT, '0.0.0.0', () => {
  console.log('================================================');
  console.log(`  CODMTally running on :${PORT}`);
  console.log(`  Console  → http://localhost:${PORT}/`);
  console.log(`  State    → GET  http://localhost:${PORT}/tally/state`);
  console.log(`  Events   → GET  http://localhost:${PORT}/tally/events  (SSE)`);
  console.log(`  Action   → POST http://localhost:${PORT}/tally/action`);
  console.log(`  Tally    → GET  http://localhost:${PORT}/tally/external  (experimental, read-only)`);
  console.log(`  API      → GET  http://localhost:${PORT}/api/roster`);
  console.log(`             → GET  http://localhost:${PORT}/api/tab1, /api/tab2, ... (one per Tally sheet)`);
  console.log(`             → GET  http://localhost:${PORT}/api/groupstage-qualifiers`);
  console.log('================================================');
});
