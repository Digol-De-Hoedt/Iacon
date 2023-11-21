// Very Bad Node.js Code - Do not use in production!

const fs = require('fs');

// Function to read a file and print its content
function readAndPrintFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log('File Content:', content);
        return content;
    } catch (error) {
        console.error('Error reading file:', error.message);
    }
}

// Function to add two numbers asynchronously
function addAsync(a, b, callback) {
    setTimeout(() => {
        const result = a + b;
        callback(null, result);
    }, 2000);
}

// Main function to demonstrate bad practices
function main() {
    const fileName = 'example.txt';
    const fileContent = readAndPrintFile(fileName);

    const num1 = 5;
    const num2 = '10'; // Oops! This should be a number, but it's a string

    addAsync(num1, num2, (err, result) => {
        if (err) {
            console.error('Error adding numbers:', err);
        } else {
            console.log('Sum of numbers:', result);
        }
    });

    // Other poorly structured code...
}

// Call the main function
main();
