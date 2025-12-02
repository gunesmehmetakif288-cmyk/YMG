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
    data = request.get_json()
    islem = data.get("islem")
    sayi1 = float(data.get("sayi1"))
    sayi2 = data.get("sayi2")

    sonuc = service.calculate(islem, sayi1, float(sayi2) if sayi2 else None)

    kayit = {
        "islem": islem,
        "sayi1": sayi1,
        "sayi2": float(sayi2) if sayi2 is not None else None,
        "sonuc": sonuc,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    history.append(kayit)

    return jsonify({"sonuc": sonuc})


@app.route('/api/gecmis', methods=['GET'])
def gecmis():
    """
    Yapılan tüm işlemlerin geçmişini döner.
    """
    return jsonify(history)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
