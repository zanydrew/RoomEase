/** Parse limit/offset from query string with sane defaults */
const parsePagination = (query, defaultLimit = 12) => {
  const limit = Math.min(parseInt(query.limit) || defaultLimit, 50);
  const page = Math.max(parseInt(query.page) || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, offset, page };
};

module.exports = { parsePagination };
