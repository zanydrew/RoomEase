-- ============================================================
--  RoomEase — Full Database Schema
--  Engine : MySQL 8+
--  Charset: utf8mb4 (supports Khmer script + emoji)
-- ============================================================

CREATE DATABASE IF NOT EXISTS roomease_draft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE roomease_draft;

-- ============================================================
-- TABLE: users
-- Covers all three roles: RENTER | OWNER | ADMIN
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              INT           PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  password        VARCHAR(255)  NULL,                    -- NULL when using OAuth
  role            ENUM('RENTER','OWNER','ADMIN')
                                NOT NULL DEFAULT 'RENTER',
  avatar_url      VARCHAR(500)  NULL,
  phone           VARCHAR(20)   NULL,
  is_verified     BOOLEAN       NOT NULL DEFAULT FALSE,  -- Owner identity verified by admin
  is_banned       BOOLEAN       NOT NULL DEFAULT FALSE,
  auth_provider   ENUM('local','google','facebook')
                                NOT NULL DEFAULT 'local',
  provider_id     VARCHAR(255)  NULL,                    -- OAuth provider user ID
  preferred_lang  ENUM('en','km') NOT NULL DEFAULT 'en',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_role    (role),
  INDEX idx_users_email   (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: rooms
-- Core listing. Stays in "pending" until admin approves.
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id               INT             PRIMARY KEY AUTO_INCREMENT,
  owner_id         INT             NOT NULL,
  title            VARCHAR(255)    NOT NULL,
  description      TEXT            NULL,
  price            DECIMAL(10,2)   NOT NULL,
  price_unit       ENUM('month','week','day')
                                   NOT NULL DEFAULT 'month',
  address          TEXT            NOT NULL,
  district         VARCHAR(100)    NULL,                 -- e.g. "Toul Kork", "Sen Sok"
  city             VARCHAR(100)    NOT NULL DEFAULT 'Phnom Penh',
  latitude         DECIMAL(10,8)   NULL,                 -- for map pin
  longitude        DECIMAL(11,8)   NULL,                 -- for map pin
  room_type        ENUM('single','shared','studio','apartment')
                                   NOT NULL,
  size_sqm         DECIMAL(8,2)    NULL,
  -- JSON arrays stored as JSON columns (MySQL 5.7.8+)
  amenities        JSON            NULL,                 -- ["wifi","ac","hot_water","parking","washing_machine"]
  nearby_places    JSON            NULL,                 -- [{"name":"RUPP","type":"university","distance_km":0.5}]
  -- Moderation
  status           ENUM('pending','approved','rejected','rented','inactive')
                                   NOT NULL DEFAULT 'pending',
  rejection_reason TEXT            NULL,                 -- admin fills this on rejection
  -- Metrics (incremented by service layer, not raw SQL)
  views_count      INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_rooms_owner FOREIGN KEY (owner_id)
    REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_rooms_owner    (owner_id),
  INDEX idx_rooms_status   (status),
  INDEX idx_rooms_price    (price),
  INDEX idx_rooms_district (district),
  INDEX idx_rooms_type     (room_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: room_images
-- A room can have multiple images.
-- is_primary = TRUE for the thumbnail used in listing cards.
-- ============================================================
CREATE TABLE IF NOT EXISTS room_images (
  id                  INT          PRIMARY KEY AUTO_INCREMENT,
  room_id             INT          NOT NULL,
  image_url           VARCHAR(500) NOT NULL,
  cloudinary_public_id VARCHAR(255) NOT NULL,             -- needed to delete from Cloudinary
  is_primary          BOOLEAN      NOT NULL DEFAULT FALSE,
  display_order       TINYINT UNSIGNED NOT NULL DEFAULT 0, -- controls carousel order
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_room_images_room FOREIGN KEY (room_id)
    REFERENCES rooms(id) ON DELETE CASCADE,

  INDEX idx_room_images_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: favorites
-- A renter can save/unsave any approved room.
-- UNIQUE key prevents duplicates.
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id         INT       PRIMARY KEY AUTO_INCREMENT,
  user_id    INT       NOT NULL,
  room_id    INT       NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_favorites (user_id, room_id),

  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_room FOREIGN KEY (room_id)
    REFERENCES rooms(id) ON DELETE CASCADE,

  INDEX idx_favorites_user (user_id),
  INDEX idx_favorites_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: viewing_requests
-- Renter requests a physical visit. Owner can accept / reject /
-- suggest another time.
-- ============================================================
CREATE TABLE IF NOT EXISTS viewing_requests (
  id               INT    PRIMARY KEY AUTO_INCREMENT,
  room_id          INT    NOT NULL,
  renter_id        INT    NOT NULL,
  owner_id         INT    NOT NULL,
  requested_date   DATE   NOT NULL,
  requested_time   TIME   NOT NULL,
  status           ENUM('pending','accepted','rejected','suggested','cancelled')
                          NOT NULL DEFAULT 'pending',
  -- Owner fills these when suggesting a different slot
  suggested_date   DATE   NULL,
  suggested_time   TIME   NULL,
  owner_note       TEXT   NULL,   -- reason for rejection / counter-offer context
  renter_note      TEXT   NULL,   -- any message from renter at request time
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_vr_room   FOREIGN KEY (room_id)   REFERENCES rooms(id)  ON DELETE CASCADE,
  CONSTRAINT fk_vr_renter FOREIGN KEY (renter_id) REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_vr_owner  FOREIGN KEY (owner_id)  REFERENCES users(id)  ON DELETE CASCADE,

  INDEX idx_vr_room    (room_id),
  INDEX idx_vr_renter  (renter_id),
  INDEX idx_vr_owner   (owner_id),
  INDEX idx_vr_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: conversations
-- One conversation per (room, renter, owner) triple.
-- When renter clicks "Chat Owner" this row is created (or found).
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id                INT       PRIMARY KEY AUTO_INCREMENT,
  room_id           INT       NULL,        -- NULL if room is deleted but chat must persist
  renter_id         INT       NOT NULL,
  owner_id          INT       NOT NULL,
  last_message_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate chat threads for same room+renter+owner
  UNIQUE KEY uq_conversation (room_id, renter_id, owner_id),

  CONSTRAINT fk_conv_room   FOREIGN KEY (room_id)   REFERENCES rooms(id)  ON DELETE SET NULL,
  CONSTRAINT fk_conv_renter FOREIGN KEY (renter_id) REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_conv_owner  FOREIGN KEY (owner_id)  REFERENCES users(id)  ON DELETE CASCADE,

  INDEX idx_conv_renter (renter_id),
  INDEX idx_conv_owner  (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: messages
-- Individual messages inside a conversation.
-- MVP: polled (no WebSocket). Socket.IO added later.
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              INT          PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT          NOT NULL,
  sender_id       INT          NOT NULL,
  content         TEXT         NOT NULL,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_msg_conv   FOREIGN KEY (conversation_id)
    REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)
    REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_msg_conv   (conversation_id),
  INDEX idx_msg_sender (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: notifications
-- In-app notification feed for owners and renters.
-- reference_id + reference_type provide a polymorphic link back
-- to the triggering entity (room, viewing, message, etc.).
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id              INT           PRIMARY KEY AUTO_INCREMENT,
  user_id         INT           NOT NULL,           -- recipient
  type            ENUM(
                    'viewing_request',              -- owner receives
                    'viewing_accepted',             -- renter receives
                    'viewing_rejected',             -- renter receives
                    'viewing_suggested',            -- renter receives
                    'room_approved',                -- owner receives
                    'room_rejected',                -- owner receives
                    'new_message'                   -- both parties
                  )             NOT NULL,
  title           VARCHAR(255)  NOT NULL,
  body            TEXT          NULL,
  reference_id    INT           NULL,               -- e.g. room_id, viewing_id
  reference_type  VARCHAR(50)   NULL,               -- e.g. "room", "viewing", "message"
  is_read         BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_notif_user   (user_id),
  INDEX idx_notif_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
