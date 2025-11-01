#!/bin/bash

# Script to test Selenium tests with CI-like Chrome options locally
# This helps reproduce CI failures in the local environment

set -e

echo "======================================"
echo "Testing with CI-like Chrome options"
echo "======================================"
echo ""

# Export environment variable to enable CI mode in tests
export CI=1

echo "Running tests with headless Chrome and CI flags..."
echo "This simulates the GitHub Actions environment"
echo ""

# Run the specific failing test
python manage.py test base.tests.test_interaction.InteractionTest.test_interaction --keepdb --verbosity=2

echo ""
echo "======================================"
echo "Test completed successfully!"
echo "======================================"
echo ""
echo "The test passed in CI mode (headless Chrome with all stability flags)."
echo "This means it should also pass in GitHub Actions."
echo ""
echo "Key differences in CI mode:"
echo "  - Headless Chrome with --headless=new"
echo "  - JavaScript alerts are skipped (they don't work reliably in headless)"
echo "  - Form error validation is done via URL checking instead"
echo ""
echo "Check screenshots/ directory if there were any failures."