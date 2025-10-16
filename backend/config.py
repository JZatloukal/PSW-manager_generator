import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    """
    Konfigurační třída pro aplikaci.

    Sekce:
    - Flask: Základní nastavení Flask aplikace (DEBUG, TESTING, ENV, SECRET_KEY).
    - DB: Nastavení databáze, zde SQLite (SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS).
    - JWT: Nastavení pro práci s JSON Web Tokeny (JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES).
    """

    # === Flask ===
    DEBUG = os.environ.get("FLASK_ENV") != "production"
    TESTING = False
    ENV = os.environ.get("FLASK_ENV", "development")
    SECRET_KEY = os.environ.get("SECRET_KEY") or "super-secret-key"

    # === DB ===
    # Pro production používáme PostgreSQL, pro development SQLite
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if DATABASE_URL:
        # Railway/Heroku style DATABASE_URL - opravit pro psycopg
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
        else:
            # Pokud už je postgresql://, změnit na psycopg driver
            if DATABASE_URL.startswith("postgresql://"):
                DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Lokální SQLite pro development
        SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "instance", "app.db")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # === JWT ===
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # Platnost access tokenu v sekundách (zde 1 hodina)
    JWT_REFRESH_TOKEN_EXPIRES = 86400  # Platnost refresh tokenu v sekundách (zde 1 den)