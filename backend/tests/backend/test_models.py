"""
Unit testy pro databázové modely
"""
import pytest
from backend.models import User, Password
from backend import db
from datetime import datetime


class TestUser:
    """Testy pro User model"""
    
    def test_user_creation(self, app):
        """Test vytvoření uživatele"""
        with app.app_context():
            user = User(
                username='testuser',
                email='test@example.com',
                password_hash='hashed_password'
            )
            db.session.add(user)
            db.session.commit()
            
            assert user.id is not None
            assert user.username == 'testuser'
            assert user.email == 'test@example.com'
            assert user.password_hash == 'hashed_password'
            assert isinstance(user.created_at, datetime)
    
    def test_user_repr(self, app):
        """Test __repr__ metody"""
        with app.app_context():
            user = User(
                username='testuser',
                email='test@example.com',
                password_hash='hashed_password'
            )
            db.session.add(user)
            db.session.commit()
            
            assert repr(user) == '<User testuser>'
    
    def test_user_unique_email(self, app):
        """Test unikátnosti emailu"""
        with app.app_context():
            user1 = User(
                username='user1',
                email='test@example.com',
                password_hash='hash1'
            )
            user2 = User(
                username='user2',
                email='test@example.com',  # Stejný email
                password_hash='hash2'
            )
            
            db.session.add(user1)
            db.session.commit()
            
            db.session.add(user2)
            with pytest.raises(Exception):  # SQLAlchemy exception
                db.session.commit()


class TestPassword:
    """Testy pro Password model"""
    
    def test_password_creation(self, app, sample_user):
        """Test vytvoření hesla"""
        with app.app_context():
            password = Password(
                user_id=sample_user.id,
                site='example.com',
                username='testuser',
                password_encrypted='encrypted_password',
                note='Test note'
            )
            db.session.add(password)
            db.session.commit()
            
            assert password.id is not None
            assert password.user_id == sample_user.id
            assert password.site == 'example.com'
            assert password.username == 'testuser'
            assert password.password_encrypted == 'encrypted_password'
            assert password.note == 'Test note'
            assert isinstance(password.created_at, datetime)
    
    def test_password_repr(self, app, sample_user):
        """Test __repr__ metody"""
        with app.app_context():
            password = Password(
                user_id=sample_user.id,
                site='example.com',
                username='testuser',
                password_encrypted='encrypted_password'
            )
            db.session.add(password)
            db.session.commit()
            
            assert repr(password) == '<Password example.com for testuser>'
    
    def test_password_user_relationship(self, app, sample_user):
        """Test vztahu mezi Password a User"""
        with app.app_context():
            password = Password(
                user_id=sample_user.id,
                site='example.com',
                username='testuser',
                password_encrypted='encrypted_password'
            )
            db.session.add(password)
            db.session.commit()
            
            # Test přístupu k uživateli přes heslo
            assert password.user.username == 'testuser'
            assert password.user.email == 'test@example.com'
    
    def test_password_unique_constraint(self, app, sample_user):
        """Test unikátního constraintu (user_id, site, username)"""
        with app.app_context():
            password1 = Password(
                user_id=sample_user.id,
                site='example.com',
                username='testuser',
                password_encrypted='encrypted1'
            )
            password2 = Password(
                user_id=sample_user.id,
                site='example.com',  # Stejný site
                username='testuser',  # Stejný username
                password_encrypted='encrypted2'
            )
            
            db.session.add(password1)
            db.session.commit()
            
            db.session.add(password2)
            with pytest.raises(Exception):  # SQLAlchemy exception
                db.session.commit()
