function generateRandomSecret() {
  console.log("Generating random secret...");
  let array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  let secret = array;
  console.log("Generated secret: ", secret);
  return secret;
}

function secretToBase64(secret) {
  console.log("Converting secret to base64...");
  let secretAsString = Array.from(secret)
    .map((b) => String.fromCharCode(b))
    .join("");
  let encodedSecret = btoa(secretAsString);
  console.log("Converted secret: ", encodedSecret);
  return encodedSecret;
}

function base64ToSecret(encodedSecret) {
  console.log("Converting base64 to Uint8Array...");
  try {
    let secretAsString = atob(encodedSecret);
    let bytes = new Uint8Array(
      secretAsString.split("").map((c) => c.charCodeAt(0))
    );
    console.log("Converted secret: ", bytes);
    return bytes;
  } catch (e) {
    console.error(
      "Failed to decode base64 string. Please ensure it is correctly encoded: ",
      e
    );
    return null;
  }
}

async function encrypt(data, secret) {
  console.log("Encrypting data with secret: ", secret);
  let key = await window.crypto.subtle.importKey(
    "raw",
    secret,
    { name: "AES-GCM", length: 128 },
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
    console.log("File loaded, starting encryption...");
    let data = new Uint8Array(event.target.result);
    let encryptedData = await encrypt(data, secret);
    console.log("File encrypted.");
    return { file: encryptedData, secret: secretToBase64(secret) };
  };
  reader.readAsArrayBuffer(file);
}

async function decryptFile(encryptedData, secretBase64) {
  console.log("Decrypting data with secret: ", secretBase64);
  let secret = base64ToSecret(secretBase64);
  let key = await window.crypto.subtle.importKey(
    "raw",
    secret,
    { name: "AES-GCM", length: 128 },
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
