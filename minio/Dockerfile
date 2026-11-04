# Build the pinned community source rather than depend on discontinued images.
FROM golang:1.25-bookworm AS builder
ARG MINIO_VERSION=RELEASE.2025-10-15T17-29-55Z
ENV CGO_ENABLED=0
RUN go install github.com/minio/minio@${MINIO_VERSION} && \
    cp /go/pkg/mod/github.com/minio/minio@*/LICENSE /tmp/MINIO-LICENSE

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --gid 10001 minio && useradd --uid 10001 --gid minio --no-create-home minio && \
    mkdir /data && chown minio:minio /data
COPY --from=builder /go/bin/minio /usr/local/bin/minio
COPY --from=builder /tmp/MINIO-LICENSE /usr/share/doc/minio/LICENSE
USER minio
EXPOSE 9000 9001
ENTRYPOINT ["minio"]
CMD ["server", "/data", "--console-address", ":9001"]
