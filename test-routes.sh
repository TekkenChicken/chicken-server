#!/bin/sh

if hash docker-compose 2>/dev/null; then
    docker-compose rm -f db
    docker volume prune -f
    docker-compose up -d db
    docker-compose run --rm web npm run init
    docker-compose run --rm web npm run test-routes
else
    echo "Requires docker-compose to run the routing tests"
fi