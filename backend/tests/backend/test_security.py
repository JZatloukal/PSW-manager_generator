"""
Unit testy pro security modul (šifrování)
"""
import pytest
from backend.security import encrypt_text, decrypt_text
from cryptography.fernet import Fernet


class TestEncryption:
    """Testy pro šifrování a dešifrování"""
    
    def test_encrypt_decrypt_cycle(self):
        """Test kompletního cyklu šifrování a dešifrování"""
        original_text = "SuperSecretPassword123!"
        
        # Šifrování
        encrypted = encrypt_text(original_text)
        
        # Ověření, že šifrovaný text je jiný než originál
        assert encrypted != original_text
        assert isinstance(encrypted, str)
        assert len(encrypted) > 0
        
        # Dešifrování
        decrypted = decrypt_text(encrypted)
        
        # Ověření, že dešifrovaný text je stejný jako originál
        assert decrypted == original_text
    
    def test_encrypt_different_inputs(self):
        """Test šifrování různých vstupů"""
        test_cases = [
            "simple",
            "password with spaces",
            "123456789",
            "!@#$%^&*()",
            "české znaky: ěščřžýáíé",
            "",  # Prázdný string
            "very long password " * 100  # Dlouhý string
        ]
        
        for original in test_cases:
            encrypted = encrypt_text(original)
            decrypted = decrypt_text(encrypted)
            assert decrypted == original, f"Failed for input: {original[:50]}..."
    
    def test_encrypt_deterministic(self):
        """Test, že stejný vstup vytvoří různé šifrované texty (kvůli salt)"""
        original = "test_password"
        
        encrypted1 = encrypt_text(original)
        encrypted2 = encrypt_text(original)
        
        # Šifrované texty by měly být různé (kvůli náhodnému salt)
        assert encrypted1 != encrypted2
        
        # Ale dešifrování by mělo dát stejný výsledek
        assert decrypt_text(encrypted1) == original
        assert decrypt_text(encrypted2) == original
    
    def test_decrypt_invalid_input(self):
        """Test dešifrování neplatného vstupu"""
        with pytest.raises(Exception):
            decrypt_text("invalid_encrypted_text")
        
        with pytest.raises(Exception):
            decrypt_text("")
        
        with pytest.raises(Exception):
            decrypt_text(None)
    
    def test_generate_key(self):
        """Test generování klíče"""
        key = Fernet.generate_key()
        
        assert isinstance(key, bytes)
        assert len(key) == 44  # Fernet klíč je base64 encoded, má 44 bytů
    
    def test_generate_key_unique(self):
        """Test, že generované klíče jsou různé"""
        key1 = Fernet.generate_key()
        key2 = Fernet.generate_key()
        
        assert key1 != key2
