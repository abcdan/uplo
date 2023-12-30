function downloadFile(fileName, x) {
  console.log(
    "Starting downloadFile function with fileName: ",
    fileName,
    " and x: ",
    x
  );
  fetch(`/api/download/${fileName}`).then((response) => {
    console.log("Response from fetch: ", response);
    response.arrayBuffer().then((encryptedData) => {
      console.log("Encrypted data: ", encryptedData);
      const { secret, iv } = splitBase64ToSecretAndIv(x);
      decryptFile(encryptedData, secret, iv).then((decryptedData) => {
        console.log("Decrypted data: ", decryptedData);
        const blob = new Blob([decryptedData], {
          type: "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        console.log("Blob URL: ", url);

        window.open(url, "_blank");
      });
    });
  });
}

function dropHandler(e) {
  e.preventDefault();
  e.stopPropagation();

  let file = e.dataTransfer.files[0];
  let reader = new FileReader();
  let secret = generateRandomSecret();
  reader.onload = function (event) {
    let data = new Uint8Array(event.target.result);
    encryptFile(data, secret).then((data) => {
      const { encryptedData, iv } = data;
      let formData = new FormData();
      let randomFileName =
        Math.random().toString(36).substring(2, 34) +
        "." +
        file.name.split(".").pop();
      formData.append("file", new Blob([encryptedData]), randomFileName);
      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          Swal.fire({
            title: "Success!",
            text: data.url + "&x=" + mergeSecretAndIvToBase64(secret, iv),
            icon: "success",
            confirmButtonText: "Copy to Clipboard",
          }).then((result) => {
            if (result.isConfirmed) {
              navigator.clipboard.writeText(
                data.url + "&x=" + mergeSecretAndIvToBase64(secret, iv)
              );
            }
          });
        });
    });
  };
  reader.readAsArrayBuffer(file);
}

function dragOverHandler(e) {
  e.preventDefault();
  e.stopPropagation();
}
