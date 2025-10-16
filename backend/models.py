from backend import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Vztah k heslům
    passwords = db.relationship("Password", backref="user", lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"


# Password model
class Password(db.Model):
    __table_args__ = (db.UniqueConstraint("user_id", "site", "username", name="uq_user_site_username"),)

    id = db.Column(db.Integer, primary_key=True)
    site = db.Column(db.String(255), nullable=False)   # název služby/webu
    username = db.Column(db.String(150), nullable=False)   # uživatelské jméno pro danou službu
    password_encrypted = db.Column(db.Text, nullable=False)  # uložené heslo (zašifrované/zahešované)
    note = db.Column(db.Text)  # volitelná poznámka
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # vazba na uživatele
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)

    def __repr__(self):
        return f"<Password {self.site} for {self.username}>"