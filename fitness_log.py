import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "fitness.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- SESSION LOGGING ---

def log_session(date, name, sets_data, notes=None, programme=None, block=None, week=None):
    """
    Log a full session.
    sets_data: list of dicts with keys:
        exercise, set_number, reps, weight, weight_unit, rpe,
        duration_sec, is_calibration, notes
    """
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "INSERT INTO sessions (date, name, programme, block, week, notes) VALUES (?, ?, ?, ?, ?, ?)",
        (date, name, programme, block, week, notes)
    )
    session_id = c.lastrowid
    for s in sets_data:
        c.execute("""
            INSERT INTO sets (session_id, exercise, set_number, reps, weight, weight_unit, rpe, duration_sec, is_calibration, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            s.get("exercise"),
            s.get("set_number"),
            s.get("reps"),
            s.get("weight"),
            s.get("weight_unit", "lbs"),
            s.get("rpe"),
            s.get("duration_sec"),
            s.get("is_calibration", 0),
            s.get("notes")
        ))
    conn.commit()
    conn.close()
    return session_id

# --- WORKING WEIGHTS ---

def update_working_weight(exercise, weight, weight_unit="lbs", date_set=None, source=None, notes=None):
    conn = get_conn()
    c = conn.cursor()
    date_set = date_set or datetime.now().strftime("%Y-%m-%d")
    c.execute(
        "INSERT INTO working_weights (exercise, weight, weight_unit, date_set, source, notes) VALUES (?, ?, ?, ?, ?, ?)",
        (exercise, weight, weight_unit, date_set, source, notes)
    )
    conn.commit()
    conn.close()

def get_latest_working_weight(exercise):
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "SELECT weight, weight_unit, date_set FROM working_weights WHERE exercise = ? ORDER BY date_set DESC LIMIT 1",
        (exercise,)
    )
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_working_weights():
    conn = get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT w.exercise, w.weight, w.weight_unit, w.date_set
        FROM working_weights w
        INNER JOIN (
            SELECT exercise, MAX(date_set) as max_date FROM working_weights GROUP BY exercise
        ) latest ON w.exercise = latest.exercise AND w.date_set = latest.max_date
        ORDER BY w.exercise
    """)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# --- BODY COMP ---

def log_body_comp(date, weight_lbs=None, body_fat_pct=None, lean_mass_lbs=None, vo2_max=None, notes=None):
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "INSERT INTO body_comp (date, weight_lbs, body_fat_pct, lean_mass_lbs, vo2_max, notes) VALUES (?, ?, ?, ?, ?, ?)",
        (date, weight_lbs, body_fat_pct, lean_mass_lbs, vo2_max, notes)
    )
    conn.commit()
    conn.close()

def get_body_comp_history():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM body_comp ORDER BY date DESC")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# --- MILESTONES ---

def log_milestone(date, type, description, notes=None):
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "INSERT INTO milestones (date, type, description, notes) VALUES (?, ?, ?, ?)",
        (date, type, description, notes)
    )
    conn.commit()
    conn.close()

# --- QUERIES ---

def get_exercise_history(exercise, limit=20):
    conn = get_conn()
    c = conn.cursor()
    c.execute("""
        SELECT s.date, s.name as session_name, st.set_number, st.reps, st.weight, st.weight_unit, st.rpe, st.duration_sec, st.notes
        FROM sets st
        JOIN sessions s ON st.session_id = s.id
        WHERE st.exercise = ?
        ORDER BY s.date DESC, st.set_number
        LIMIT ?
    """, (exercise, limit))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_session(session_id):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    session = dict(c.fetchone())
    c.execute("SELECT * FROM sets WHERE session_id = ? ORDER BY set_number", (session_id,))
    session["sets"] = [dict(r) for r in c.fetchall()]
    conn.close()
    return session

def get_recent_sessions(limit=5):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM sessions ORDER BY date DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_volume_by_week(exercise=None):
    conn = get_conn()
    c = conn.cursor()
    if exercise:
        c.execute("""
            SELECT s.week, s.block, SUM(st.reps * st.weight) as total_volume, COUNT(st.id) as total_sets
            FROM sets st JOIN sessions s ON st.session_id = s.id
            WHERE st.exercise = ?
            GROUP BY s.week, s.block
            ORDER BY s.week
        """, (exercise,))
    else:
        c.execute("""
            SELECT s.week, s.block, SUM(st.reps * st.weight) as total_volume, COUNT(st.id) as total_sets
            FROM sets st JOIN sessions s ON st.session_id = s.id
            GROUP BY s.week, s.block
            ORDER BY s.week
        """)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

if __name__ == "__main__":
    print("Current working weights:")
    for w in get_all_working_weights():
        print(f"  {w['exercise']}: {w['weight']} {w['weight_unit']} (set {w['date_set']})")
    print()
    print("Recent sessions:")
    for s in get_recent_sessions():
        print(f"  {s['date']} — {s['name']}")
    print()
    print("Body comp history:")
    for b in get_body_comp_history():
        print(f"  {b['date']}: {b['weight_lbs']} lbs, {b['body_fat_pct']}% BF, VO2 {b['vo2_max']}")
