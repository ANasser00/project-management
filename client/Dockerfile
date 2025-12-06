FROM oven/bun:1.1.13

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start", "--", "-H", "0.0.0.0"]