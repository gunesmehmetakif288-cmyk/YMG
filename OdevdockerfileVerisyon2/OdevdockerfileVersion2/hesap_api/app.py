import os
from flask import Flask, request, jsonify
from flasgger import Swagger

from calculator_service import CalculatorService
from db import wait_for_db, init_db, insert_history, fetch_history, clear_history

app = Flask(__name__)
swagger = Swagger(app)

service = CalculatorService()

_initialized = False

def ensure_db_ready():
    """DB bağlantısı hazır değilse bekler ve tabloyu oluşturur.
    Gunicorn gibi WSGI sunucularında import-time side effect olmasın diye lazy init.
    """
    global _initialized
    if _initialized:
        return
    wait_for_db(timeout_sec=int(os.getenv("DB_WAIT_TIMEOUT", "45")))
    init_db()
    _initialized = True


@app.before_request
def _before_any_request():
    # health endpointi DB'siz de cevaplayabilsin:
    if request.path == "/health":
        return
    ensure_db_ready()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})


@app.route("/api/hesapla", methods=["POST"])
def hesapla():
    data = request.get_json(silent=True) or {}

    islem = data.get("islem")
    raw_sayi1 = data.get("sayi1")
    raw_sayi2 = data.get("sayi2")

    if islem is None or raw_sayi1 is None:
        return jsonify({"hata": "islem ve sayi1 zorunludur"}), 400

    islem = str(islem).lower()

    valid_ops = ["toplama", "çıkarma", "cikarma", "çarpma", "carpma", "bölme", "bolme", "üs", "us", "karekök", "karekok"]
    if islem not in valid_ops:
        return jsonify({"hata": "Geçersiz işlem"}), 400

    # normalize TR chars a bit
    mapping = {
        "cikarma": "çıkarma",
        "carpma": "çarpma",
        "bolme": "bölme",
        "us": "üs",
        "karekok": "karekök",
    }
    islem = mapping.get(islem, islem)

    try:
        sayi1 = float(raw_sayi1)
    except Exception:
        return jsonify({"hata": "sayi1 geçerli değil"}), 400

    sayi2 = None
    if islem != "karekök":
        if raw_sayi2 is None:
            return jsonify({"hata": "sayi2 zorunludur"}), 400
        try:
            sayi2 = float(raw_sayi2)
        except Exception:
            return jsonify({"hata": "sayi2 geçerli değil"}), 400

        if islem == "bölme" and sayi2 == 0:
            return jsonify({"hata": "0'a bölme yapılamaz"}), 400

    if islem == "karekök" and sayi1 < 0:
        return jsonify({"hata": "Negatif sayının karekökü alınamaz"}), 400

    try:
        sonuc = service.calculate(islem, sayi1, sayi2)
    except Exception as e:
        return jsonify({"hata": str(e)}), 400

    # Geçmişi DB'ye yaz
    insert_history(islem=islem, sayi1=sayi1, sayi2=sayi2, sonuc=sonuc)

    return jsonify({"sonuc": sonuc})


@app.route("/api/gecmis", methods=["GET"])
def gecmis():
    limit = request.args.get("limit", "200")
    try:
        limit_i = max(1, min(500, int(limit)))
    except Exception:
        limit_i = 200
    return jsonify(fetch_history(limit=limit_i))


@app.route("/api/gecmis/temizle", methods=["POST"])
def temizle():
    silinen = clear_history()
    return jsonify({"mesaj": "Geçmiş temizlendi", "silinen_kayit": silinen})


if __name__ == "__main__":
    # dev amaçlı
    app.run(host="0.0.0.0", port=5000)
