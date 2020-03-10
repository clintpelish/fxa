#!/bin/bash -e

DIR=$(dirname "$0")

if [[ ! $CIRCLE_BRANCH =~ ^train-.* ]]; then
  # train PRs should be excluded from this check
  exit 0
fi

if grep -e 'fxa-email-service' $DIR/../packages/test.list; then
  if [[ ! $CIRCLE_BRANCH =~ ^email-service-.* ]]; then
    echo "Please create a new PR from a branch name starting with 'email-service-'"
    exit 1
  fi
fi
if grep -e 'fxa-circleci' $DIR/../packages/test.list; then
  if [[ ! $CIRCLE_BRANCH =~ ^fxa-circleci-.* ]]; then
    echo "Please create a new PR from a branch name starting with 'fxa-circleci-'"
    exit 1
  fi
fi
