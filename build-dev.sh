set NODE_ENV=development

#Love this. Exit with error when any command fails. This works well in VSCode's problems window.
set -e

echo ...copy files
mkdir -p dist
cp -u -r ./testdata ./dist/testdata
cp -u ./src/index.html ./dist/index.html 
cp -u ./src/preload.js ./dist/preload.js 
cp -u ./src/require.js ./dist/require.js 
echo ...compile
webpack --config ./webpack.config.js --mode development 