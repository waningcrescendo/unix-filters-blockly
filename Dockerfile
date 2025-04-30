FROM node:18 AS builder
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

FROM node:18
WORKDIR /app

COPY backend ./backend

COPY --from=builder /app/frontend/dist ./backend/public

WORKDIR /app/backend
RUN npm install

CMD ["npm", "start"]