// all the validation functions are implemented here and exported

// Super admin registration input validation;
const validateSuperAdminRegisterInput = (userInput) => {
  const { firstName, lastName, email, phone, password, designation } = userInput;
  const missingFields = [];

  if (!firstName) missingFields.push("First name");
  if (!lastName) missingFields.push("Last name");
  if (!email) missingFields.push("Email");
  if (!phone) missingFields.push("Phone");
  if (!password) missingFields.push("Password");
  if (!designation) missingFields.push("Designation");

  if (password && !checkStrongPassword(password)) {
    missingFields.push("Password does not meet the minimum requirements for strength");
  }

  if (email && !validateEmail(email)) {
    missingFields.push("Invalid email address");
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      message: `The following fields are missing or invalid: ${missingFields.join(", ")}`,
    };
  }

  return {
    success: true,
  };
};



// password validation
function checkStrongPassword(str) {
  // password validation criteria = min 7 chars, min 1 symbol, min 1 upperCase, & a num
  let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{7,}$/;
  return re.test(str);
}


const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


function validatePhone(phoneNumber) {
  // Regex pattern to match a valid phone number
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  // Test the input phone number against the regex pattern
  return phoneRegex.test(phoneNumber);
};

module.exports = {
  validateSuperAdminRegisterInput,
  checkStrongPassword
}
