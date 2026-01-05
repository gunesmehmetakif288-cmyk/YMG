# Hesap Makinesi - Docker Compose + PostgreSQL

Bu proje 4 servisten oluşur:

- **db**: PostgreSQL (kalıcı `db_data` volume)
- **hesap_api**: Hesaplama + geçmişi DB'ye yazma/okuma
- **client_api**: Gateway + JWT login + Hesap API proxy
- **frontend**: React/Vite UI

## Çalıştırma

```bash
docker compose up --build
```

Portlar:

- Frontend: http://localhost:5173
- Client API: http://localhost:8000
- Hesap API: http://localhost:5000
- Postgres: localhost:5432

## Hızlı test

1) Login (JWT al):

```bash
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"1234"}'
```

2) Hesapla:

```bash
curl -X POST http://localhost:8000/client/hesapla -H "Content-Type: application/json" -d '{"islem":"toplama","sayi1":5,"sayi2":3}'
```

3) Geçmiş (token ile):

```bash
curl http://localhost:8000/client/gecmis -H "Authorization: Bearer <TOKEN>"
```

4) DB kanıtı:

```bash
docker exec -it $(docker ps -qf "name=db") psql -U calc -d calcdb -c "SELECT * FROM calc_history ORDER BY id DESC LIMIT 5;"
```

## Notlar / Optimizasyonlar

- Compose içinde **`container_name` yok** → isim çakışması yaşamazsın.
- `hesap_api` DB init'i import-time değil, **lazy init** (Gunicorn uyumlu).
- `wait_for_db` hem `timeout_sec` hem `max_seconds` parametresini destekler.
- Frontend API URL'i `VITE_API_URL` ile yönetilir (`.env.example`).
