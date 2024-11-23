#!/bin/bash

DIR="$(dirname "$0")"
"$DIR"/docker_build.sh && "$DIR"/docker_push.sh && "$DIR"/docker_deploy.sh
