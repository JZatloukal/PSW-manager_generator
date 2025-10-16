from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from backend.config import Config
from flask_jwt_extended import JWTManager
import os

# Inicializace rozšíření
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
    
    # Konfigurace
    app.config.from_object(Config)
    
    # Inicializace rozšíření s aplikací
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Inicializace databáze pro produkci - vytvořit tabulky přímo
    with app.app_context():
        try:
            # Vytvořit tabulky přímo v PostgreSQL
            from sqlalchemy import text
            
            # Vytvořit tabulku user
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS "user" (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(150) UNIQUE NOT NULL,
                    email VARCHAR(150) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Vytvořit indexy pro user
            db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_user_created_at ON \"user\" (created_at)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_user_email ON \"user\" (email)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_user_username ON \"user\" (username)"))
            
            # Vytvořit tabulku password
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS password (
                    id SERIAL PRIMARY KEY,
                    site VARCHAR(255) NOT NULL,
                    username VARCHAR(150) NOT NULL,
                    password_encrypted TEXT NOT NULL,
                    note TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES "user" (id),
                    CONSTRAINT uq_user_site_username UNIQUE (user_id, site, username)
                )
            """))
            
            # Vytvořit indexy pro password
            db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_password_created_at ON password (created_at)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_password_user_id ON password (user_id)"))
            
            db.session.commit()
            
        except Exception as e:
            # Fallback na db.create_all() pokud PostgreSQL selže
            db.create_all()
    
    # CORS konfigurace
    from flask_cors import CORS
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
    
    # Registrace blueprintu
    from backend.routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")
    
    # Servírování React build souborů
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        if path.startswith('api/'):
            # API routes jsou handled jinak
            return "API route not found", 404
        
        if not app.static_folder or not os.path.exists(app.static_folder):
            return "Static folder not found", 500
        
        # Servírování statických souborů
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            # Pro SPA - všechny ostatní routes přesměruj na index.html
            return send_from_directory(app.static_folder, 'index.html')
    
    # CORS headers pro development
    @app.after_request
    def after_request(response):
        # V produkci nepotřebujeme CORS pro stejný origin
        if app.config.get('FLASK_ENV') == 'development':
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    return app