const jwt = require('jsonwebtoken');

function generateProjectCode(projectName) {
    let code = '';

    // Remove whitespace and convert to uppercase
    projectName = projectName.trim().toUpperCase();

    // Loop through each character in the project name
    for (let i = 0; i < projectName.length; i++) {
        const char = projectName.charAt(i);

        // If the character is a letter and hasn't been added to the code yet
        if (/^[A-Z]$/.test(char) && !code.includes(char)) {
            code += char;

            // Stop looping if the code is already 5 letters long
            if (code.length === 5) {
                break;
            }
        }
    }

    // If the code is less than 5 letters long, add random letters until it's 5 letters long
    while (code.length < 5) {
        code += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }

    return code;
};


// generate JWT Token on success login & register with expiry 5 days
const generateJWT = (user_id, permissions, project_id) => {
    return jwt.sign({ id: user_id, permissions, project_id }, process.env.JWT_SECRET, {
        expiresIn: '5d',
    });
};





module.exports = {
    generateProjectCode,
    generateJWT
}  