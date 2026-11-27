FROM ghcr.io/social-mail/postgres-with-backups:latest

ENV POSTGRES_PASSWORD=kosh123

ENV CLOUD_KOSH_DB_DATABASE=cloudkosh
ENV CLOUD_KOSH_DB_HOST=/var/run/postgresql
ENV CLOUD_KOSH_DB_PORT=5432
ENV CLOUD_KOSH_DB_USER=postgres
ENV CLOUD_KOSH_DB_PASSWORD=kosh123
ENV CLOUD_KOSH_ADMIN_EMAIL=admin@admin
ENV APP_HOST=v2025-test.800casting.com
ENV NODE_APP=/app/index.js

VOLUME /data
VOLUME /cache
WORKDIR /app


ENV HOST=0.0.0.0
ENV SELF_HOST=true

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm install --omit=dev --cache /root/.npm --prefer-offline

COPY index.js ./
COPY content ./content

COPY src ./src
COPY dist ./dist
COPY dev.js ./
