const calculator = {
  // Math operations
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  divide: (a: number, b: number): number | string => {
    if (b === 0) return "Error!";
    return a / b;
  },
  multiply: (a: number, b: number): number => a * b,
  power: (a: number, b: number): number => Math.pow(a, b),

  
  // Operations mapping
  operations: {
    "+": (a: number, b: number): number => calculator.add(a, b),
    "-": (a: number, b: number): number => calculator.subtract(a, b),
    "x": (a: number, b: number): number => calculator.multiply(a, b),
    "/": (a: number, b: number): number | string => calculator.divide(a, b),
  } as const,

  isResult: false,  // Flag to track if last operation was a result or not
  
  // Handle display logic for the calculator
  handleOndisplay(expression: string): string | number {
    const operators = Object.keys(this.operations) as Array<keyof typeof this.operations>;
    const stack: (number | string)[] = [];
    let num = '';
    

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      // Handle negative numbers
      if (char === '-' && (i === 0 || operators.includes(expression[i - 1] as keyof typeof this.operations))) {
        // It's the start of the expression or after an operator
        num += char; // Treat as part of the number
      } 
      // If character is a number or decimal
      else if (!isNaN(Number(char)) || char === '.') {
        if (this.isResult) {
          num = char; // Start a new number if last input was a result
          this.isResult = false;  // Reset flag
        } else {
          num += char; // Accumulate the number
        }
      } 
      // If character is an operator
      else if (operators.includes(char as keyof typeof this.operations)) {
        if (num) {
          stack.push(Number(num)); // Push the accumulated number
          num = ''; // Reset num for next number
        }
        while (stack.length > 1 && this.hasPrecedence(char, stack[stack.length - 2] as string)) {
          this.evaluateStack(stack);
        }
        stack.push(char); // Push the operator onto the stack
      } else {
        return "math error"; // Handle invalid input
      }
    }

    if (num) {
      stack.push(Number(num)); // Push the last number
    }

    // Final evaluation of the stack
    while (stack.length > 1) {
      this.evaluateStack(stack);
    }

    const result = stack[0];
    this.isResult = true; // Set flag to indicate result was calculated

    return result;
  },

  // Evaluate the stack based on the top operators
  evaluateStack(stack: (number | string)[]): void {
    const b = stack.pop() as number;
    const op = stack.pop() as keyof typeof this.operations;
    const a = stack.pop() as number;
    stack.push(this.operations[op](a, b)); // Evaluate and push the result
  },

  // Determine operator precedence
  hasPrecedence(op1: string, op2: string): boolean {
    const precedence: { [key: string]: number } = {
      '+': 1,
      '-': 1,
      'x': 2,
      '/': 2
    };
    return precedence[op1] <= precedence[op2]; // Return precedence
  },
};
// Function to get greeting messages
const getHello = (index: number): { hello: string, nextIndex: number } => {
  const hellos = [
    "Hello Love Good Bye", 
    "Hola Amor Adiós", 
    "Bonjour Amour Au Revoir", 
    "Hallo Liebe Auf Wiedersehen", 
    "Ciao Amore Addio", 
    "Konnichiwa Ai Sayōnara", 
    "Hi mahal Paalam", 
    "Privet Lyubov' Do svidaniya"
  ];
  const hello = hellos[index];
  const nextIndex = (index + 1) % hellos.length; // Cycle through hellos
  return { hello, nextIndex };
};

function initCalculator() {
  const display = document.getElementById("display") as HTMLInputElement;
  let expression = "";
  let helloIndex = 0; // Greeting index
  let isOn = false;
  const displayLimit = 15;  // Limit to 15 characters

  // Set up button event listeners
  document.querySelectorAll("#calculator button").forEach(button => {
    button.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLButtonElement;
      const value = target.textContent;

      if (!value) return;

      // Clear display (AC button)
      if (value === "AC") {
        isOn = true; // Turn on the calculator
        expression = "0";
        display.value = expression;
        return;
      }

      // Turn on the calculator
      if (value === "on") {
        isOn = true; // Change state to on
        expression = "0";
        display.value = expression;
        return;
      }

      // Turn off the calculator
      if (value === "bye!") {
        isOn = false; // Change state to off
        expression = "";
        display.value = expression;
        return;
      }

      // Ensure calculator is on
      if (!isOn) {
        return; // Do nothing if the calculator is off
      }

      // Backspace functionality (⌫ button)
      if (value === "⌫") {
        expression = expression.slice(0, -1); // Remove last character
        display.value = expression || "0"; // Show 0 if expression is empty
        return;
      }

      // Greeting functionality (hello! button)
      if (value === "hello!") {
        const { hello, nextIndex } = getHello(helloIndex);
        expression = ""; // Clear expression for greeting
        helloIndex = nextIndex;
        display.value = hello; // Show greeting message
        return;
      }

      // Equals functionality (= button)
      if (value === "=") {
        const result = calculator.handleOndisplay(expression);
        display.value = result.toString(); // Show result
        expression = result.toString(); // Update expression with result
        return;
      }

      // Character limit check and can't add more digits if it has reached 15 characters
      if (expression.length >= displayLimit) {
        return; // Do nothing if limit reached
      }

      // Check if the last input was a result
      if (calculator.isResult) {
        // If the input is an operator, continue with the result; otherwise, start a new expression
        if (["+", "-", "x", "/"].includes(value)) {
          expression = display.value; // Use the current display value (result) for the next operation
          expression += value; // Append the operator
          calculator.isResult = false; // Reset the result flag
        } else {
          // Reset expression and start new input
          expression = value; 
        }
      } else {
        // Append value to expression
        expression += value;
      }
      display.value = expression; // Update display
    });
  });
}

// Initialize the calculator when the DOM content is loaded
document.addEventListener("DOMContentLoaded", initCalculator);