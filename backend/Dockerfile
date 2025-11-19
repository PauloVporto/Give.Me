FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# List directory to debug
RUN ls -la /app && echo "Checking for manage.py:" && ls -la /app/manage.py || echo "manage.py not found"

RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8000

# Use shell form to ensure proper execution context
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120