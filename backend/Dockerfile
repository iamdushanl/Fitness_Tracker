# Starter Dockerfile — adjust to match the backend you choose in ARCH.md.
# This example assumes a Python (FastAPI) app. Swap for Node if that's your pick.

FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (better build caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# The port your app listens on (keep in sync with .env PORT)
EXPOSE 8000

# A health check helps AWS know the container is alive (you'll add /health in your API)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)" || exit 1

# Start command — change to match your framework
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
