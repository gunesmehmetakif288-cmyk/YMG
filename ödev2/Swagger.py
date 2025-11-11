from flask import Flask, request, jsonify
from flasgger import Swagger
from calculator_service import CalculatorService

app = Flask(__name__)
swagger = Swagger(app)
service = CalculatorService()

@app.route('/api/hesapla', methods=['POST'])
def hesapla():
    """
    Hesaplama Servisi
    ---
    tags:
      - Hesap Makinesi
    description: |
      Bu servis toplama, çıkarma, çarpma, bölme, üs alma ve karekök alma işlemlerini yapar.
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            sayi1:
              type: number
              example: 9
            sayi2:
              type: number
              example: 3
            islem:
              type: string
              example: "üs"
    responses:
      200:
        description: Başarılı işlem sonucu döndürülür
        schema:
          type: object
          properties:
            sonuc:
              type: number
              example: 729.0
      400:
        description: Geçersiz giriş veya eksik parametre
      500:
        description: Sunucu hatası
    """
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
