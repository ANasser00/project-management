FROM oven/bun:1.1.13

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN bun run prisma generate
RUN bun run build

EXPOSE 8000

CMD ["bun", "run", "start"]