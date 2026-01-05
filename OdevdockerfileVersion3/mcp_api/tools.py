import requests

def toplama(a: float, b: float) -> float:
    return a + b

def cikarma(a: float, b: float) -> float:
    return a - b

def carpma(a: float, b: float) -> float:
    return a * b

def bolme(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Bölen sıfır olamaz")
    return a / b

def yuzde_hesapla(tutar: float, oran: float) -> float:
    return tutar * oran / 100

def ortalama(liste: list[float]) -> float:
    if not liste:
        raise ValueError("Liste boş olamaz")
    return sum(liste) / len(liste)

def doviz_cevir(tutar: float, from_cur: str, to_cur: str) -> float:
    url = "https://api.exchangerate.host/latest"
    response = requests.get(url, params={"base": from_cur}, timeout=5)
    response.raise_for_status()
    rates = response.json()["rates"]
    return tutar * rates[to_cur]
