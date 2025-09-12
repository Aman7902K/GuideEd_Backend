import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  let userId;

  // 1) Try standard Bearer JWT
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      // Common ID claims
      userId = payload.sub || payload.id || payload.userId || payload._id;
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  }

  // 2) Dev fallback via header/body/query if explicitly allowed
  if (!userId && process.env.ALLOW_HEADER_USER_ID === 'true') {
    userId =
      req.header('x-user-id') ??
      req.body?.userId ??
      req.query?.userId ??
      req.user?.id;
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated.' });
  }

  req.user = { id: String(userId) };
  next();
}