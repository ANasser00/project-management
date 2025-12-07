FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN bun run prisma generate
RUN bun run build

EXPOSE 8005

CMD ["bun", "run", "start"]