const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export { asyncHandler };      // named export
export default asyncHandler;  // default export