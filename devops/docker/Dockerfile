ARG GO_VERSION=1.23-alpine

FROM golang:${GO_VERSION} AS builder
WORKDIR /sources
ADD go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -mod=readonly -v -o app main.go

FROM gcr.io/distroless/static:nonroot AS base
COPY --from=builder /sources/app /
USER nonroot:nonroot
CMD ["/app"]

FROM base AS final
