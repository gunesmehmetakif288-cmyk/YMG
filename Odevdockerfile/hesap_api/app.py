from flask import Flask, request, jsonify
from flasgger import Swagger
from calculator_service import CalculatorService

app = Flask(__name__)
swagger = Swagger(app)

service = CalculatorService()

@app.route('/api/hesapla', methods=['POST'])
def hesapla():
    data = request.get_json()
    islem = data.get("islem")
    sayi1 = float(data.get("sayi1"))
    sayi2 = data.get("sayi2")

    sonuc = service.calculate(islem, sayi1, float(sayi2) if sayi2 else None)
    return jsonify({"sonuc": sonuc})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
