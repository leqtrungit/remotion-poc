FROM node:22-bookworm-slim

# Install necessary dependencies for Chromium / Puppeteer
# Remotion depends on these graphic and font packages to render headlessly on Linux
RUN apt-get update && apt-get install -y \
    libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 \
    libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 \
    libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 \
    libcups2 fonts-noto-color-emoji fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Ensure the Chromium browser binary is fully downloaded for Remotion
RUN npm install -g @remotion/cli
RUN remotion browser ensure

# We will mount the 'out' folder locally via docker-compose
RUN mkdir -p out

EXPOSE 3000

# Run the typescript server file
CMD ["npx", "tsx", "server.ts"]
