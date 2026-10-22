-- Vi Chi - Migration khởi tạo cơ sở dữ liệu
-- Phiên bản: 1
-- Mô tả: Tạo các bảng giao dịch, danh mục, ngân sách, cài đặt

-- Bật khóa ngoại
PRAGMA foreign_keys = ON;

-- Bảng giao dịch
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  category_id INTEGER NOT NULL,
  transaction_date TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
);

-- Chỉ mục cho giao dịch
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions (type, transaction_date);

-- Bảng danh mục
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Chỉ mục cho danh mục
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories (type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (is_active);

-- Bảng ngân sách
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  month TEXT NOT NULL CHECK (month LIKE '____-__'),
  limit_amount INTEGER NOT NULL CHECK (limit_amount >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  UNIQUE (category_id, month)
);

-- Chỉ mục cho ngân sách
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets (month);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets (category_id);

-- Bảng cài đặt
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Chèn cài đặt mặc định
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('language', 'vi'),
  ('currency', 'VND'),
  ('theme', 'light'),
  ('budget_start_day', '1'),
  ('alert_threshold_warning', '80'),
  ('alert_threshold_danger', '100');

-- Trigger cập nhật updated_at cho transactions
CREATE TRIGGER IF NOT EXISTS trigger_transactions_updated_at
AFTER UPDATE ON transactions
BEGIN
  UPDATE transactions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger cập nhật updated_at cho categories
CREATE TRIGGER IF NOT EXISTS trigger_categories_updated_at
AFTER UPDATE ON categories
BEGIN
  UPDATE categories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger cập nhật updated_at cho budgets
CREATE TRIGGER IF NOT EXISTS trigger_budgets_updated_at
AFTER UPDATE ON budgets
BEGIN
  UPDATE budgets SET updated_at = datetime('now') WHERE id = NEW.id;
END;