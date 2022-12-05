module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": ["./tsconfig.json"],
        "sourceType": "module"
    },
    "plugins": [
        "eslint-plugin-import",
        "@typescript-eslint"
    ],
    "root": true,
    "rules": {
        "@typescript-eslint/no-floating-promises": "error",
        "import/no-deprecated": "warn",
        "no-duplicate-case": "error",
        "no-duplicate-imports": "error",
        "no-magic-numbers": ["warn", {ignore: [-1, 0, 1, 2, 3]}],
        "prefer-const": "warn"
    }
};
