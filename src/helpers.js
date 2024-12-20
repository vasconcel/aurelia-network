import { questionAsync } from './ui.js';
import { COLOR_SCHEME } from '../index.js';

export async function askForValidInput(rl, prompt, validationFn) {
    let input;
    while (true) {
        input = await questionAsync(rl, COLOR_SCHEME.primary(prompt));
        if (validationFn(input)) {
            return input;
        } else {
            console.log(COLOR_SCHEME.error("Invalid input. Please try again."));
        }
    }
}