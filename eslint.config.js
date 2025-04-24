import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default [
	{
		files: ["**/*.{js,mjs,cjs,ts}"]
	},
	{
		languageOptions: { 
			globals: globals.browser 
		}
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: [
			react
		],
		extends: ["esling:all", "plugin:react/recommended"],
		rules: {
			// Always semis
			"semi": ["error", "always"],
			// Always double quotes
			"quotes": ["error", "double"],
			// Tab indentation
			"indent": ["error", "tab"],
		}
	}
];