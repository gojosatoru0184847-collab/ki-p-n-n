// Compatibility shim (old build). New build uses app/src/main/assets/game/main.js
console.warn("engine.js is deprecated. Loading modular game...");
import("./game/main.js");
