"""
Pytest konfigurace a fixtures pro backend testy
"""
import pytest
import tempfile
import os
from backend import create_app, db
from backend.models import User, Password


@pytest.fixture
def app():
    """Vytvoří testovací Flask aplikaci"""
    # Vytvoříme dočasnou databázi
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_path}",
        "JWT_SECRET_KEY": "test-secret-key",
        "SECRET_KEY": "test-secret-key"
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """Testovací klient"""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Vytvoří testovacího uživatele a vrátí auth headers"""
    # Registrace testovacího uživatele
    response = client.post('/api/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'Test123!'
    })
    
    # Přihlášení
    response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'Test123!'
    })
    
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def sample_user(app):
    """Vytvoří testovacího uživatele v databázi"""
    with app.app_context():
        user = User(
            username='testuser',
            email='test@example.com',
            password_hash='hashed_password'
        )
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)  # Refresh to get the ID
        return user


@pytest.fixture
def sample_password(app, sample_user):
    """Vytvoří testovací heslo v databázi"""
    with app.app_context():
        password = Password(
            user_id=sample_user.id,
            site='example.com',
            username='testuser',
            password_encrypted='encrypted_password'
        )
        db.session.add(password)
        db.session.commit()
        db.session.refresh(password)  # Refresh to get the ID
        return password
