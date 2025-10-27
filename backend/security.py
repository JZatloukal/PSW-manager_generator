import os
from cryptography.fernet import Fernet

# upřednostňujeme klíč z prostředí, aby se v produkci neztrácela data
_env_key = os.environ.get("FERNET_KEY")
_flask_env = os.environ.get("FLASK_ENV", "development")

if _env_key:
    key_bytes = _env_key.strip().encode()
    try:
        fernet = Fernet(key_bytes)
    except (ValueError, TypeError) as exc:
        raise ValueError("Hodnota FERNET_KEY není platný Fernet klíč.") from exc
else:
    if _flask_env == "production":
        raise RuntimeError("V produkci musí být nastaveno prostředí FERNET_KEY.")
    # fallback pro lokální vývoj - uložený klíč na disku
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    KEY_FILE = os.path.join(BASE_DIR, "instance", "fernet.key")
    os.makedirs(os.path.dirname(KEY_FILE), exist_ok=True)

    if not os.path.exists(KEY_FILE):
        key_bytes = Fernet.generate_key()
        with open(KEY_FILE, "wb") as f:
            f.write(key_bytes)
    else:
        with open(KEY_FILE, "rb") as f:
            key_bytes = f.read()

    fernet = Fernet(key_bytes)

def encrypt_text(plaintext: str) -> str:
    return fernet.encrypt(plaintext.encode()).decode()

def decrypt_text(ciphertext: str) -> str:
    return fernet.decrypt(ciphertext.encode()).decode()
