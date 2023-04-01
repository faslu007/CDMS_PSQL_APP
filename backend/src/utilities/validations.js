// all the validation functions are implemented here and exported

// Super admin registration input validation;
const validateSuperAdminRegisterInput = (userInput) => {
  const { firstName, lastName, email, phone, password, designation } = userInput;

  if (!firstName || !lastName || !email || !phone || !password || !designation) {
    const missingFields = [];

    if (!firstName) missingFields.push("first name");
    if (!lastName) missingFields.push("last name");
    if (!email) missingFields.push("email");
    if (!phone) missingFields.push("phone");
    if (!password) missingFields.push("password");
    if (!designation) missingFields.push("designation");

    if (email && !validateEmail(email)) {
      return {
        success: false,
        message: "Invalid email address.",
      };
    }

    return {
      success: false,
      message: `The following fields are missing: ${missingFields.join(", ")}`,
    };
  }

  return {
    success: true,
  };
};





const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateSuperAdminRegisterInput,
}
