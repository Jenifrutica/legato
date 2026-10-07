#!/usr/bin/env bash
# Despliegue de Legato a S3 + CloudFront.
# Uso:  ./scripts/deploy.sh
# Requisitos: AWS CLI configurado (usuario con S3 + CloudFront + ACM) y bun.
set -euo pipefail

DOMAIN="legato.jenilarper.dev"
BUCKET="legato-jenilarper"
DISTRIBUTION_ID="E9MLZCEKQU3MI"
REGION="us-east-1"

export AWS_DEFAULT_REGION="$REGION"

echo "==> Build (redirect de Spotify -> https://$DOMAIN)"
VITE_SPOTIFY_REDIRECT_URI="https://$DOMAIN" "${BUN:-$HOME/.bun/bin/bun}" run build

echo "==> Subir a S3 (s3://$BUCKET)"
aws s3 sync dist "s3://$BUCKET" --delete

echo "==> Invalidar CloudFront ($DISTRIBUTION_ID)"
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" \
  --query 'Invalidation.Status' --output text

echo "==> Listo: https://$DOMAIN"
