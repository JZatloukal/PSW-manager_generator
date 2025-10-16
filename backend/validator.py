import re

def validate_email(email: str) -> bool:
    """
    Zkontroluje, zda je zadaný email ve správném formátu.
    Vrací True, pokud je platný, jinak False.
    """
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email) is not None

def validate_password(password: str) -> bool:
    """
    Zkontroluje, zda je heslo silné.
    Silné heslo má alespoň 8 znaků, obsahuje alespoň jednu číslici,
    jedno velké písmeno, jedno malé písmeno a jeden speciální znak.
    Vrací True, pokud jsou splněny všechny podmínky, jinak False.
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True