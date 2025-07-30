import withNuxt from './.playground/.nuxt/eslint.config.mjs';

export default withNuxt(
    {
        rules: {
            "max-lines-per-function": ["error", { max: 500, skipBlankLines: true, skipComments: true }],
        }
    },
    {
        ignores: ["composables/**"],
        rules: {
            "max-lines-per-function": ["error", { max: 75, skipBlankLines: true, skipComments: true }],
        }
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
        rules: {
            "semi-style": [
                "error",
                "last"
            ],

            // Semicolon rules - choose one approach:
            // Option 1: Require semicolons only where needed (not after function blocks)
            "semi": ["error", "always", {
                "omitLastInOneLineBlock": true,
            }],

            // Option 2: If you prefer NO semicolons at all:
            // "semi": ["error", "never"],

            // This prevents extra semicolons where they're not needed
            "no-extra-semi": "error",

            // MISSING: Trailing comma rules
            "comma-dangle": ["error", "always-multiline"],

            // MISSING: Object/Array spacing
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "computed-property-spacing": ["error", "never"],

            // Indentation rules
            "indent": ["error", 4, { 
                "SwitchCase": 1,
                "VariableDeclarator": 1,
                "outerIIFEBody": 1,
                "MemberExpression": 1,
                "FunctionDeclaration": { "parameters": 1, "body": 1 },
                "FunctionExpression": { "parameters": 1, "body": 1 },
                "CallExpression": { "arguments": 1 },
                "ArrayExpression": 1,
                "ObjectExpression": 1,
                "ImportDeclaration": 1,
                "flatTernaryExpressions": false,
                "ignoreComments": false,
                "ignoredNodes": [
                    "JSXElement",
                    "JSXElement > *",
                    "JSXAttribute",
                    "JSXIdentifier",
                    "JSXNamespacedName",
                    "JSXMemberExpression",
                    "JSXSpreadAttribute",
                    "JSXExpressionContainer",
                    "JSXOpeningElement",
                    "JSXClosingElement",
                    "JSXFragment",
                    "JSXOpeningFragment",
                    "JSXClosingFragment",
                    "JSXText",
                    "JSXEmptyExpression",
                    "JSXSpreadChild"
                ]
            }],

            // MISSING: Space around operators and keywords
            "space-before-blocks": "error",
            "space-before-function-paren": ["error", {
                "anonymous": "always",
                "named": "never",
                "asyncArrow": "always"
            }],
            "space-in-parens": ["error", "never"],
            "space-infix-ops": "error",
            "keyword-spacing": ["error", { "before": true, "after": true }],

            // MISSING: Line break rules
            "eol-last": ["error", "always"],
            "no-trailing-spaces": "error",

            // MISSING: Variable declaration rules
            "one-var": ["error", "never"],
            "prefer-const": "error",
            "no-var": "error",

            "arrow-spacing": ["error", { "before": true, "after": true }],
            "prefer-arrow-callback": "error",

            "no-duplicate-imports": "error",

            "no-undef": "error",
            "no-unreachable": "error",
            "no-duplicate-case": "error",
            "no-empty": ["error", { "allowEmptyCatch": true }],
            "no-func-assign": "error",
            "no-inner-declarations": "error",
            "no-invalid-regexp": "error",
            "no-irregular-whitespace": "error",
            "no-obj-calls": "error",
            "no-sparse-arrays": "error",
            "use-isnan": "error",
            "valid-typeof": "error",

            // MISSING: Best practices
            "curly": ["error", "all"],
            "default-case": "error",
            "dot-notation": "error",
            // "eqeqeq": ["error", "always"],
            "no-alert": "warn",
            "no-caller": "error",
            "no-case-declarations": "error",
            "no-empty-pattern": "error",
            "no-eval": "error",
            "no-extend-native": "error",
            "no-extra-bind": "error",
            "no-fallthrough": "error",
            "no-floating-decimal": "error",
            "no-global-assign": "error",
            "no-implied-eval": "error",
            "no-iterator": "error",
            "no-labels": "error",
            "no-lone-blocks": "error",
            "no-loop-func": "error",
            "no-multi-spaces": "error",
            "no-multi-str": "error",
            "no-new": "error",
            "no-new-func": "error",
            "no-new-wrappers": "error",
            "no-octal": "error",
            "no-octal-escape": "error",
            "no-redeclare": "error",

            "no-return-assign": ["error", "always"],
            "arrow-body-style": ["error", "as-needed"],

            "no-script-url": "error",
            "no-self-assign": "error",
            "no-self-compare": "error",
            "no-sequences": "error",
            "no-throw-literal": "error",
            "no-unmodified-loop-condition": "error",
            "no-unused-expressions": "error",
            "no-useless-call": "error",
            "no-useless-concat": "error",
            "no-useless-escape": "error",
            "no-void": "error",
            "no-with": "error",
            // TODO: Check if this is needed
            // "radix": "error",
            "wrap-iife": ["error", "any"],
            "yoda": "error",

            // MISSING: TypeScript specific rules
            // "@typescript-eslint/no-unused-vars": ["error", {
            //    "vars": "all",
            //    "args": "after-used",
            //    "ignoreRestSiblings": true,
            //    "varsIgnorePattern": "^_",
            //    "argsIgnorePattern": "^_",
            //    // "enums": "all",
            //    // "enumsIgnorePattern": "^_"
            // }],
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            // "@typescript-eslint/prefer-nullish-coalescing": "warn",
            // "@typescript-eslint/prefer-optional-chain": "warn",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/ban-ts-comment": ["error", {
                "ts-expect-error": "allow-with-description",
                "ts-ignore": false,
                "ts-nocheck": false,
                "ts-check": false
            }],
            "@typescript-eslint/no-invalid-void-type": "off",

            // Overriding vue rules.
            "vue/no-v-html": "off",
            "vue/html-indent": "off",
            "vue/html-closing-bracket-newline": [
                "error",
                {
                    "singleline": "never",
                    "multiline": "never"
                }
            ],
            "vue/multiline-html-element-content-newline": [
                "error",
                {
                    "ignoreWhenEmpty": true,
                    "allowEmptyLines": true
                }
            ],
            "vue/first-attribute-linebreak": "off",
            "vue/max-attributes-per-line": "off",
            "vue/max-len": [
                "error",
                {
                    "code": 180,
                    "template": 180,
                    "comments": 180,
                    "ignorePattern": "",
                    "ignoreComments": false,
                    "ignoreTrailingComments": false,
                    "ignoreUrls": true,
                    "ignoreStrings": false,
                    "ignoreTemplateLiterals": false,
                    "ignoreRegExpLiterals": false,
                    "ignoreHTMLAttributeValues": true,
                    "ignoreHTMLTextContents": true
                }
            ],
            "vue/no-reserved-component-names": [
                "error",
                {
                    "disallowVueBuiltInComponents": false,
                    "disallowVue3BuiltInComponents": false
                }
            ],
            "vue/component-name-in-template-casing": [
                "error",
                "kebab-case"
            ],
            "vue/component-definition-name-casing": [
                "error",
                "PascalCase"
            ],

            "vue/no-unused-components": "error",
            "vue/no-unused-vars": "error",
            "vue/require-v-for-key": "error",
            "vue/no-use-v-if-with-v-for": "error",
            "vue/require-prop-types": "error",
            "vue/require-default-prop": "error",

            // Non vue rules
            // 'no-console': 'warn',
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-extraneous-class": "off",
            "@typescript-eslint/no-empty-object-type": "off",

            "no-multiple-empty-lines": [
                "error",
                {
                    "max": 1,
                    "maxEOF": 0,
                    "maxBOF": 0,
                }
            ],

            // Max Statements define maximum number of statements in a function.
            "max-statements": [
                "error",
                50
            ],
            // Max parameters in a function.
            "max-params": [
                "error",
                5
            ],
            "quotes": [
                "error",
                "double"
            ],
            "padded-blocks": [
                "error",
                "always"
            ],
            "func-style": [
                "error",
                "expression",
                {
                    // Allows only arrow functions in the code.
                    "allowArrowFunctions": true
                }
            ],
            "no-else-return": "error",
            "padding-line-between-statements": [
                "warn",
                {
                    "blankLine": "always",
                    "prev": "*",
                    "next": [
                        "block",
                        "block-like",
                        // "break",
                        "case",
                        "class",
                        "const",
                        "continue",
                        "debugger",
                        "default",
                        "do",
                        "export",
                        "for",
                        "function",
                        "if",
                        "let",
                        "return",
                        "switch",
                        "throw",
                        "try",
                        "var",
                        "while",
                        "with",
                    ],
                },
                {
                    "blankLine": "always",
                    "prev": [
                        "block",
                        "block-like",
                        // "break",
                        "case",
                        "class",
                        "const",
                        "continue",
                        "debugger",
                        "default",
                        "do",
                        "export",
                        "for",
                        "function",
                        "if",
                        "let",
                        "return",
                        "switch",
                        "throw",
                        "try",
                        "var",
                        "while",
                        "with"
                    ],
                    "next": "*",
                },
            ],
        }
    },
);
