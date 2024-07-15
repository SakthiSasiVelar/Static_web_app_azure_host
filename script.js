const depositAmount = 20000;
const withdrawAmount = 10000;


var accountNumber;
var currentBalance;
var currentservice;

const baseUrl = "https://localhost:7151/api";

const validateCard = async (cardNumber) => {
  try {
    const response = await fetch(`${baseUrl}/ATMService/validate-card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cardNumber),
    });
    const data = await response.json();

    if (data.errorCode && data.errorCode == 404) {
      showError(data.errorMessage, 'card-number', 'card-number-error-container');
      return false;
    }
    accountNumber = data.accountNumber;
    currentBalance = data.currentBalance;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

async function deposit(Amount) {
  try {
    console.log("Sending request...");
    var response = await fetch(`${baseUrl}/ATMService/Deposite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountNumber: accountNumber,
        amount: Amount,
      }),
    });
    console.log(response);
    if(!response.ok ){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Response data:", data);
    
    if (data.errorCode && data.errorCode == 404) {
      return false;
    }
  } catch (error) {
    console.error("Error during fetch:", error.message);
    return false;
  }
}

const sendOtp = async () => {
  try {
    const response = await fetch(`${baseUrl}/Email/SendOTP?accountNo=${accountNumber}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if(response.ok){
      return true;
    }
    const data = await response.json();
    if (data.errorCode && data.errorCode == 404) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function validatePin(pin) {
  try {
    const response = await fetch(`${baseUrl}/ATMService/validate-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountNumber: accountNumber,
        pin: pin
      }),
    });
    if(response.ok){
      return true;
    }
    const data = await response.json();
    if (data.errorCode && data.errorCode == 404) {
       showError("Please enter valid PIN", "pin-value", "pin-error-container");
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function getOtp(service) {
  currentservice = service;
  const result = await sendOtp();
  if (result) {
    showOtpPage();
  }
}

async function verifyOtp(){
  const otp = document.getElementById('otp-value').value;
  if(otp.length!= 4){
    showError("Please enter valid OTP", "otp-value", "otp-error-container");
    return;
  }
  else{
    makeErrorNone("otp-value", "otp-error-container");
  }
  const result = await validateOtp(otp);
  if (result) {
    document.getElementById('otp-value').value = '';
    makeAllContainerDisplayNone();
    if(currentservice == 'balance'){
      showBalance()
    }
    else if(currentservice == 'deposit'){
      document.getElementById('deposit-container').style.display = 'flex';
    }
    else{
      document.getElementById('withdraw-container').style.display = 'flex';
    }
  }
}

async function validateOtp(otp){
  try {
    const response = await fetch(`${baseUrl}/Email/VerifyOTP?accountNo=${accountNumber}&otp=${otp}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.value.result == 'Invalid OTP.') {
      showError("Please enter valid OTP", "otp-value", "otp-error-container");
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function showOtpPage() {
  makeAllContainerDisplayNone();
  document.getElementById('otp-container').style.display = 'flex';
}

const withdraw = async (Amount) => {
  try {
    const response = await fetch(`${baseUrl}/ATMService/Withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountNumber: accountNumber,
        amount: Amount,
      }),
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
async function checkCardNumber() {
  const cardNum = document.getElementById("card-number").value;
  if (cardNum.length != 16) {
    showError(
      "Please enter valid card number",
      "card-number",
      "card-number-error-container"
    );
  } else {
    makeErrorNone("card-number", "card-number-error-container");
  }

  const result = await validateCard(cardNum);
  if (result) {
    makeAllContainerDisplayNone();
    document.getElementById("pin-container").style.display = "flex";
  }
}

async function checkPin() {
  const pin = document.getElementById("pin-value").value;
  if (pin.length!= 4) {
    showError("Please enter valid PIN", "pin-value", "pin-error-container");
  } else {
    makeErrorNone("pin-value", "pin-error-container");
    const result = await validatePin(pin.toString());
    console.log(result)
    if(result){
      makeAllContainerDisplayNone();
      document.getElementById("services-container").style.display = "flex";
    }
  }
}

async function showBalance() {
  const balance = await checkBalance();

  if (balance) {
    document.getElementById("balance").innerHTML = balance;
    makeAllContainerDisplayNone();
    document.getElementById("balance-container").style.display = "flex";
  }
}

async function showDeposit() {
  makeAllContainerDisplayNone();
  document.getElementById("deposit-container").style.display = "flex";
}


async function validateDeposit() {
  const amount = document.getElementById("deposit-value").value;
  if (amount > 20000) {
    showError(
      "Maximum deposit amount is 20000",
      "deposit-value",
      "deposit-error-container"
    );
  } else if (amount % 100 != 0) {
    showError(
      "Please enter amount in multiple of 100",
      "deposit-value",
      "deposit-error-container"
    );
  } else {
    makeErrorNone("deposit-value", "deposit-error-container");
     const result = await deposit(amount.toString());
     
     setTimeout(()=>{
        alert('Deposit successfully');

     },3000)
     
    
    
  }
}

document.getElementById('deposit-submit-btn').addEventListener('click', async (event) => {
  event.preventDefault();
  await validateDeposit();
});



async function showWithdraw() {
  makeAllContainerDisplayNone();
  document.getElementById("withdraw-container").style.display = "flex";
}

async function validateWithdraw() {
  const amount = document.getElementById("withdraw-amount").value;
  if(amount > 10000){
    showError(
      "Maximum withdrawal amount is 10000",
      "withdraw-amount",
      "withdraw-error-container"
    )
  }
  else if (amount % 100 != 0) {
    showError(
      "Please enter amount in multiple of 100",
      "withdraw-amount",
      "withdraw-error-container"
    );
  } 
  else {
    makeErrorNone("withdraw-amount", "withdraw-error-container");
    await withdraw(amount);
    alert('withdraw successfully')
  }
}

const checkBalance = async () => {
  try {
    const response = await fetch(`${baseUrl}/ATMService?accountNo=${accountNumber}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

function showError(message, inputBoxId, errorContainerId) {
  var inputBox = document.getElementById(inputBoxId);
  var errorContainer = document.getElementById(errorContainerId);
  inputBox.style.borderColor = "Red";
  inputBox.style.outlineColor = "Red";
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
  errorContainer.style.color = 'red'
}

function makeErrorNone(inputBoxId, errorContainerId) {
  const inputBox = document.getElementById(inputBoxId);
  const errorContainer = document.getElementById(errorContainerId);
  inputBox.style.borderColor = "black";
  inputBox.style.outlineColor = "black";
  errorContainer.style.display = "none";
}

function makeAllContainerDisplayNone() {
  document.getElementById("card-container").style.display = "none";
  document.getElementById("pin-container").style.display = "none";
  document.getElementById("deposit-container").style.display = "none";
  document.getElementById("withdraw-container").style.display = "none";
  document.getElementById("balance-container").style.display = "none";
  document.getElementById("otp-container").style.display = "none";
  document.getElementById("services-container").style.display = "none";
}

const backToServicePage = () => {
  makeAllContainerDisplayNone();
  document.getElementById("services-container").style.display = "flex";
};
