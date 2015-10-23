#!/bin/bash

set -e

MAIN_BRANCH='shadow'
TARGET_BRANCH='gh-pages'

git checkout $TARGET_BRANCH
git reset --hard $MAIN_BRANCH
jspm install
git add -f jspm_packages
git commit -m 'add deps'
git push -f
git checkout $MAIN_BRANCH
