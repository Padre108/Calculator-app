const calculator = {
  // Math operations for the calculator
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  divide: (a: number, b: number): number | string => {
    if (b === 0) return "Error!";
    return a / b;
  },
  multiply: (a: number, b: number): number => a * b,
  power: (a: number, b: number): number => Math.pow(a, b),

  operations: {
    "+": (a: number, b: number): number => calculator.add(a, b),
    "-": (a: number, b: number): number => calculator.subtract(a, b),
    "x": (a: number, b: number): number => calculator.multiply(a, b),
    "/": (a: number, b: number): number | string => calculator.divide(a, b),
  } as const,

  isResult: false, // Flag to track if last input was a result

  // Function to handle display logic for the calculator
  handleOndisplay(expression: string): string | number {
    const operators = Object.keys(this.operations) as Array<keyof typeof this.operations>;
    const stack: (number | string)[] = [];
    let num = '';

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      // Handle negative numbers
      if (char === '-' && (i === 0 || operators.includes(expression[i - 1] as keyof typeof this.operations))) {
        num += char;
      } else if (!isNaN(Number(char)) || char === '.') {
        if (this.isResult) {
          num = char;
          this.isResult = false;
        } else {
          num += char;
        }
      } else if (operators.includes(char as keyof typeof this.operations)) {
        if (num) {
          stack.push(Number(num));
          num = '';
        }
        while (stack.length > 1 && this.hasPrecedence(char as keyof typeof this.operations, stack[stack.length - 2] as keyof typeof this.operations)) {
          this.evaluateStack(stack);
        }
        stack.push(char as keyof typeof this.operations);
      } else {
        return "math error"; // Return error for invalid input
      }
    }

    if (num) {
      stack.push(Number(num));
    }

    while (stack.length > 1) {
      this.evaluateStack(stack);
    }

    const result = stack[0];
    const limitedResult = typeof result === 'number' ? parseFloat(result.toFixed(3)) : result;

    this.isResult = true;
    return limitedResult;
  },

  // Evaluate the stack based on operators and operands
  evaluateStack(stack: (number | string)[]): void {
    const b = stack.pop() as number;
    const op = stack.pop() as keyof typeof this.operations;
    const a = stack.pop() as number;
    stack.push(this.operations[op](a, b));
  },

  // Determine operator precedence
  hasPrecedence(op1: keyof typeof this.operations, op2: keyof typeof this.operations): boolean {
    const precedence: { [key: string]: number } = {
      '+': 1,
      '-': 1,
      'x': 2,
      '/': 2,
    };
    return precedence[op1] <= precedence[op2];
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
        if (isOn) {
          isOn = false; // Turn the calculator off
          expression = "bye!"; // Show "bye!" message
          display.value = expression; // Update the display

          // Clear the display after 1 second
          setTimeout(() => {
              display.value = ""; // Clear the display
          }, 1000);
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
        return;
      }

      // Prevent appending invalid sequences like "..", "++", "xx", "//"
      const lastChar = expression.slice(-1); // Get the last character in the expression
      const secondLast = expression.slice(-2, -1); // Get the second last character in the expression

      const invalidConsecutiveOperators = /[x\/\+]/.test(lastChar) && /[x\/\+]/.test(value); // Prevent invalid consecutive operators
      const invalidMinusOperator = lastChar === '-' && secondLast === '-' && value === '-'; // Prevent triple minus "---"
      const invalidConsecutiveDots = lastChar === '.' && value === '.'; // Prevent consecutive dots

      if (invalidConsecutiveOperators || invalidConsecutiveDots || invalidMinusOperator) {
        return; // Skip appending the value if it creates an invalid sequence
      }

      // Handle if the last input was a result
      if (calculator.isResult) {
        if (!isNaN(Number(value)) || value === '.') {
          expression = value; // Start a new expression
        } else if (operators.includes(value as keyof typeof calculator.operations)) {
          expression = display.value; // Use the current result as the base
          expression += value; // Append the operator to the expression
        }
        calculator.isResult = false;
      } else {
        expression += value; // Append the new value to the expression
      }

      display.value = expression; // Update the display with the current expression
    });
  });
}

// Initialize the calculator once the DOM content has fully loaded
document.addEventListener("DOMContentLoaded", initCalculator);
