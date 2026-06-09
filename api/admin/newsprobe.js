// TEMPORÁRIO — diagnóstico dos feeds de "Breaking News". REMOVER após uso.
// GET /api/admin/newsprobe?t=endodiag2026
const { probeNews } = require('../../lib/news');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const t = (req.query && (req.query.t || req.query.T)) || '';
  if (t !== 'endodiag2026') { res.statusCode = 403; return res.end(JSON.stringify({ ok: false, error: 'forbidden' })); }
  try {
    const feeds = await probeNews();
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, feeds: feeds }));
  } catch (e) {
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: false, error: (e && e.message) || String(e) }));
  }
};
module.exports.config = { maxDuration: 60 };
