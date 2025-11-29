import sqlite3
import json
from typing import Optional, Dict, Any
from contextlib import contextmanager
import os


class Database:
    """SQLite database manager for the application."""

    def __init__(self, db_path: str = "netresearch.db"):
        """Initialize database connection."""
        # Use persistent disk in production, local path in development
        if os.path.exists("/data"):
            # Production: Render persistent disk
            self.db_path = f"/data/{db_path}"
        else:
            # Development: Local directory
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            self.db_path = os.path.join(backend_dir, db_path)
        self._init_db()

    def _init_db(self):
        """Initialize database tables."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Create new users table for authentication
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    hashed_password TEXT,
                    provider TEXT DEFAULT 'email',
                    is_active INTEGER DEFAULT 1,
                    created_at TEXT NOT NULL,
                    last_login TEXT
                )
            """)

            # Create user_details table for profile information
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_details (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER UNIQUE NOT NULL,
                    name TEXT,
                    cv_transcribed TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)

            # Migrate data from old user table to new structure if exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user'")
            if cursor.fetchone():
                # Check if old user table has data
                cursor.execute("SELECT * FROM user LIMIT 1")
                old_user = cursor.fetchone()
                if old_user:
                    # Create a default user with old data
                    from datetime import datetime
                    now = datetime.utcnow().isoformat()
                    cursor.execute(
                        "INSERT OR IGNORE INTO users (email, hashed_password, created_at) VALUES (?, ?, ?)",
                        ("default@example.com", "changeme", now)
                    )
                    user_id = cursor.lastrowid
                    if user_id:
                        cursor.execute(
                            "INSERT OR IGNORE INTO user_details (user_id, name, cv_transcribed) VALUES (?, ?, ?)",
                            (user_id, old_user["name"], old_user["cv_transcribed"])
                        )
                # Drop old user table
                cursor.execute("DROP TABLE user")

            # Update run table to include user_id
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS run_new (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    query TEXT NOT NULL,
                    graph_data TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)

            # Migrate run data if old table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='run'")
            if cursor.fetchone():
                # Check if new column structure needed
                cursor.execute("PRAGMA table_info(run)")
                columns = [col[1] for col in cursor.fetchall()]
                if 'user_id' not in columns:
                    # Migrate data to new table
                    from datetime import datetime
                    now = datetime.utcnow().isoformat()
                    cursor.execute("SELECT id FROM users LIMIT 1")
                    default_user = cursor.fetchone()
                    if default_user:
                        default_user_id = default_user[0]
                        cursor.execute("""
                            INSERT INTO run_new (id, user_id, query, graph_data, created_at)
                            SELECT id, ?, query, graph_data, ?
                            FROM run
                        """, (default_user_id, now))
                    cursor.execute("DROP TABLE run")
                    cursor.execute("ALTER TABLE run_new RENAME TO run")
                else:
                    cursor.execute("DROP TABLE run_new")
            else:
                cursor.execute("ALTER TABLE run_new RENAME TO run")

            conn.commit()

    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    # User authentication operations
    def create_user(self, email: str, hashed_password: Optional[str] = None, provider: str = 'email') -> int:
        """Create a new user account."""
        from datetime import datetime
        now = datetime.utcnow().isoformat()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (email, hashed_password, provider, created_at) VALUES (?, ?, ?, ?)",
                (email, hashed_password, provider, now)
            )
            conn.commit()
            return cursor.lastrowid

    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row["id"],
                    "email": row["email"],
                    "hashed_password": row["hashed_password"],
                    "provider": row["provider"],
                    "is_active": bool(row["is_active"]),
                    "created_at": row["created_at"],
                    "last_login": row["last_login"]
                }
            return None

    def get_user_by_id(self, user_id: int) -> Optional[dict]:
        """Get user by ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row["id"],
                    "email": row["email"],
                    "hashed_password": row["hashed_password"],
                    "provider": row["provider"],
                    "is_active": bool(row["is_active"]),
                    "created_at": row["created_at"],
                    "last_login": row["last_login"]
                }
            return None

    def update_last_login(self, user_id: int) -> None:
        """Update user's last login timestamp."""
        from datetime import datetime
        now = datetime.utcnow().isoformat()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET last_login = ? WHERE id = ?",
                (now, user_id)
            )
            conn.commit()

    # User details operations
    def get_user_details(self, user_id: int) -> Optional[dict]:
        """Get user details by user ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_details WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row["id"],
                    "user_id": row["user_id"],
                    "name": row["name"],
                    "cv_transcribed": row["cv_transcribed"]
                }
            return None

    def create_user_details(self, user_id: int, name: Optional[str] = None, cv_transcribed: Optional[str] = None) -> int:
        """Create user details entry."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO user_details (user_id, name, cv_transcribed) VALUES (?, ?, ?)",
                (user_id, name, cv_transcribed)
            )
            conn.commit()
            return cursor.lastrowid

    def update_user_details(self, user_id: int, name: Optional[str] = None, cv_transcribed: Optional[str] = None) -> None:
        """Update user details."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Check if details exist
            cursor.execute("SELECT id FROM user_details WHERE user_id = ?", (user_id,))
            if cursor.fetchone():
                # Update existing
                if name is not None:
                    cursor.execute("UPDATE user_details SET name = ? WHERE user_id = ?", (name, user_id))
                if cv_transcribed is not None:
                    cursor.execute("UPDATE user_details SET cv_transcribed = ? WHERE user_id = ?", (cv_transcribed, user_id))
            else:
                # Create new
                cursor.execute(
                    "INSERT INTO user_details (user_id, name, cv_transcribed) VALUES (?, ?, ?)",
                    (user_id, name, cv_transcribed)
                )
            conn.commit()

    # Run operations
    def create_run(self, run_id: str, user_id: int, query: str, graph_data: Optional[Dict[str, Any]] = None) -> None:
        """Create a new run."""
        from datetime import datetime
        now = datetime.utcnow().isoformat()
        # Serialize graph_data to JSON if provided
        graph_data_json = json.dumps(graph_data) if graph_data else None

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO run (id, user_id, query, graph_data, created_at) VALUES (?, ?, ?, ?, ?)",
                (run_id, user_id, query, graph_data_json, now)
            )
            conn.commit()

    def get_run(self, run_id: str, user_id: Optional[int] = None) -> Optional[dict]:
        """Get a run by ID, optionally filtering by user_id."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if user_id is not None:
                cursor.execute("SELECT * FROM run WHERE id = ? AND user_id = ?", (run_id, user_id))
            else:
                cursor.execute("SELECT * FROM run WHERE id = ?", (run_id,))
            row = cursor.fetchone()
            if row:
                # Deserialize graph_data from JSON if present
                graph_data = json.loads(row["graph_data"]) if row["graph_data"] else None
                return {
                    "id": row["id"],
                    "user_id": row["user_id"],
                    "query": row["query"],
                    "graph_data": graph_data,
                    "created_at": row["created_at"]
                }
            return None

    def update_run_graph(self, run_id: str, graph_data: Dict[str, Any]) -> None:
        """Update the graph data for a run."""
        # Serialize graph_data to JSON
        graph_data_json = json.dumps(graph_data)

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE run SET graph_data = ? WHERE id = ?",
                (graph_data_json, run_id)
            )
            conn.commit()

    def list_runs(self, user_id: Optional[int] = None) -> list[dict]:
        """List all runs, optionally filtering by user_id."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if user_id is not None:
                cursor.execute("SELECT * FROM run WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            else:
                cursor.execute("SELECT * FROM run ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [
                {
                    "id": row["id"],
                    "user_id": row["user_id"],
                    "query": row["query"],
                    "graph_data": json.loads(row["graph_data"]) if row["graph_data"] else None,
                    "created_at": row["created_at"]
                }
                for row in rows
            ]

    # Reset operations
    def reset_all_data(self) -> None:
        """Delete all data from users, user_details, and run tables."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_details")
            cursor.execute("DELETE FROM run")
            cursor.execute("DELETE FROM users")
            conn.commit()


# Global database instance
db = Database()
