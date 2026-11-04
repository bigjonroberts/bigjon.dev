#!/bin/bash

# Script to shut down Eleventy server processes

echo "Shutting down Eleventy server processes..."

# Find and kill all Eleventy processes
pkill -f "eleventy --serve"

# Check if any processes were killed
if [ $? -eq 0 ]; then
  echo "Eleventy server processes have been shut down."
else
  echo "No running Eleventy server processes found."
fi
