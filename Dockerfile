# Stage 1: Build the React app
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && \
    npm install && \
    npm cache clean --force

COPY . .
RUN ROLLUP_WASM=1 npm run build && rm -rf node_modules

# Stage 2: Set up Python backend with Ollama
FROM python:3.12-slim AS runtime

WORKDIR /app

# Install curl and procps, run Ollama install, then clean up
RUN apt-get update && apt-get install -y --no-install-recommends curl procps && \
    curl -fsSL https://ollama.com/install.sh | sh && \
    apt-get purge -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

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

# Install Hypercorn for Quart
RUN pip install --no-cache-dir hypercorn

# Pre-pull nomic-embed-text during build and clean up
RUN ollama serve & sleep 10 && ollama pull nomic-embed-text && pkill ollama

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Optimized Hypercorn run command
CMD ["/bin/sh", "-c", "ollama serve & sleep 5 && exec hypercorn main:app --bind 0.0.0.0:${PORT:-8080} --workers 4 --keep-alive 120 --graceful-timeout 30 --access-log - --error-log -"]