import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "fitness.db")

def init():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            name TEXT NOT NULL,
            programme TEXT,
            block TEXT,
            week INTEGER,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            exercise TEXT NOT NULL,
            set_number INTEGER NOT NULL,
            reps INTEGER,
            weight REAL,
            weight_unit TEXT DEFAULT 'lbs',
            rpe REAL,
            duration_sec INTEGER,
            is_calibration INTEGER DEFAULT 0,
            notes TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS body_comp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            weight_lbs REAL,
            body_fat_pct REAL,
            lean_mass_lbs REAL,
            vo2_max REAL,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS working_weights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exercise TEXT NOT NULL,
            weight REAL NOT NULL,
            weight_unit TEXT DEFAULT 'lbs',
            date_set TEXT NOT NULL,
            source TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS supplements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dosage TEXT,
            time_of_day TEXT DEFAULT 'any',
            frequency TEXT DEFAULT 'daily',
            active INTEGER DEFAULT 1,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS supplement_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplement_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            taken INTEGER DEFAULT 1,
            time_taken TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (supplement_id) REFERENCES supplements(id),
            UNIQUE(supplement_id, date)
        )
    """)

    # Indexes for common queries
    c.execute("CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(exercise)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_sets_session ON sets(session_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_working_weights_exercise ON working_weights(exercise)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_body_comp_date ON body_comp(date)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_supplement_log_date ON supplement_log(date)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_supplement_log_supp ON supplement_log(supplement_id)")

    conn.commit()

    # Insert baseline body comp if table is empty
    c.execute("SELECT COUNT(*) FROM body_comp")
    if c.fetchone()[0] == 0:
        c.execute("""
            INSERT INTO body_comp (date, weight_lbs, body_fat_pct, lean_mass_lbs, vo2_max, notes)
            VALUES ('2026-04-11', 212, 25.0, 160, 44, 'Baseline')
        """)
        conn.commit()

    conn.close()
    print(f"Database initialized at {DB_PATH}")

if __name__ == "__main__":
    init()
