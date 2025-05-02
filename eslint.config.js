import globals from "globals";
import tsParser from "@typescript-eslint/parser";

import r3f from "@react-three/eslint-plugin";
import react from "eslint-plugin-react";
import ts from "@typescript-eslint/eslint-plugin";


import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"],
		languageOptions: {
			globals: globals.browser,
			parser: tsParser,
		},
		plugins: {
			"@react-three": r3f,
			"@typescript-eslint": ts,
			"react": react,
		},
		rules: {
			// Custom rules
			"indent": ["error", "tab"],
			"no-trailing-spaces": "error",
			"quotes": ["error", "double"],
			"semi": ["error", "always"],

			// React Specific
			"react/react-in-jsx-scope": "off",
		},
	},
]);