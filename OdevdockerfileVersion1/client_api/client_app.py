from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import datetime
import jwt
from functools import wraps

app = Flask(__name__)
CORS(app)

# Hesap API adresleri (Docker network içinden)
HESAP_API_BASE = "http://hesap_api:5000"
API_HESAP = f"{HESAP_API_BASE}/api/hesapla"
API_GECMIS = f"{HESAP_API_BASE}/api/gecmis"
API_GECMIS_TEMIZLE = f"{HESAP_API_BASE}/api/gecmis/temizle"

# Sabit API token (Bearer token mantığı)
API_TOKEN = os.getenv("API_TOKEN", "supersecret123")

# JWT ayarları
JWT_SECRET = os.getenv("JWT_SECRET", "verysecretjwt")
JWT_ALGO = "HS256"
JWT_EXPIRES_MINUTES = 60


def generate_jwt(username: str) -> str:
    now = datetime.datetime.utcnow()
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + datetime.timedelta(minutes=JWT_EXPIRES_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_jwt(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception:
        return None


def require_token(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"hata": "Token gerekli"}), 401

        token = auth_header.split(" ", 1)[1].strip()

        # 1) Statik API token ise direkt kabul et
        if token == API_TOKEN:
            return f(*args, **kwargs)

        # 2) JWT ise doğrula
        payload = verify_jwt(token)
        if payload is None:
            return jsonify({"hata": "Geçersiz veya süresi dolmuş token"}), 403

        return f(*args, **kwargs)

    return wrapper


# ============ LOGIN (JWT ÜRETİR) ============
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    # DEMO kullanıcı: admin / 1234
    if username == "admin" and password == "1234":
        token = generate_jwt(username)
        return jsonify({
            "access_token": token,
            "token_type": "Bearer",
            "expires_in_minutes": JWT_EXPIRES_MINUTES
        }), 200

    return jsonify({"hata": "Kullanıcı adı veya şifre hatalı"}), 401


# ============ HESAPLAMA (AÇIK ENDPOINT) ============
@app.route("/client/hesapla", methods=["POST"])
def hesapla():
    data = request.get_json() or {}

    try:
        r = requests.post(API_HESAP, json=data, timeout=5)
        body = r.json()
        return jsonify({"cevap": body}), r.status_code
    except Exception as e:
        return jsonify({"hata": f"Hesap API hatası: {str(e)}"}), 500


# ============ GECMİŞ (KORUMALI ENDPOINT) ============
@app.route("/client/gecmis", methods=["GET"])
@require_token
def gecmis():
    try:
        r = requests.get(API_GECMIS, timeout=5)
        body = r.json()
        return jsonify(body), r.status_code
    except Exception as e:
        return jsonify({"hata": f"Hesap API hatası: {str(e)}"}), 500


@app.route("/client/gecmis/temizle", methods=["POST"])
@require_token
def gecmis_temizle():
    try:
        r = requests.post(API_GECMIS_TEMIZLE, timeout=5)
        body = r.json()
        return jsonify(body), r.status_code
    except Exception as e:
        return jsonify({"hata": f"Hesap API hatası: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)
