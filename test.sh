#!/bin/sh

if grep -q 'Amazing Project' 'README.md'; then
  echo 'pass'
fi
