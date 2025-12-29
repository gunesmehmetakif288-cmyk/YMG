FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 6000

CMD ["gunicorn", "-b", "0.0.0.0:6000", "client_app:app", "--workers", "2", "--threads", "4", "--timeout", "60"]
