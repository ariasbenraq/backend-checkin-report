# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instala deps
COPY package*.json ./
RUN npm ci

# Copia el código y compila Nest (a dist/)
COPY . .
# Si usas Prisma, descomenta:
# RUN npx prisma generate
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copia artefactos de build
COPY --from=build /app/dist ./dist
# Si usas Prisma, descomenta:
# COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
# COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Healthcheck simple (requiere GET /health)
HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD wget -qO- http://localhost:3000/health >/dev/null || exit 1

CMD ["node","dist/main.js"]

