#!/bin/bash
# Install Local Fonts for GDPR Compliance
# This script downloads and sets up locally hosted fonts
# to replace external font services (Google Fonts, Entypo, etc.)
#
# NOTE: These fonts are open source (Roboto: Apache 2.0, Entypo: OFL)
# and are already committed to the repository.
# This script is for DEVELOPERS who need to update the font files
# when new versions are released.
#
# Normal deployments verify fonts exist but don't download them.

set -e  # Exit on error

echo "========================================="
echo "Setting up local fonts for GDPR compliance"
echo "========================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATIC_LIB_DIR="$SCRIPT_DIR/config/static-lib"
FONTS_DIR="$STATIC_LIB_DIR/lib/fonts"

echo "Project directory: $SCRIPT_DIR"
echo "Fonts directory: $FONTS_DIR"
echo ""

# Create font directories
echo "Creating font directories..."
mkdir -p "$FONTS_DIR/roboto"
mkdir -p "$FONTS_DIR/entypo"
echo "Done."
echo ""

# Download Roboto font (Regular 400)
echo "Downloading Roboto font (Regular)..."
ROBOTO_FILE="$FONTS_DIR/roboto/Roboto-Regular.ttf"

if [ ! -f "$ROBOTO_FILE" ]; then
    echo "  Fetching from Google Fonts CDN..."
    curl -L -o "$ROBOTO_FILE" \
        "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.ttf"
    echo "  Downloaded: Roboto-Regular.ttf"
else
    echo "  Already exists, skipping download."
fi
echo ""

# Download Entypo font
echo "Downloading Entypo icon font..."
ENTYPO_TTF="$FONTS_DIR/entypo/entypo.ttf"
ENTYPO_WOFF="$FONTS_DIR/entypo/entypo.woff"

if [ ! -f "$ENTYPO_TTF" ]; then
    echo "  Fetching from GitHub (danielbruce/Entypo)..."
    curl -L -o "$ENTYPO_TTF" \
        "https://raw.githubusercontent.com/danielbruce/Entypo/master/font/entypo.ttf"
    echo "  Downloaded: entypo.ttf"
else
    echo "  entypo.ttf already exists, skipping."
fi

if [ ! -f "$ENTYPO_WOFF" ]; then
    curl -L -o "$ENTYPO_WOFF" \
        "https://raw.githubusercontent.com/danielbruce/Entypo/master/font/entypo.woff"
    echo "  Downloaded: entypo.woff"
else
    echo "  entypo.woff already exists, skipping."
fi
echo ""

# Create Roboto CSS file
echo "Creating Roboto CSS file..."
cat > "$FONTS_DIR/roboto/roboto.css" << 'EOF'
/**
 * Roboto Font - Locally Hosted
 * GDPR Compliant - No external requests
 * Original: https://fonts.google.com/specimen/Roboto
 */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-stretch: normal;
  src: url('Roboto-Regular.ttf') format('truetype');
  font-display: swap;
}
EOF
echo "  Created: $FONTS_DIR/roboto/roboto.css"
echo ""

# Create Entypo CSS file
echo "Creating Entypo CSS file..."
cat > "$FONTS_DIR/entypo/entypo.css" << 'EOF'
/**
 * Entypo Icon Font - Locally Hosted
 * GDPR Compliant - No external requests
 * Original: http://weloveiconfonts.com/api/?family=entypo
 * Source: https://github.com/danielbruce/Entypo
 */

@font-face {
  font-family: 'entypo';
  src: url('entypo.woff') format('woff'),
       url('entypo.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Base icon styles */
[class*="entypo-"]:before {
  font-family: 'entypo', sans-serif;
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF
echo "  Created: $FONTS_DIR/entypo/entypo.css"
echo ""

# Verify installation
echo "========================================="
echo "Verifying installation..."
echo "========================================="

if [ -f "$FONTS_DIR/roboto/Roboto-Regular.ttf" ] && \
   [ -f "$FONTS_DIR/roboto/roboto.css" ] && \
   [ -f "$FONTS_DIR/entypo/entypo.ttf" ] && \
   [ -f "$FONTS_DIR/entypo/entypo.css" ]; then
    echo "✓ All font files installed successfully!"
    echo ""
    echo "Font files:"
    ls -lh "$FONTS_DIR/roboto/"
    ls -lh "$FONTS_DIR/entypo/"
    echo ""
    echo "Next steps:"
    echo "  1. Make sure your CSS files reference local fonts:"
    echo "     @import url(../../config/static-lib/lib/fonts/entypo/entypo.css);"
    echo "     @import url(../../config/static-lib/lib/fonts/roboto/roboto.css);"
    echo ""
    echo "  2. The login.css has already been updated."
    echo "  3. No external font requests will be made - GDPR compliant!"
else
    echo "✗ Some files are missing. Please check the errors above."
    exit 1
fi

echo ""
echo "========================================="
echo "Setup complete!"
echo "========================================="
