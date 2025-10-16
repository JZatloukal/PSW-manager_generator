from backend.security import encrypt_text, decrypt_text
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from backend import db
from backend.models import User, Password
from backend.validator import validate_email, validate_password  # Import validátorů
from flask import Blueprint, jsonify

api_bp = Blueprint("api_bp", __name__, url_prefix="/api")

# --- TEST ROUTE pro start_all.sh ---
@api_bp.route("/test", methods=["GET"])
def test():
    return jsonify({"success": True, "message": "Backend funguje"})

# --- CENTRÁLNÍ ERROR HANDLERS ---
@api_bp.app_errorhandler(404)
def not_found_error(e):
    return jsonify({"success": False, "error": "Stránka nenalezena", "message": str(e), "status_code": 404}), 404

@api_bp.app_errorhandler(400)
def bad_request_error(e):
    return jsonify({"success": False, "error": "Chybný požadavek", "message": str(e), "status_code": 400}), 400

@api_bp.app_errorhandler(500)
def internal_server_error(e):
    return jsonify({"success": False, "error": "Vnitřní chyba serveru", "message": str(e), "status_code": 500}), 500
# --- KONEC ERROR HANDLERŮ ---

@api_bp.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "zdravý", "service": "password-manager-api"})


@api_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    if not username or not email or not password:
        return jsonify({"success": False, "error": "Chybí povinné údaje", "message": "Uživatelské jméno, email a heslo jsou povinné", "status_code": 400}), 400
    if not validate_email(email):
        return jsonify({"success": False, "error": "Neplatný formát emailu", "message": "Email neodpovídá požadovanému formátu", "status_code": 400}), 400
    if not validate_password(password):
        return jsonify({"success": False, "error": "Složitost hesla", "message": "Heslo nesplňuje požadavky na složitost", "status_code": 400}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"success": False, "error": "Uživatel již existuje", "message": "Uživatel s tímto jménem nebo emailem již existuje", "status_code": 409}), 409
    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"success": True, "message": "Uživatel byl úspěšně zaregistrován"})


@api_bp.route("/login", methods=["POST"])   
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"success": False, "error": "Chybí přihlašovací údaje", "message": "Email a heslo jsou povinné", "status_code": 400}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"success": False, "error": "Neplatné přihlašovací údaje", "message": "Email nebo heslo je nesprávné", "status_code": 401}), 401
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        "success": True,
        "message": "Přihlášení proběhlo úspěšně",
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200


@api_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "Uživatel nenalezen", "message": "Uživatel neexistuje", "status_code": 404}), 404
    return jsonify({
        "success": True,
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }), 200


@api_bp.route("/passwords", methods=["GET", "POST"])
@jwt_required()
def passwords():
    user_id = int(get_jwt_identity())
    if request.method == "GET":
        passwords = Password.query.filter_by(user_id=user_id).all()
        result = []
        for p in passwords:
            result.append({
                "id": p.id,
                "site": p.site,
                "username": p.username,
            })
        return jsonify(result)
    elif request.method == "POST":
        data = request.get_json()
        site = data.get("site")
        username = data.get("username")
        password = data.get("password")
        if not site or not username or not password:
            return jsonify({"success": False, "error": "Chybí povinné údaje", "message": "Web, uživatelské jméno a heslo jsou povinné", "status_code": 400}), 400
        new_password = Password(
            user_id=user_id,
            site=site,
            username=username,
            password_encrypted=encrypt_text(password),
        )
        db.session.add(new_password)
        db.session.commit()
        return jsonify({"id": new_password.id, "success": True, "message": "Heslo bylo uloženo"})

@api_bp.route("/passwords/<int:pid>/reveal", methods=["GET"])
@jwt_required()
def reveal_password(pid):
    user_id = int(get_jwt_identity())
    item = Password.query.filter_by(id=pid, user_id=user_id).first()
    if not item:
        return jsonify({"success": False, "error": "Heslo nenalezeno", "message": "Heslo neexistuje", "status_code": 404}), 404
    decrypted = decrypt_text(item.password_encrypted)
    return jsonify({
        "success": True,
        "id": item.id,
        "site": item.site,
        "username": item.username,
        "password": decrypted,
    }), 200

# Update password
@api_bp.route("/passwords/<int:pid>", methods=["PUT"])
@jwt_required()
def update_password(pid):
    user_id = int(get_jwt_identity())
    item = Password.query.filter_by(id=pid, user_id=user_id).first()
    if not item:
        return jsonify({"success": False, "error": "Heslo nenalezeno", "message": "Heslo neexistuje", "status_code": 404}), 404
    data = request.get_json() or {}
    if "site" in data:
        if not data["site"]:
            return jsonify({"success": False, "error": "Neplatný vstup", "message": "Web nemůže být prázdný", "status_code": 400}), 400
        item.site = data["site"]
    if "username" in data:
        if not data["username"]:
            return jsonify({"success": False, "error": "Neplatný vstup", "message": "Uživatelské jméno nemůže být prázdné", "status_code": 400}), 400
        item.username = data["username"]
    if "password" in data:
        if not data["password"]:
            return jsonify({"success": False, "error": "Neplatný vstup", "message": "Heslo nemůže být prázdné", "status_code": 400}), 400
        item.password_encrypted = encrypt_text(data["password"])
    db.session.commit()
    return jsonify({"success": True, "message": "Heslo bylo aktualizováno"}), 200


# Delete password
@api_bp.route("/passwords/<int:pid>", methods=["DELETE"])
@jwt_required()
def delete_password(pid):
    user_id = int(get_jwt_identity())
    item = Password.query.filter_by(id=pid, user_id=user_id).first()
    if not item:
        return jsonify({"success": False, "error": "Heslo nenalezeno", "message": "Heslo neexistuje", "status_code": 404}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"success": True, "message": "Heslo bylo smazáno"}), 200


# JWT refresh endpoint
@api_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"success": True, "access_token": access_token}), 200

