const calculator = {
  // Object that represents a calculator with various operations

  // Math operations for the calculator
  add: (a: number, b: number): number => a + b, // Addition operation
  subtract: (a: number, b: number): number => a - b, // Subtraction operation
  divide: (a: number, b: number): number | string => {
    if (b === 0) return "Error!"; // Handle division by zero with error
    return a / b; // Division operation
  },
  multiply: (a: number, b: number): number => a * b, // Multiplication operation
  power: (a: number, b: number): number => Math.pow(a, b), // Power/exponentiation operation

  // Mapping between operator symbols and their respective functions
  operations: {
    "+": (a: number, b: number): number => calculator.add(a, b), // Map addition operator
    "-": (a: number, b: number): number => calculator.subtract(a, b), // Map subtraction operator
    "x": (a: number, b: number): number => calculator.multiply(a, b), // Map multiplication operator
    "/": (a: number, b: number): number | string => calculator.divide(a, b), // Map division operator
  } as const, // Ensure operations cannot be changed later

  isResult: false, // Flag indicating whether the last operation produced a result

  // Function to handle display logic for the calculator
  handleOndisplay(expression: string): string | number {
    const operators = Object.keys(this.operations) as Array<keyof typeof this.operations>; // Extract operator keys
    const stack: (number | string)[] = []; // Stack to evaluate the expression
    let num = ''; // Buffer to build numbers

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      // Handle negative numbers
      if (char === '-' && (i === 0 || operators.includes(expression[i - 1] as keyof typeof this.operations))) {
        num += char; // Treat minus sign as part of a negative number
      } 
      // If character is a number or decimal point
      else if (!isNaN(Number(char)) || char === '.') {
        if (this.isResult) {
          num = char; // Start a new number if the last input was a result
          this.isResult = false; // Reset the result flag
        } else {
          num += char; // Accumulate characters to build the number
        }
      } 
      // If character is an operator
      else if (operators.includes(char as keyof typeof this.operations)) {
        if (num) {
          stack.push(Number(num)); // Push the current number onto the stack
          num = ''; // Reset number buffer for the next number
        }
        // Check for operator precedence and evaluate stack if needed
        while (stack.length > 1 && this.hasPrecedence(char as keyof typeof this.operations, stack[stack.length - 2] as keyof typeof this.operations)) {
          this.evaluateStack(stack); // Evaluate the stack based on operator precedence
        }
        stack.push(char as keyof typeof this.operations); // Push the operator onto the stack
      } else {
        return "math error"; // Return error for invalid input
      }
    }

    if (num) {
      stack.push(Number(num)); // Push the last number onto the stack
    }

    // Evaluate the stack until only one result remains
    while (stack.length > 1) {
      this.evaluateStack(stack);
    }

    const result = stack[0]; // Get the final result

    // Limit the result to 3 decimal places if it's a number
    const limitedResult = typeof result === 'number' ? parseFloat(result.toFixed(3)) : result;

    this.isResult = true; // Set the result flag to true after calculation

    return limitedResult; // Return the final result, limited to 3 decimal places
  },

  // Evaluate the stack using the top operator and numbers
  evaluateStack(stack: (number | string)[]): void {
    const b = stack.pop() as number; // Pop the second operand
    const op = stack.pop() as keyof typeof this.operations; // Pop the operator
    const a = stack.pop() as number; // Pop the first operand
    stack.push(this.operations[op](a, b)); // Evaluate and push the result back onto the stack
  },

  // Determine operator precedence (higher number means higher precedence)
  hasPrecedence(op1: keyof typeof this.operations, op2: keyof typeof this.operations): boolean {
    const precedence: { [key: string]: number } = {
      '+': 1, // Addition and subtraction have the lowest precedence
      '-': 1,
      'x': 2, // Multiplication and division have higher precedence
      '/': 2,
    };
    return precedence[op1] <= precedence[op2]; // Return true if op1 has less or equal precedence to op2
  },
};

// Function to get greeting messages based on an index
const getHello = (index: number): { hello: string, nextIndex: number } => {
  const hellos = [
    "Hello Love Good Bye", // English greeting
    "Hola Amor Adiós", // Spanish greeting
    "Bonjour Amour Au Revoir", // French greeting
    "Hallo Liebe Auf Wiedersehen", // German greeting
    "Ciao Amore Addio", // Italian greeting
    "Konnichiwa Ai Sayōnara", // Japanese greeting
    "Hi mahal Paalam", // Filipino greeting
    "Privet Lyubov' Do svidaniya" // Russian greeting
  ];
  const hello = hellos[index]; // Get greeting message at the current index
  const nextIndex = (index + 1) % hellos.length; // Determine the next index to cycle through greetings
  return { hello, nextIndex }; // Return the greeting and the next index
};

// Initialize the calculator functionality
function initCalculator() {
  const display = document.getElementById("display") as HTMLInputElement; // Get the display element
  let expression = ""; // Store the current expression being entered
  let helloIndex = 0; // Track the current index for greeting messages
  let isOn = false; // Track if the calculator is on or off
  const displayLimit = 15; // Limit the number of characters on the display
  const operators = Object.keys(calculator.operations) as Array<keyof typeof calculator.operations>; // Extract operator keys

  // Add event listeners to buttons in the calculator
  document.querySelectorAll("#calculator button").forEach(button => {
    button.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLButtonElement; // Get the clicked button element
      const value = target.textContent; // Get the text content of the clicked button

      if (!value) return; // Ignore if button has no value

      // Handle "AC" button (Clear all)
      if (value === "AC") {
        isOn = true; // Turn the calculator on
        expression = "0"; // Reset expression
        display.value = expression; // Update the display
        return;
      }

      // Handle "on" button (Turn calculator on)
      if (value === "on") {
        isOn = true; // Turn the calculator on
        expression = "0"; // Reset expression
        display.value = expression; // Update the display
        return;
      }

      // Handle "bye!" button (Turn calculator off)
      if (value === "bye!") {
        // Only show "bye!" message if the calculator is currently on
        if (isOn) {
          isOn = false; // Turn the calculator off
          expression = "bye!"; // Show "bye!" message
          display.value = expression; // Update the display

          // Clear the display after 1 second
          setTimeout(function() {
              display.value = ""; // Clear the display
          }, 1000); // 1000 milliseconds = 1 second
        }
        return;
      }

      // If calculator is off, ignore other button presses
      if (!isOn) {
        return;
      }

      // Handle backspace (⌫ button)
      if (value === "⌫") {
        expression = expression.slice(0, -1); // Remove the last character from the expression
        display.value = expression || "0"; // If expression is empty, display 0
        return;
      }

      // Handle greeting functionality (hello! button)
      if (value === "hello!") {
        const { hello, nextIndex } = getHello(helloIndex); // Get the current greeting
        expression = ""; // Clear the expression for the greeting
        helloIndex = nextIndex; // Update the greeting index for the next greeting
        display.value = hello; // Show the greeting message on the display
        return;
      }

      // Handle equals (= button)
      if (value === "=") {
        const result = calculator.handleOndisplay(expression); // Calculate the result based on the current expression
        display.value = result.toString(); // Show the result on the display
        expression = result.toString(); // Update the expression with the result
        calculator.isResult = true; // Set the result flag to true
        return;
      }

      // Check if the character limit for the display is reached
      if (expression.length >= displayLimit) {
        return; // Do nothing if limit is reached
      }

      // Handle if the last input was a result
      if (calculator.isResult) {
        // If the new input is a number or decimal point, start a new expression
        if (!isNaN(Number(value)) || value === '.') {
          expression = value; // Start a new expression
        } else if (operators.includes(value as keyof typeof calculator.operations)) {
          // If the new input is an operator, continue using the result for further operations
          expression = display.value; // Use the current result as the base
          expression += value; // Append the operator to the expression
        }
        calculator.isResult = false; // Reset the result flag
      } else {
        expression += value; // Append the new value to the expression
      }

      display.value = expression; // Update the display with the current expression
    });
  });
}

// Initialize the calculator once the DOM content has fully loaded
document.addEventListener("DOMContentLoaded", initCalculator); // Set up the calculator
