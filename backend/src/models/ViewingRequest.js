const { pool } = require("../config/db");

const BASE_SELECT = `
  SELECT
    vr.*,
    r.title        AS room_title,
    r.address      AS room_address,
    renter.name    AS renter_name,
    renter.phone   AS renter_phone,
    owner.name     AS owner_name,
    owner.phone    AS owner_phone
  FROM viewing_requests vr
  JOIN rooms r        ON r.id  = vr.room_id
  JOIN users renter   ON renter.id = vr.renter_id
  JOIN users owner    ON owner.id  = vr.owner_id
`;

// ── READ ──────────────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE vr.id = ?`, [id]);
  return rows[0] || null;
};

/**
 * Get all viewing requests for an owner (their rooms).
 */
const findByOwner = async (ownerId, status) => {
  let query = `${BASE_SELECT} WHERE vr.owner_id = ?`;
  const params = [ownerId];
  if (status) { query += " AND vr.status = ?"; params.push(status); }
  query += " ORDER BY vr.created_at DESC";
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Get all viewing requests made by a renter.
 */
const findByRenter = async (renterId, status) => {
  let query = `${BASE_SELECT} WHERE vr.renter_id = ?`;
  const params = [renterId];
  if (status) { query += " AND vr.status = ?"; params.push(status); }
  query += " ORDER BY vr.created_at DESC";
  const [rows] = await pool.query(query, params);
  return rows;
};

// ── CREATE ────────────────────────────────────────────────────

const create = async ({ room_id, renter_id, owner_id, requested_date, requested_time, renter_note }) => {
  const [result] = await pool.query(
    `INSERT INTO viewing_requests
       (room_id, renter_id, owner_id, requested_date, requested_time, renter_note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [room_id, renter_id, owner_id, requested_date, requested_time, renter_note || null]
  );
  return findById(result.insertId);
};

// ── UPDATE ────────────────────────────────────────────────────

const accept = async (id) => {
  await pool.query("UPDATE viewing_requests SET status = 'accepted' WHERE id = ?", [id]);
  return findById(id);
};

const reject = async (id, owner_note) => {
  await pool.query(
    "UPDATE viewing_requests SET status = 'rejected', owner_note = ? WHERE id = ?",
    [owner_note || null, id]
  );
  return findById(id);
};

const suggestTime = async (id, { suggested_date, suggested_time, owner_note }) => {
  await pool.query(
    `UPDATE viewing_requests
     SET status = 'suggested', suggested_date = ?, suggested_time = ?, owner_note = ?
     WHERE id = ?`,
    [suggested_date, suggested_time, owner_note || null, id]
  );
  return findById(id);
};

const cancel = async (id) => {
  await pool.query("UPDATE viewing_requests SET status = 'cancelled' WHERE id = ?", [id]);
};

module.exports = { findById, findByOwner, findByRenter, create, accept, reject, suggestTime, cancel };
