#!/bin/bash

echo "▶️  Running the producer to send sample data..."

docker compose run --rm producer-cli npm run command:prod -- send:xray

echo "✅ Producer has finished."