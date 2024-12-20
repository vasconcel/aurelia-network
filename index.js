import readline from "readline";
import chalk from "chalk";
import Blockchain from "./src/Blockchain.js";
import { displayMenu, questionAsync } from './src/ui.js';
import { askForValidInput } from './src/helpers.js';
import { Transaction } from "./src/Transaction.js";

// Esquema de cores para saída no console.
const COLOR_SCHEME = {
    primary: chalk.cyanBright,
    secondary: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    info: chalk.rgb(0, 191, 255),
    light: chalk.rgb(157, 255, 199),
    accent: chalk.rgb(255, 127, 80),
};

// Interface readline para inputs/outputs do console.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const blockchain = new Blockchain();

async function addTransaction(blockchain) {
    try {
        const recipientAddress = await askForValidInput(
            rl,
            "Enter the recipient's address (0x...): ",
            (input) => input.startsWith('0x')
        );

        const amount = await askForValidInput(
            rl,
            "Enter the amount to send: ",
            (input) => !isNaN(input) && parseFloat(input) > 0
        );

        const fee = await askForValidInput(
            rl,
            "Enter the transaction fee: ",
            (input) => !isNaN(input) && parseFloat(input) >= 0
        );

        const transaction = new Transaction(blockchain.miningRewardWallet, recipientAddress, parseFloat(amount), parseFloat(fee));

        await transaction.signTransaction();

        blockchain.p2pNetwork.broadcastTransaction(transaction);
        console.log(COLOR_SCHEME.success("Transaction broadcasted successfully!\n"));
    } catch (error) {
        console.error(COLOR_SCHEME.error("Error adding transaction:", error));
    }

    displayMenu(rl, blockchain);
}

async function mine() {
    try {
        await blockchain.mine(blockchain.p2pNetwork.transactionPool);
        blockchain.p2pNetwork.transactionPool = [];
        console.log(COLOR_SCHEME.success("Mining completed.\n"));
    } catch (error) {
        console.error(COLOR_SCHEME.error("Error during mining:", error));
    }
    displayMenu(rl, blockchain);
}

function viewBlockchain() {
    console.log(COLOR_SCHEME.secondary("\nViewing Blockchain...\n"));
    blockchain.getBlockchain().forEach((block) => console.log(JSON.stringify(block, null, 2)));
    displayMenu(rl, blockchain);
}

async function viewAddressHistory(rl, blockchain) {
    const address = await questionAsync(rl, COLOR_SCHEME.primary("Enter the address (0x...): "));
    const history = blockchain.getAddressHistory(address);

    if (history.length === 0) {
        console.log(COLOR_SCHEME.warning(`No transactions found for address: ${address}`));
    } else {
        console.log(COLOR_SCHEME.secondary(`\nTransaction history for ${address}:\n`));
        for (const transaction of history) {
            const displayTx = await transaction.displayTransaction();
            console.log(`${COLOR_SCHEME.primary(`Transaction:`)}\n${displayTx}\n`);
        }
    }
    displayMenu(rl, blockchain);
}

function exitApplication() {
    console.log(COLOR_SCHEME.secondary("\nExiting Aurelia Network...\n"));
    rl.close();
}

console.log(COLOR_SCHEME.primary("\nWelcome to the Aurelia Network!\n"));
displayMenu(rl, blockchain);

export { COLOR_SCHEME, rl, addTransaction, viewBlockchain, viewAddressHistory, exitApplication, mine };