go build -o build/main src/*.go

emcc -O3 --bind dependencies/ke/src//ke.cpp dependencies/ke/src/bindings.cpp -o src/templates/ke_wasm.js -s ENVIRONMENT='web'
