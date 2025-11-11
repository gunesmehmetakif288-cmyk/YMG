from flask import Flask, request, jsonify
from calculator_service import CalculatorService

app = Flask(__name__)
service = CalculatorService()

@app.route('/api/hesapla', methods=['POST'])
def hesapla():
    try:
        data = request.get_json()
        sayi1 = float(data.get('sayi1'))
        sayi2 = data.get('sayi2')
        islem = data.get('islem')

        if islem is None or sayi1 is None:
            return jsonify({"hata": "Eksik parametre"}), 400

        if islem.lower() == "karekök":
            sonuc = service.calculate(islem, sayi1)
        else:
            if sayi2 is None:
                return jsonify({"hata": "Bu işlem için ikinci sayı gerekli"}), 400
            sonuc = service.calculate(islem, sayi1, float(sayi2))

        return jsonify({"sonuc": sonuc})

    except ValueError as e:
        return jsonify({"hata": str(e)}), 400
    except Exception as e:
        return jsonify({"hata": "Bilinmeyen hata: " + str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
