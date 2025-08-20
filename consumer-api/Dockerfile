FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# --- THE KEY CHANGES ARE HERE ---
# Copy package.json AND yarn.lock
COPY package.json yarn.lock ./

# Use 'yarn install' with the --frozen-lockfile flag
RUN yarn install --frozen-lockfile
# -----------------------------

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]