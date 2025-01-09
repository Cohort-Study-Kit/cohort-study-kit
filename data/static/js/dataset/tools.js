//import { parse } from "@babel/parser"
import { parse } from "acorn"
import { walk } from "estree-walker"
import he from "he"

const BUILTINS = {
  Math: [
    "abs",
    "acos",
    "acosh",
    "asin",
    "asinh",
    "atan",
    "atanh",
    "atan2",
    "ceil",
    "cbrt",
    "expm1",
    "clz32",
    "cos",
    "cosh",
    "exp",
    "floor",
    "fround",
    "log",
    "log1p",
    "log10",
    "log2",
    "max",
    "min",
    "pow",
    "random",
    "round",
    "sign",
    "sin",
    "sinh",
    "sqrt",
    "tan",
    "tanh",
    "trunc",
  ],
  Number: [
    "isFinite",
    "isInteger",
    "isSafeInteger",
    "parseFloat",
    "parseInt",
    "EPSILON",
    "MAX_SAFE_INTEGER",
    "MAX_VALUE",
    "MIN_SAFE_INTEGER",
    "MIN_VALUE",
    "NEGATIVE_INFINITY",
    "NaN",
    "POSITIVE_INFINITY",
    "prototype",
  ],
  String: ["fromCharCode", "fromCodePoint", "raw"],
  Array: ["from", "isArray", "of"],
  Object: [
    "assign",
    "create",
    "defineProperties",
    "defineProperty",
    "entries",
    "freeze",
    "getOwnPropertyDescriptor",
    "getOwnPropertyDescriptors",
    "getOwnPropertyNames",
    "getOwnPropertySymbols",
    "getPrototypeOf",
    "is",
    "isExtensible",
    "isFrozen",
    "isSealed",
    "keys",
    "preventExtensions",
    "seal",
    "setPrototypeOf",
    "values",
  ],
  parseInt: true,
  isNaN: true,
  parseFloat: true,
}

export const countPreviousSiblings = (element) => {
  let count = 0
  while (element.previousElementSibling) {
    count++
    element = element.previousElementSibling
  }
  return count
}

export const getAvailableVariableNames = (
  properties,
  columns,
  externalValues,
) => {
  if (properties && Object.keys(properties).length) {
    // Use data schema
    return Object.keys(properties)
      .concat(
        externalValues.map((externalValue) =>
          renderExternalValueName(externalValue),
        ),
      )
      .toSorted()
  } else {
    // Use columns
    return columns
      .map((column) => column[0])
      .concat(
        externalValues.map((externalValue) =>
          renderExternalValueName(externalValue),
        ),
      )
      .toSorted()
  }
}

export const evaluateConditions = (
  propertyData,
  columnData,
  externalValues,
  conditions,
) => {
  return conditions
    .map((condition) => {
      return evaluateCode(
        propertyData,
        columnData,
        externalValues,
        condition.variables,
        condition.code,
      )
    })
    .every((result) => result)
}

export const formatDate = (date) => {
  if (!date) {
    return " "
  }
  return `${date.slice(8, 10)}-${date.slice(5, 7)}-${date.slice(0, 4)}`
}

export const checkUserCode = (
  properties,
  columns,
  externalValues,
  userCode,
) => {
  const availableVariables = getAvailableVariableNames(
    properties,
    columns,
    externalValues,
  )

  const javaScriptAnalysis = validateJavascript(userCode, availableVariables)

  if (!javaScriptAnalysis.validSyntax) {
    console.warn(
      "Syntax error in user code.: ",
      javaScriptAnalysis.errorMessage,
    )
    return false
  }

  if (javaScriptAnalysis.undeclaredVariables.length) {
    console.warn(
      "Undeclared variables in user code: ",
      javaScriptAnalysis.undeclaredVariables,
    )
    return false
  }

  return true
}

export const validateJavascript = (code, declaredVariables) => {
  // Level 1: Check for basic syntax errors
  try {
    new Function(code) // Attempt to create a function from the code
  } catch (error) {
    return { validSyntax: false, errorMessage: error.message }
  }

  // Level 2: Check for undeclared variables
  const undeclaredVariables = []
  const functionScopes = []
  let currentScope = declaredVariables.slice()

  // Parse the code using an AST parser
  const ast = parse(code, { ecmaVersion: 2023 })

  function traverseAST(node) {
    walk(node, {
      enter(node) {
        switch (node.type) {
          case "VariableDeclaration": {
            const name = node.declarations[0].id.name
            // Check if already declared in current or outer scopes
            if (currentScope.includes(name)) {
              console.warn(`Variable '${name}' is declared multiple times.`)
            } else {
              currentScope.push(name)
            }
            break
          }
          case "ArrowFunctionExpression":
          case "FunctionDeclaration": {
            functionScopes.push(currentScope)
            currentScope = node.params
              .filter((node) => node.type === "Identifier")
              .map((node) => node.name)
            traverseAST(node.body)
            currentScope = functionScopes.pop()
            this.skip()
            break
          }
          case "MemberExpression":
            {
              const { object, property } = node
              if (
                object.type === "Identifier" &&
                property.type === "Identifier"
              ) {
                const { name: objectName } = object
                const { name: propertyName } = property
                if (
                  !(
                    Object.keys(BUILTINS).includes(objectName) &&
                    BUILTINS[objectName].includes(propertyName)
                  ) &&
                  !currentScope.includes(objectName) &&
                  functionScopes.every((scope) => !scope.includes(objectName))
                  // TODO: check if property name exists in object
                ) {
                  console.warn(
                    `Variable '${objectName}.${propertyName}' is not declared.`,
                  )
                  undeclaredVariables.push(`${objectName}.${propertyName}`)
                }
                traverseAST(node.arguments)
                this.skip()
              }
            }
            break
          case "Identifier": {
            const { name } = node
            if (
              !Object.keys(BUILTINS).includes(name) &&
              !currentScope.includes(name) &&
              functionScopes.every((scope) => !scope.includes(name))
            ) {
              console.warn(`Variable '${name}' is not declared.`)
              undeclaredVariables.push(name)
            }
            break
          }
          default:
            break
        }
      },
    })
  }

  traverseAST(ast)

  return {
    validSyntax: true,
    undeclaredVariables,
  }
}

export const findCodeVariables = (userCode) => {
  let ast
  try {
    ast = parse(userCode, { ecmaVersion: 2023 })
  } catch (e) {
    return []
  }
  const variables = [],
    localVariables = []

  function traverseAST(node) {
    walk(node, {
      enter(node) {
        switch (node.type) {
          case "VariableDeclaration": {
            const name = node.declarations[0].id.name
            // Check if already declared in current or outer scopes
            if (localVariables.includes(name)) {
              console.warn(`Variable '${name}' is declared multiple times.`)
            } else {
              localVariables.push(name)
            }
            break
          }
          case "ArrowFunctionExpression":
          case "FunctionDeclaration": {
            this.skip()
            break
          }
          case "MemberExpression":
            {
              const { object, property } = node
              if (
                object.type === "Identifier" &&
                property.type === "Identifier"
              ) {
                const { name: objectName } = object
                const { name: propertyName } = property
                if (
                  !(
                    Object.keys(BUILTINS).includes(objectName) &&
                    BUILTINS[objectName].includes(propertyName)
                  ) &&
                  !localVariables.includes(objectName)
                  // TODO: check if property name exists in object
                ) {
                  variables.push(objectName)
                }
                traverseAST(node.arguments)
                this.skip()
              }
            }
            break
          case "Identifier": {
            const { name } = node
            if (
              !Object.keys(BUILTINS).includes(name) &&
              !localVariables.includes(name) &&
              !variables.includes(name)
            ) {
              variables.push(name)
            }
            break
          }
          default:
            break
        }
      },
    })
  }

  traverseAST(ast)
  return variables
}

export const evaluateCode = (
  propertyData,
  columnData,
  externalValues,
  variables,
  userCode,
) => {
  let notFoundVariables = false
  const variableInitiationCode = variables
    .map((variable) => {
      let value = ""
      if (variable.includes("$")) {
        if (!Object.prototype.hasOwnProperty.call(externalValues, variable)) {
          notFoundVariables = true
          return ""
        }
        value = externalValues[variable]
        if (variable.startsWith("column$")) {
          value = isNaN(value)
            ? `"${value}"`
            : value.length
              ? parseFloat(value)
              : String(Boolean(value))
        } else if (typeof value === "string") {
          value = `"${value}"`
        }
      } else {
        if (Object.prototype.hasOwnProperty.call(propertyData, variable)) {
          value = JSON.stringify(propertyData[variable])
        } else if (Object.prototype.hasOwnProperty.call(columnData, variable)) {
          value = columnData[variable]
          value = isNaN(value)
            ? `"${value}"`
            : value.length
              ? parseFloat(value)
              : String(Boolean(value))
        } else {
          notFoundVariables = true
          return ""
        }
      }
      return `const ${variable} = ${value};`
    })
    .join("")
  if (notFoundVariables) {
    // Not all variables are actually present. We skip the test.
    return NaN
  }
  return eval(variableInitiationCode + userCode)
}

export const renderExternalValueName = (externalValue) => {
  if (externalValue.type === "column") {
    return `column$${he.encode(externalValue.dataset || "")}$${he.encode(
      externalValue.column || "",
    )}`
  } else if (externalValue.type === "property") {
    return `property$${he.encode(externalValue.dataset || "")}$${he.encode(
      externalValue.property || "",
    )}`
  } else {
    return `${externalValue.type}$${he.encode(externalValue.code || "")}`
  }
}

export const getTextWidthAndHeight = (text) => {
  const lines = text.split("\n")
  const numberOfLines = lines.length
  const maxLineLength = Math.max(...lines.map((line) => line.length))
  return {
    width: maxLineLength,
    height: numberOfLines,
  }
}
