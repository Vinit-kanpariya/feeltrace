FROM mcr.microsoft.com/playwright/node:v1.60.0-noble

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source and run build
COPY . .
RUN npm run build

# Railway injects PORT at runtime; default 3000 for local dev
ENV PORT=3000
ENV NODE_ENV=production
# Tell playwright-core where Chromium binary lives in this image
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE $PORT

# Run as non-root user (pwuser is created by the official image)
# Running as root disables the Chromium sandbox — use pwuser for security
# Do NOT add --no-sandbox when running as pwuser (Pitfall 1)
USER pwuser

CMD ["node", "dist/index.js"]
