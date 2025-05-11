# syntax=docker/dockerfile:1

FROM golang:1.24 AS build-stage

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY src/*.go ./

ARG VERSION=dev

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-X main.Version=${VERSION}" -o /soil_monitoring_server ./src

FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=build-stage /soil_monitoring_server /soil_monitoring_server

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/soil_monitoring_server"]
