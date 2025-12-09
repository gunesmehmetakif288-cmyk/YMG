from flask import Flask, request, jsonify
from flasgger import Swagger
from calculator_service import CalculatorService
from datetime import datetime

app = Flask(__name__)
swagger = Swagger(app)

service = CalculatorService()
history = []


@app.route('/api/hesapla', methods=['POST'])
def hesapla():
    data = request.get_json() or {}

    islem = data.get("islem")
    raw_sayi1 = data.get("sayi1")
    raw_sayi2 = data.get("sayi2")

    if islem is None or raw_sayi1 is None:
        return jsonify({"hata": "islem ve sayi1 zorunludur"}), 400

    valid_ops = ["toplama", "çıkarma", "çarpma", "bölme", "üs", "karekök"]
    if islem not in valid_ops:
        return jsonify({"hata": "Geçersiz işlem"}), 400

    try:
        sayi1 = float(raw_sayi1)
    except:
        return jsonify({"hata": "sayi1 geçerli değil"}), 400

    sayi2 = None
    if islem != "karekök":
        try:
            sayi2 = float(raw_sayi2)
        except:
            return jsonify({"hata": "sayi2 geçerli değil"}), 400

    sonuc = service.calculate(islem, sayi1, sayi2)

    kayit = {
        "islem": islem,
        "sayi1": sayi1,
        "sayi2": sayi2,
        "sonuc": sonuc,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    history.append(kayit)

    return jsonify({"sonuc": sonuc})


@app.route('/api/gecmis', methods=['GET'])
def gecmis():
    return jsonify(history)


@app.route('/api/gecmis/temizle', methods=['POST'])
def temizle():
    history.clear()
    return jsonify({"mesaj": "Geçmiş temizlendi"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
