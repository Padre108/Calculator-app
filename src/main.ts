const calculator = {
  // Math operations
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  divide: (a: number, b: number): number | string => {
    if (b === 0) return "Error! Division by zero.";
    return a / b;
  },
  multiply: (a: number, b: number): number => a * b,
  power: (a: number, b: number): number => Math.pow(a, b),
  //operations for the calculator
  operations: {
    "+": (a: number, b: number): number => calculator.add(a, b),
    "-": (a: number, b: number): number => calculator.subtract(a, b),
    "x": (a: number, b: number): number => calculator.multiply(a, b),
    "/": (a: number, b: number): number | string => calculator.divide(a, b),
  } as const,

  handleOndisplay(expression: string): string | number {
    const operators = Object.keys(this.operations) as Array<keyof typeof this.operations>;
    const stack: (number | string)[] = [];
    let num = '';

    for (let char of expression) {
      if (!isNaN(Number(char)) || char === '.') {
        num += char;
      } else if (operators.includes(char as keyof typeof this.operations)) {
        if (num) {
          stack.push(Number(num));
          num = '';
        }
        while (stack.length > 1 && this.hasPrecedence(char, stack[stack.length - 2] as string)) {
          const b = stack.pop() as number;
          const op = stack.pop() as keyof typeof this.operations;
          const a = stack.pop() as number;
          stack.push(this.operations[op](a, b));
        }
        stack.push(char);
      } else {
        return "Invalid character in expression";
      }
    }

    if (num) {
      stack.push(Number(num));
    }

    while (stack.length > 1) {
      const b = stack.pop() as number;
      const op = stack.pop() as keyof typeof this.operations;
      const a = stack.pop() as number;
      stack.push(this.operations[op](a, b));
    }

    return stack[0];
  },

  hasPrecedence(op1: string, op2: string): boolean {
    const precedence: { [key: string]: number } = {
      '+': 1,
      '-': 1,
      'x': 2,
      '/': 2
    };
    return precedence[op1] <= precedence[op2];
  },
};

const getHello = (index: number): { hello: string, nextIndex: number } => {
  const hellos = ["Hello Love Good Bye",  "Hola Amor Adiós", "Bonjour Amour Au Revoir", "Hallo Liebe Auf Wiedersehen", "Ciao Amore Addio", "Konnichiwa Ai Sayōnara", "Hi mahal Paalam", "Privet Lyubov' Do svidaniya"];
  const hello = hellos[index];
  const nextIndex = (index + 1) % hellos.length;
  return { hello, nextIndex };
};

function initCalculator() {
  const display = document.getElementById("display") as HTMLInputElement;
  let expression = "";
  let helloIndex = 0; //hello Index 
  let isOn = false;
  const displayLimit = 15;  // Limit to 15 characters

  document.querySelectorAll("#calculator button").forEach(button => {
    button.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLButtonElement;
      const value = target.textContent;

      if (!value) return;

      // Clear display (AC button)
      if (value === "AC") {
        isOn = true;
        expression = "0";
        display.value = expression;
        return;
      }

      // Turn on the calculator
      if (value === "on") {
        isOn = true;
        expression = "0";
        display.value = expression;
        return;
      }

      // Turn off the calculator
      if (value === "bye!") {
        isOn = false;
        expression = "";
        display.value = expression;
        return;
      }

      // Ensure calculator is on
      if (!isOn) {
        display.value = "Turn on the calculator";
        return;
      }

      // Backspace functionality (⌫ button)
      if (value === "⌫") {
        expression = expression.slice(0, -1);
        display.value = expression;
        return;
      }

      // Greeting functionality (hello! button)
      if (value === "hello!") {
        const { hello, nextIndex } = getHello(helloIndex);
        expression = ""
        helloIndex = nextIndex;
        display.value = hello;
        return;
      }

      // Equals functionality (= button)
      if (value === "=") {
        const result = calculator.handleOndisplay(expression);
        display.value = result.toString();
        expression = result.toString();
        return;
      }

      // Character limit check
      if (expression.length >= displayLimit) {
        display.value = "Limit reached";
        return;
      }

      // Append value to expression
      expression += value;
      display.value = expression;
    });
  });
}

document.addEventListener("DOMContentLoaded", initCalculator);
