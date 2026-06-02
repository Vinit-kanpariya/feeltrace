FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
# All deps required: typescript + prisma are devDeps needed for the build step
RUN npm ci

# Install Chromium matching playwright-core@1.60.0
# playwright-core does not bundle a browser — install it explicitly to a predictable path
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx -y playwright@1.60.0 install chromium --with-deps

COPY . .
# prebuild: prisma generate; build: tsc; postbuild: copy generated prisma client
RUN npm run build

# Prune devDeps after build to reduce image size
RUN npm prune --omit=dev

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE $PORT

CMD ["node", "dist/index.js"]
