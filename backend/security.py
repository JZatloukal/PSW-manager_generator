from cryptography.fernet import Fernet
import base64
import os

# Pokud klíč neexistuje, vytvoří se nový
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
KEY_FILE = os.path.join(BASE_DIR, "instance", "fernet.key")

# Vytvoření instance složky pokud neexistuje
os.makedirs(os.path.dirname(KEY_FILE), exist_ok=True)

if not os.path.exists(KEY_FILE):
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as f:
        f.write(key)
else:
    with open(KEY_FILE, "rb") as f:
        key = f.read()

fernet = Fernet(key)

def encrypt_text(plaintext: str) -> str:
    return fernet.encrypt(plaintext.encode()).decode()

def decrypt_text(ciphertext: str) -> str:
    return fernet.decrypt(ciphertext.encode()).decode()
