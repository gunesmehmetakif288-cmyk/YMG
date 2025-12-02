# 3 Servisli Dockerize Proje (Flask + Flask Client + React)

Bu proje 3 servisten oluşur:

- Hesap API (Flask)
- Client API (Flask → Hesap API’yı çağırır)
- Frontend (React + Vite → Client API’yı çağırır)

## 🧰 Docker Build Örneği
(Ödevin gereği tek satır build örneği)

## ✨ Yeni Özellik: İşlem Geçmişi

- Her yapılan hesaplama `Hesap API` içinde bellekte saklanır.
- `/api/gecmis` endpoint'i ile geçmiş JSON olarak döner.
- `Client API` üzerinden `/client/gecmis` ile frontend bu veriyi alır.
- Frontend, sonuç alanının altında "İşlem Geçmişi" tablosu olarak gösterir.
