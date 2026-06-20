const { pool } = require("../config/db");

// ── READ ──────────────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, avatar_url, phone, is_verified, is_banned, preferred_lang, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0] || null;
};

const findByProviderId = async (provider, providerId) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE auth_provider = ? AND provider_id = ?",
    [provider, providerId]
  );
  return rows[0] || null;
};

const findAll = async ({ role, is_banned, limit = 20, offset = 0 } = {}) => {
  let query =
    "SELECT id, name, email, role, avatar_url, phone, is_verified, is_banned, created_at FROM users WHERE 1=1";
  const params = [];

  if (role) {
    query += " AND role = ?";
    params.push(role);
  }
  if (typeof is_banned === "boolean") {
    query += " AND is_banned = ?";
    params.push(is_banned);
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows;
};

// ── CREATE ────────────────────────────────────────────────────

const create = async ({ name, email, password, role, auth_provider, provider_id, avatar_url }) => {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, role, auth_provider, provider_id, avatar_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, password || null, role, auth_provider || "local", provider_id || null, avatar_url || null]
  );
  return findById(result.insertId);
};

// ── UPDATE ────────────────────────────────────────────────────

const updateProfile = async (id, { name, phone, avatar_url, preferred_lang }) => {
  await pool.query(
    "UPDATE users SET name = ?, phone = ?, avatar_url = ?, preferred_lang = ? WHERE id = ?",
    [name, phone, avatar_url, preferred_lang, id]
  );
  return findById(id);
};

const updatePassword = async (id, hashedPassword) => {
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    hashedPassword,
    id,
  ]);
};

const setVerified = async (id, is_verified) => {
  await pool.query("UPDATE users SET is_verified = ? WHERE id = ?", [
    is_verified,
    id,
  ]);
};

const setBanned = async (id, is_banned) => {
  await pool.query("UPDATE users SET is_banned = ? WHERE id = ?", [
    is_banned,
    id,
  ]);
};

// ── DELETE ────────────────────────────────────────────────────

const remove = async (id) => {
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
};

// ── ANALYTICS ─────────────────────────────────────────────────

const countByRole = async () => {
  const [rows] = await pool.query(
    "SELECT role, COUNT(*) AS total FROM users GROUP BY role"
  );
  return rows;
};

module.exports = {
  findById,
  findByEmail,
  findByProviderId,
  findAll,
  create,
  updateProfile,
  updatePassword,
  setVerified,
  setBanned,
  remove,
  countByRole,
};
