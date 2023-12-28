function generateRandomSecret() {
  console.log("Generating random secret...");
  let array = new Uint8Array(16); // Changed from 20 to 16 to generate a 128-bit key
  window.crypto.getRandomValues(array);
  let secret = array;
  console.log("Generated secret: ", secret);
  return secret;
}

async function encrypt(data, secret) {
  console.log("Encrypting data with secret: ", secret);
  let key = await window.crypto.subtle.importKey(
    "raw",
    secret,
    { name: "AES-GCM", length: 128 }, // Added length property
    false,
    ["encrypt", "decrypt"]
  );
  let encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: window.crypto.getRandomValues(new Uint8Array(12)),
    },
    key,
    data
  );
  console.log("Encrypted data: ", encryptedData);
  return encryptedData;
}

function encryptFile(file) {
  console.log("Encrypting file: ", file);
  let secret = generateRandomSecret();
  let reader = new FileReader();
  reader.onload = async function (event) {
    // Made the function async
    console.log("File loaded, starting encryption...");
    let data = new Uint8Array(event.target.result);
    let encryptedData = await encrypt(data, secret); // Await the encrypt function
    console.log("File encrypted.");
    return { file: encryptedData, secret: secret };
  };
  reader.readAsArrayBuffer(file);
}

async function decryptFile(encryptedData, secret) {
  console.log("Decrypting data with secret: ", secret);
  let key = await window.crypto.subtle.importKey(
    "raw",
    secret,
    { name: "AES-GCM", length: 128 }, // Added length property
    false,
    ["encrypt", "decrypt"]
  );
  let decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: window.crypto.getRandomValues(new Uint8Array(12)),
    },
    key,
    encryptedData
  );
  console.log("Decrypted data: ", decryptedData);
  return decryptedData;
}
