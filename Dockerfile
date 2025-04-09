# Stage 1: Build the React app
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && \
    npm install -g npm && \
    npm install && \
    npm install vite --save-dev && \
    npm cache clean --force

COPY . .
RUN chmod +x node_modules/.bin/vite && \
    ROLLUP_WASM=1 npm run build && \
    rm -rf node_modules

# Stage 2: Set up Python backend with Ollama
FROM python:3.12-slim AS runtime

WORKDIR /app

# Install curl and procps
RUN apt-get update && apt-get install -y --no-install-recommends curl procps && \
    rm -rf /var/lib/apt/lists/*

# Manually install Ollama for amd64
RUN curl -L -o /usr/local/bin/ollama https://github.com/ollama/ollama/releases/download/v0.1.32/ollama-linux-amd64 && \
    chmod +x /usr/local/bin/ollama

# Copy backend code
COPY backend/ /app/backend/

# Create static directory and copy React build output
RUN mkdir -p /app/backend/static
COPY --from=build /app/dist/ /app/backend/static/

# Set working directory to backend
WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir .

# Pre-pull nomic-embed-text during build with explicit steps
RUN ollama serve & \
    sleep 10 && \
    ollama pull nomic-embed-text || (echo "Failed to pull nomic-embed-text" && exit 1); \
    pkill ollama || true

# Clean up curl and unnecessary packages
RUN apt-get purge -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Optimized Uvicorn run command for FastAPI
CMD ["/bin/sh", "-c", "ollama serve & sleep 5 && exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 4 --timeout-keep-alive 120"]