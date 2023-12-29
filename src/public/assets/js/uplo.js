async function downloadFile(fileName, secret) {
  const response = await fetch(`/api/download/${fileName}`);
  const encryptedData = await response.arrayBuffer();
  const decryptedData = await decryptFile(
    encryptedData,
    base64ToSecret(secret)
  );
  const blob = new Blob([decryptedData], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function dropHandler(e) {
  e.preventDefault();
  e.stopPropagation();

  let file = e.dataTransfer.files[0];
  let reader = new FileReader();
  let secret = generateRandomSecret();
  reader.onload = function (event) {
    let data = new Uint8Array(event.target.result);
    encrypt(data, secret).then((encryptedData) => {
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
          const b64s = secretToBase64(secret);
          Swal.fire({
            title: "Success!",
            text: data.url + "?s=" + b64s,
            icon: "success",
            confirmButtonText: "Copy to Clipboard",
          }).then((result) => {
            if (result.isConfirmed) {
              navigator.clipboard.writeText(data.url + "?s=" + b64s);
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

document.getElementById("fileArea").addEventListener("click", function () {
  let input = document.createElement("input");
  input.type = "file";
  input.onchange = (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();
    let secret = generateRandomSecret();
    reader.onload = function (event) {
      let data = new Uint8Array(event.target.result);
      encrypt(data, secret).then((encryptedData) => {
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
              text: data.url + "?s=" + secret,
              icon: "success",
              confirmButtonText: "Copy to Clipboard",
            }).then((result) => {
              if (result.isConfirmed) {
                navigator.clipboard.writeText(data.url + "?s=" + secret);
              }
            });
          });
      });
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
});
