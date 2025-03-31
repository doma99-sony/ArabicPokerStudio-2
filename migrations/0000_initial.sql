-- إنشاء الأنواع المعرفة
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('player', 'vip', 'admin', 'moderator', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE game_type AS ENUM ('poker', 'naruto', 'domino', 'tekken');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE table_status AS ENUM ('available', 'full', 'in_progress', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  chips INTEGER NOT NULL DEFAULT 5000,
  diamonds INTEGER NOT NULL DEFAULT 0,
  vip_level INTEGER NOT NULL DEFAULT 0,
  vip_points INTEGER NOT NULL DEFAULT 0,
  role user_role NOT NULL DEFAULT 'player',
  avatar TEXT,
  cover_photo TEXT,
  user_code TEXT,
  total_deposits INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  facebook_id TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  preferences JSONB,
  status TEXT DEFAULT 'online',
  bio TEXT,
  phone TEXT
);

-- إنشاء جدول معاملات الرقائق
CREATE TABLE IF NOT EXISTS user_chips_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  game_id INTEGER,
  table_id INTEGER,
  source_user_id INTEGER,
  reference TEXT
);

-- إنشاء جدول معاملات الماس
CREATE TABLE IF NOT EXISTS user_diamonds_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reference TEXT
);

-- إنشاء جدول العناصر
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  price INTEGER,
  diamond_price INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  required_vip_level INTEGER DEFAULT 0,
  category TEXT,
  expires_in_days INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- إنشاء جدول عناصر المستخدم
CREATE TABLE IF NOT EXISTS user_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id),
  acquired_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_equipped BOOLEAN DEFAULT FALSE,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- إنشاء جدول الهدايا
CREATE TABLE IF NOT EXISTS user_gifts (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_opened BOOLEAN DEFAULT FALSE
);

-- إنشاء جدول الصداقات
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- إنشاء جدول الرسائل
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  reply_to_id INTEGER
);

-- إنشاء جدول طاولات اللعب
CREATE TABLE IF NOT EXISTS game_tables (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  game_type game_type NOT NULL DEFAULT 'poker',
  small_blind INTEGER NOT NULL,
  big_blind INTEGER NOT NULL,
  min_buy_in INTEGER NOT NULL,
  max_buy_in INTEGER,
  max_players INTEGER NOT NULL DEFAULT 9,
  current_players INTEGER NOT NULL DEFAULT 0,
  status table_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  table_image TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  required_vip_level INTEGER DEFAULT 0,
  password TEXT,
  owner_id INTEGER,
  table_settings JSONB
);

-- إنشاء جدول تاريخ اللعب
CREATE TABLE IF NOT EXISTS game_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_id INTEGER NOT NULL REFERENCES game_tables(id),
  game_type game_type NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  result TEXT NOT NULL,
  chips_change INTEGER NOT NULL,
  final_position INTEGER,
  hand_details JSONB,
  opponent_ids INTEGER[]
);

-- إنشاء جدول لاعبين الطاولة
CREATE TABLE IF NOT EXISTS table_players (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES game_tables(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  current_chips INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_action TEXT,
  last_action_time TIMESTAMP
);

-- إنشاء جدول تعريفات الإنجازات
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  reward_chips INTEGER DEFAULT 0,
  reward_diamonds INTEGER DEFAULT 0,
  reward_item_id INTEGER,
  category TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  requirements JSONB NOT NULL
);

-- إنشاء جدول إنجازات المستخدمين
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievement_definitions(id),
  progress INTEGER NOT NULL DEFAULT 0,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_date TIMESTAMP,
  reward_claimed BOOLEAN DEFAULT FALSE
);

-- إنشاء جدول إحصائيات اللاعبين
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  games_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  highest_win INTEGER NOT NULL DEFAULT 0,
  biggest_pot INTEGER NOT NULL DEFAULT 0,
  win_rate REAL NOT NULL DEFAULT 0,
  join_date TIMESTAMP NOT NULL DEFAULT NOW(),
  total_play_time INTEGER DEFAULT 0,
  
  -- إحصائيات خاصة بالبوكر
  hands_played INTEGER DEFAULT 0,
  flops_seen INTEGER DEFAULT 0,
  turns_reached INTEGER DEFAULT 0,
  river_reached INTEGER DEFAULT 0,
  showdowns_reached INTEGER DEFAULT 0,
  royal_flushes INTEGER DEFAULT 0,
  straight_flushes INTEGER DEFAULT 0,
  four_of_a_kind INTEGER DEFAULT 0,
  full_houses INTEGER DEFAULT 0,
  flushes INTEGER DEFAULT 0,
  straights INTEGER DEFAULT 0,
  three_of_a_kind INTEGER DEFAULT 0,
  two_pairs INTEGER DEFAULT 0,
  one_pairs INTEGER DEFAULT 0,
  
  -- إحصائيات إضافية
  total_bets INTEGER DEFAULT 0,
  total_raises INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  total_folds INTEGER DEFAULT 0,
  total_checks INTEGER DEFAULT 0,
  total_all_ins INTEGER DEFAULT 0
);

-- إنشاء جدول المهام
CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_chips INTEGER DEFAULT 0,
  reward_diamonds INTEGER DEFAULT 0,
  reward_vip_points INTEGER DEFAULT 0,
  type TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  game_type game_type
);

-- إنشاء جدول مهام المستخدمين
CREATE TABLE IF NOT EXISTS user_missions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id INTEGER NOT NULL REFERENCES missions(id),
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  reward_claimed BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- إنشاء جدول عروض المتجر
CREATE TABLE IF NOT EXISTS shop_offers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price REAL NOT NULL,
  chips_amount INTEGER DEFAULT 0,
  diamonds_amount INTEGER DEFAULT 0,
  item_ids INTEGER[],
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_vip_only BOOLEAN DEFAULT FALSE,
  required_vip_level INTEGER DEFAULT 0
);

-- إنشاء جدول مشتريات المستخدمين
CREATE TABLE IF NOT EXISTS user_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_id INTEGER REFERENCES shop_offers(id),
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  purchase_date TIMESTAMP NOT NULL DEFAULT NOW(),
  items_purchased JSONB
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code);
CREATE INDEX IF NOT EXISTS idx_user_chips_transactions_user_id ON user_chips_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_diamonds_transactions_user_id ON user_diamonds_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_items_user_id ON user_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gifts_to_user_id ON user_gifts(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_table_players_table_id ON table_players(table_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);