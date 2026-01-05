from fastapi import FastAPI, HTTPException
from tools import *

app = FastAPI(title="MCP - Islem Servisi")

@app.get("/")
def root():
    return {"status": "MCP İşlem Servisi Aktif"}

@app.get("/tool/topla")
def topla(a: float, b: float):
    return {"sonuc": toplama(a, b)}

@app.get("/tool/cikar")
def cikar(a: float, b: float):
    return {"sonuc": cikarma(a, b)}

@app.get("/tool/carp")
def carp(a: float, b: float):
    return {"sonuc": carpma(a, b)}

@app.get("/tool/bol")
def bol(a: float, b: float):
    try:
        return {"sonuc": bolme(a, b)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/tool/ortalama")
def ort(liste: list[float]):
    try:
        return {"sonuc": ortalama(liste)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/tool/yuzde")
def yuzde(tutar: float, oran: float):
    return {"sonuc": yuzde_hesapla(tutar, oran)}

@app.get("/tool/doviz")
def doviz(tutar: float, from_cur: str, to_cur: str):
    try:
        return {"sonuc": doviz_cevir(tutar, from_cur, to_cur)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
