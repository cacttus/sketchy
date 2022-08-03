
echo ..compiling
npx webpack --mode=production --config=./webpack.config.js
echo ..running electron-builder
npx electron-builder
pause
