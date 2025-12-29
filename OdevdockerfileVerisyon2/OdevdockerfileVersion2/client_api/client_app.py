import os
import datetime
from functools import wraps

import jwt
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

HESAP_API_BASE = os.getenv("HESAP_API_BASE", "http://hesap_api:5000").rstrip("/")
API_HESAP = f"{HESAP_API_BASE}/api/hesapla"
API_GECMIS = f"{HESAP_API_BASE}/api/gecmis"
API_GECMIS_TEMIZLE = f"{HESAP_API_BASE}/api/gecmis/temizle"

API_TOKEN = os.getenv("API_TOKEN", "supersecret123")
JWT_SECRET = os.getenv("JWT_SECRET", "verysecretjwt")
JWT_TTL_MINUTES = int(os.getenv("JWT_TTL_MINUTES", "60"))

REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "5"))


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=JWT_TTL_MINUTES),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def require_token(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"hata": "Token gerekli"}), 401
        token = auth.replace("Bearer ", "", 1).strip()
        try:
            jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except Exception:
            return jsonify({"hata": "Token geçersiz/expired"}), 401
        return fn(*args, **kwargs)
    return wrapper


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    # demo login
    if username == "admin" and password == "1234":
        return jsonify({"token": create_token(username)})

    return jsonify({"hata": "Kullanıcı adı veya şifre yanlış"}), 401


def _proxy_json(method: str, url: str, payload=None):
    try:
        if method == "GET":
            r = requests.get(url, timeout=REQUEST_TIMEOUT)
        elif method == "POST":
            r = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
        else:
            raise ValueError("Unsupported method")
        # Hesap API bazen boş dönebilir; güvenli parse:
        try:
            body = r.json()
        except Exception:
            body = {"raw": r.text}
        return body, r.status_code
    except requests.RequestException as e:
        return {"hata": f"Hesap API erişilemiyor: {str(e)}"}, 502


@app.route("/client/hesapla", methods=["POST"])
def hesapla():
    data = request.get_json(silent=True) or {}
    body, status = _proxy_json("POST", API_HESAP, payload=data)
    return jsonify(body), status


@app.route("/client/gecmis", methods=["GET"])
@require_token
def gecmis():
    body, status = _proxy_json("GET", API_GECMIS)
    return jsonify(body), status


@app.route("/client/gecmis/temizle", methods=["POST"])
@require_token
def gecmis_temizle():
    body, status = _proxy_json("POST", API_GECMIS_TEMIZLE, payload={})
    return jsonify(body), status


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)
