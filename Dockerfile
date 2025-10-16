# Produkční Dockerfile pro Railway
FROM node:18-alpine as frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.13-slim

# Nainstalovat PostgreSQL development tools pro psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Nastavit pracovní adresář
WORKDIR /app

# Kopírovat requirements a nainstalovat závislosti
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopírovat backend kód
COPY backend/ ./backend/

# Kopírovat buildnutý frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Nastavit environment proměnné
ENV PYTHONPATH=/app
ENV FLASK_APP=backend.app
ENV FLASK_ENV=production

# Exponovat port (Railway používá PORT proměnnou)
EXPOSE 8080

# Spustit aplikaci na portu z environment proměnné (Railway používá PORT)
CMD python -c "import os; from backend import create_app; app = create_app(); app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))"
