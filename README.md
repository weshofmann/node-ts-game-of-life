# ts-game-of-life

## Introduction

I'm brand new to Typescript so this is a little implementation of Conway's Game of Life that I'm writing to explore various features of the Typescript language.  The implementation here is purposely pretty strange as I wanted to focus on the functional aspects of the language at first.  This absolutely isn't an efficient or easy-to-maintain implementation and should be viewed only as a learning exercise.

## Typescript Language Features

As stated above, the goal of this project is to learn the Typescript language and ecosystem.  Thus, I have maintained a list of the core features of Typescript which I have already explored in this codebase, and a list of those which I have not yet explored but intend to through this codebase.

---

### Already Explored Features

#### Fundamental Concepts

- Basic Types
    - Worked with boolean and number types, foundational for understanding TypeScript.
- Arrays
    - Manipulated arrays extensively, a crucial data structure in TypeScript.
- Functions and Arrow Functions
    - Used functions, particularly arrow functions, is central to TypeScript programming.

#### Intermediate Concepts

- Type Aliases
    - Defined some type aliases like `Cell`, `Row`, and `Board`, which are instrumental in creating custom types.
- Custom Function Types
    - Created custom function types like `CellEvaluator` and `CellEvaluatorGenerator`, essential for creating more flexible functions.
- Optional Chaining
    - Used in expressions like last_board[ny]?.[nx], an important feature for safe navigation.
- Const Assertions
    - Used const for variables like `WIDTH` and `HEIGHT` that are not intended to change.
- Importing Modules
    - Imported the `fs` module, which is an essential aspect of modular programming in TypeScript.

#### Control Flow

- Conditional (Ternary) Operator
    - Used conditional operators, a shorthand form for `if-else` statements.
- Control Flow Statements
    - Used `if-else` and `for` loops to control the flow of the program, fundamental for any programming language.
- Recursive Functions
    - Implemented tail-recursive functions, which is an important concept in understanding function execution and stack.

#### Code Quality and Maintenance

- Commenting and Documentation
    - Extensive commenting and documentation provide context and explanation, aiding in maintainability.
- Template Strings
    - Utilized template strings for creating string literals, allowing embedded expressions.
- Error Handling and Logging
    - Employed a logging mechanism via writing logs to a file, aiding in debugging and understanding the application flow.

#### Node.js Specific

- Node.js Specific APIs
    - Usage of process.stdout and setInterval is specific to Node.js environment, learning how TypeScript interacts with JavaScript runtime features.

---

### Features Not Yet Explored

#### Fundamental Concepts

- Interfaces and Classes
    - Understand how to create classes and interfaces as they form the base for object-oriented programming in TypeScript.
- Generics
    - Explore generics to write flexible and reusable components, a fundamental concept in TypeScript and many other programming languages.
- Advanced Types
    - Focus on mapped types, conditional types, and index types to create more advanced and dynamic types.
- Modules
    - Learn how to organize and structure code using modules as it's essential for managing codebases.

#### Intermediate Concepts

- Access Modifiers
    - Get familiar with public, private, and protected modifiers to understand encapsulation.
- Enums
    - Enums are quite helpful in creating a set of named constants for use in your code.
- Type Guards
    - Understand how to leverage type guards to work with union types effectively.
- Asynchronous Programming
    - Explore async/await and Promises for handling asynchronous operations.

#### Code Organization and Structure

- Namespaces
    - Use namespaces to avoid naming collisions and to logically organize related code.
- Utility Types
    - Learn how utility types can simplify type transformations.
- Mixins
    - Mixins can be helpful to understand, especially when you need to share functionalities across multiple classes.

#### Code Quality and Optimization

- TSLint or ESLint
    - A linter can enforce coding standards and catch potential problems in your code.
- Strict Null Checks
    - Learn how to make your code more robust by avoiding null and undefined related issues.
- Jest for Testing
    - Understand how to write unit tests for your TypeScript code.
- TypeScript Configuration
    - Delve into various compiler options in the tsconfig.json file to optimize the TypeScript compilation process.
- Type Assertion
    - Get a deeper understanding of how and when to use type assertion.
- Decorators
    - Explore decorators to add metadata to your classes, methods, or properties.
- Custom Types
    - Develop a deeper understanding of creating and using custom types for improving code maintainability.