from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

HESAP_API_HESAPLA_URL = "http://hesap_api:5000/api/hesapla"
HESAP_API_GECMIS_URL = "http://hesap_api:5000/api/gecmis" 


@app.route("/client/hesapla", methods=["POST"])
def hesapla():
    data = request.get_json()

    try:
        response = requests.post(HESAP_API_HESAPLA_URL, json=data)
        return jsonify({
            "giden": data,
            "cevap": response.json()
        })

    except Exception as e:
        return jsonify({"hata": str(e)}), 500


@app.route("/client/gecmis", methods=["GET"])
def gecmis():
    """
    Hesap API'dan işlem geçmişini alıp frontend'e iletir.
    """
    try:
        response = requests.get(HESAP_API_GECMIS_URL)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"hata": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)
