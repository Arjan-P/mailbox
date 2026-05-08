#! /bin/bash

sudo docker exec -it fastify-app-db-1 psql -U postgres -d mailbox_db
