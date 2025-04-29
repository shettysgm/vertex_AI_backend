
#!/bin/bash

# Default to localhost if no parameter provided
BACKEND_URL=${1:-"http://localhost:8080"}

echo "Checking backend health at: $BACKEND_URL/health"
curl -s $BACKEND_URL/health
echo ""

echo "Testing connection..."
if curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health | grep -q "200"; then
  echo "✅ Backend is online and responding properly!"
else
  echo "❌ Backend seems to be offline or not responding correctly."
  echo "Error details:"
  curl -s -v $BACKEND_URL/health 2>&1 | grep -E "Failed|Error"
fi
