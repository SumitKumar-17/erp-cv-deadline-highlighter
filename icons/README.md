# Extension Icons

This directory contains the properly sized icon files for the ERP CV Deadline Highlighter extension:
- icon16.png (16x16 pixels) - Toolbar icon
- icon32.png (32x32 pixels) - Windows/Mac menu icon
- icon48.png (48x48 pixels) - Extension management page
- icon128.png (128x128 pixels) - Chrome Web Store and installation

## Generation
All icons are automatically generated from the main `logo.png` file using ImageMagick:
```bash
magick logo.png -resize 16x16 icons/icon16.png
magick logo.png -resize 32x32 icons/icon32.png
magick logo.png -resize 48x48 icons/icon48.png
magick logo.png -resize 128x128 icons/icon128.png
```

## Usage
These icons are referenced in `manifest.json` and provide optimal display quality across different Chrome UI contexts.

The icons should be professional and clearly represent the extension's purpose.
