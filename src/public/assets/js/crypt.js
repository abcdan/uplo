function generateRandomSecret() {
  console.log("Generating random secret...");
  let array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  let secret = array;
  console.log("Generated secret: ", secret);
  return secret;
}

function mergeSecretAndIvToBase64(secret, iv) {
  console.log("Merging secret and iv and converting to base64...");
  console.log("Secret: ", secret);
  console.log("Iv: ", iv);
  let merged = btoa(
    "S|" +
      String.fromCharCode.apply(null, secret) +
      "|I|" +
      String.fromCharCode.apply(null, new Uint8Array(iv))
  );
  console.log("Merged and converted secret and iv: ", merged);
  return merged;
}

function splitBase64ToSecretAndIv(merged) {
  console.log("Splitting base64 to secret and iv...");
  let decodedMerged = atob(merged);
  console.log("Decoded merged secret and iv: ", decodedMerged);

  let split = decodedMerged.split("|");
  let secret, iv;
  if (typeof split[1] === "string") {
    console.log("Split[1]: ", split[1]);
    secret = new Uint8Array(split[1].split("").map((c) => c.charCodeAt(0)));
  }
  if (typeof split[3] === "string") {
    console.log("Split[3]: ", split[3]);
    iv = new Uint8Array(split[3].split("").map((c) => c.charCodeAt(0)));
  }
  console.log("Converted secret: ", secret);
  console.log("Converted iv: ", iv);
  return { secret, iv };
}

async function encryptFile(file, secret) {
  console.log("Encrypting file: ", file);
  let data = new Uint8Array(file);
  let key = await window.crypto.subtle.importKey(
    "raw",
    secret,
    { name: "AES-GCM", length: 128 },
    false,
    ["encrypt", "decrypt"]
  );
  let iv = window.crypto.getRandomValues(new Uint8Array(12));
  let encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );
  console.log("Encrypted data: ", encryptedData);
  console.log("Iv: ", iv);
  return { encryptedData, iv };
}

async function decryptFile(encryptedData, secret, iv) {
  console.log("Decrypting file with secret: ", secret);
  let key = await window.crypto.subtle.importKey(
    "raw",
    secret,
    { name: "AES-GCM", length: 128 },
    false,
    ["encrypt", "decrypt"]
  );
  try {
    console.log("Key for decryption: ", key);
    let decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedData
    );
    console.log("Decrypted data: ", decryptedData);
    return decryptedData;
  } catch (error) {
    console.error("Error during decryption: ", error);
  }
}
