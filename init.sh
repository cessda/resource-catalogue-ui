#!/bin/bash

envsubst '${API_BASE_URL}' < /etc/nginx/nginx.conf.tmpl > /etc/nginx/nginx.conf &&

nginx -t
nginx -g "daemon off;"
