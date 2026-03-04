# Build Stage
FROM rust:1-slim-bookworm as builder

WORKDIR /app


# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

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
FROM gcr.io/distroless/cc-debian12

WORKDIR /app

COPY --from=builder /app/target/release/examwrap-backend .

EXPOSE 8080

CMD ["./examwrap-backend"]
