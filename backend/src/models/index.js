const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'roomease_draft',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: false,
      freezeTableName: true,
    },
  }
);

// Import models
const User             = require('./User')(sequelize);
const Room             = require('./Room')(sequelize);
const Amenity          = require('./Amenity')(sequelize);
const RoomAmenity      = require('./RoomAmenity')(sequelize);
const RoomImage        = require('./RoomImage')(sequelize);
const SavedRoom        = require('./SavedRoom')(sequelize);
const ViewingRequest   = require('./ViewingRequest')(sequelize);
const Conversation     = require('./Conversation')(sequelize);
const Message          = require('./Message')(sequelize);
const Review           = require('./Review')(sequelize);
const University       = require('./University')(sequelize);
const NearbyUniversity = require('./NearbyUniversity')(sequelize);
const Notification     = require('./Notification')(sequelize);
const SearchHistory    = require('./SearchHistory')(sequelize);

// ── Associations ─────────────────────────────────────────────────────────────

// User → Rooms (owner)
User.hasMany(Room, { foreignKey: 'owner_id', as: 'rooms' });
Room.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Room → Images
Room.hasMany(RoomImage, { foreignKey: 'room_id', as: 'images' });
RoomImage.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// Room ↔ Amenity (many-to-many through ROOM_AMENITIES)
Room.belongsToMany(Amenity, { through: RoomAmenity, foreignKey: 'room_id', otherKey: 'amenity_id', as: 'amenities' });
Amenity.belongsToMany(Room, { through: RoomAmenity, foreignKey: 'amenity_id', otherKey: 'room_id', as: 'rooms' });

// User → SavedRooms
User.hasMany(SavedRoom, { foreignKey: 'user_id', as: 'savedRooms' });
SavedRoom.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Room.hasMany(SavedRoom, { foreignKey: 'room_id', as: 'savedBy' });
SavedRoom.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// ViewingRequests
Room.hasMany(ViewingRequest, { foreignKey: 'room_id', as: 'viewingRequests' });
ViewingRequest.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
User.hasMany(ViewingRequest, { foreignKey: 'renter_id', as: 'viewingRequestsAsRenter' });
ViewingRequest.belongsTo(User, { foreignKey: 'renter_id', as: 'renter' });
User.hasMany(ViewingRequest, { foreignKey: 'owner_id', as: 'viewingRequestsAsOwner' });
ViewingRequest.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Conversations
Room.hasMany(Conversation, { foreignKey: 'room_id', as: 'conversations' });
Conversation.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
User.hasMany(Conversation, { foreignKey: 'renter_id', as: 'conversationsAsRenter' });
Conversation.belongsTo(User, { foreignKey: 'renter_id', as: 'renter' });
User.hasMany(Conversation, { foreignKey: 'owner_id', as: 'conversationsAsOwner' });
Conversation.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Messages
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Reviews
Room.hasMany(Review, { foreignKey: 'room_id', as: 'reviews' });
Review.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Room ↔ University (many-to-many through NEARBY_UNIVERSITIES)
Room.belongsToMany(University, { through: NearbyUniversity, foreignKey: 'room_id', otherKey: 'university_id', as: 'nearbyUniversities' });
University.belongsToMany(Room, { through: NearbyUniversity, foreignKey: 'university_id', otherKey: 'room_id', as: 'nearbyRooms' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// SearchHistory
User.hasMany(SearchHistory, { foreignKey: 'user_id', as: 'searchHistory' });
SearchHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Room,
  Amenity,
  RoomAmenity,
  RoomImage,
  SavedRoom,
  ViewingRequest,
  Conversation,
  Message,
  Review,
  University,
  NearbyUniversity,
  Notification,
  SearchHistory,
};
