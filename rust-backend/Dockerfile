# Build Stage
FROM rust:1.80-slim-bookworm as builder

WORKDIR /app

# Copy manifest and build dependencies to cache
COPY Cargo.toml .
# Create dummy main to build deps
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Copy source code
COPY . .
# Touch main.rs to force rebuild
RUN touch src/main.rs
RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies (OpenSSL is crucial)
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/examwrap-backend .
COPY --from=builder /app/.env .

EXPOSE 8080

CMD ["./examwrap-backend"]
