function parseRules(text) {
  const lines = String(text||'').split('\n').map(l=>l.trim()).filter(Boolean);
  const out = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const co = line.slice(0, idx).trim();
    const kws = line.slice(idx + 1).split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    out[co] = kws;
  }
  return out;
}

function parseMap(text) {
  const lines = String(text||'').split('\n').map(l=>l.trim()).filter(Boolean);
  const out = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const co = line.slice(0, idx).trim();
    const pos = line.slice(idx + 1).split(',').map(p => p.trim()).filter(Boolean);
    out[co] = pos;
  }
  return out;
}

function tokenize(str) {
  const s = String(str).toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  return s.split(/\s+/).filter(Boolean);
}

function classify(question, rulesText, mapText) {
  const rulesObj = typeof rulesText === 'object' ? rulesText : parseRules(rulesText);
  const mapObj = typeof mapText === 'object' ? mapText : parseMap(mapText);
  const tokens = tokenize(question);
  const tokenSet = new Set(tokens);
  const qLower = String(question||'').toLowerCase();
  const scores = {};
  const matchedKeywords = {};
  for (const [co, kws] of Object.entries(rulesObj)) {
    let score = 0;
    const matched = [];
    for (const kw of kws) {
      if (kw.includes(' ')) {
        if (qLower.includes(kw)) { score++; matched.push(kw + ' (phrase)'); }
      } else {
        if (tokenSet.has(kw)) { score++; matched.push(kw + ' (word)'); }
      }
    }
    scores[co] = score;
    matchedKeywords[co] = matched;
  }
  let bestCO = null, bestScore = -1;
  for (const [co, sc] of Object.entries(scores)) {
    if (sc > bestScore) { bestScore = sc; bestCO = co; }
  }
  if (bestScore <= 0) bestCO = null;
  return { question, tokens, scores, matchedKeywords, bestCO, bestScore, pos: mapObj[bestCO] || [] };
}

module.exports = { classify };
