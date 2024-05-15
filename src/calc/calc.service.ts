import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CalcDto } from './calc.dto';

@Injectable()
export class CalcService {
  calculateExpression(calcBody: CalcDto) {
    const expression = calcBody.expression;
    if (!this.isValidExpression(expression)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid expression provided',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = this.evaluateExpression(expression);
    return result;
  }

  private evaluateExpression(expression: string): number {
    const tokens = this.tokenize(expression);

    const rpn = this.parseToRPN(tokens);

    if (rpn.length === 1) {
      return parseFloat(rpn[0]);
    }

    return this.evaluateRPN(rpn);
  }

  private tokenize(expression: string): string[] {
    return expression
      .split(/([+\-*\/])/)
      .filter((token) => token.trim() !== '');
  }

  private parseToRPN(tokens: string[]): string[] {
    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
    };
    const outputQueue: string[] = [];
    const operatorStack: string[] = [];

    tokens.forEach((token) => {
      if (/\d/.test(token)) {
        outputQueue.push(token);
      } else if (['+', '-', '*', '/'].includes(token)) {
        while (
          operatorStack.length > 0 &&
          precedence[operatorStack[operatorStack.length - 1]] >=
            precedence[token]
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      }
    });

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
  }

  private evaluateRPN(rpn: string[]): number {
    const stack: number[] = [];

    rpn.forEach((token) => {
      if (/\d/.test(token)) {
        stack.push(parseFloat(token));
      } else {
        const secondNumber = stack.pop();
        const firstNumber = stack.pop();
        switch (token) {
          case '+':
            stack.push(firstNumber + secondNumber);
            break;
          case '-':
            stack.push(firstNumber - secondNumber);
            break;
          case '*':
            stack.push(firstNumber * secondNumber);
            break;
          case '/':
            stack.push(firstNumber / secondNumber);
            break;
          default:
            throw new Error('Invalid operator');
        }
      }
    });

    if (stack.length !== 1) {
      throw new Error('Invalid expression');
    }

    return stack.pop();
  }

  private isValidExpression(expression: string): boolean {
    if (/[+\-*\/]$/.test(expression)) {
      return false;
    }

    if (/[+\-*\/]{2,}/.test(expression)) {
      return false;
    }

    return true;
  }
}
