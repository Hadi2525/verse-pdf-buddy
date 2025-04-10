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

# Stage 2: Set up Python backend
FROM python:3.12-slim AS runtime

WORKDIR /app

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

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run Uvicorn directly
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4", "--timeout-keep-alive", "120"]