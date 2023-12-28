function dropHandler(e) {
  e.preventDefault();
  e.stopPropagation();

  let file = e.dataTransfer.files[0];
  let reader = new FileReader();
  reader.onload = function (event) {
    let data = new Uint8Array(event.target.result);
    encrypt(data, generateRandomSecret()).then((encryptedData) => {
      let formData = new FormData();
      let randomFileName =
        Math.random().toString(36).substring(2, 34) +
        "." +
        file.name.split(".").pop();
      formData.append("file", new Blob([encryptedData]), randomFileName);
      fetch("/api/upload", {
        method: "POST",
        body: formData,
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
    reader.onload = function (event) {
      let data = new Uint8Array(event.target.result);
      encrypt(data, generateRandomSecret()).then((encryptedData) => {
        let formData = new FormData();
        let randomFileName =
          Math.random().toString(36).substring(2, 34) +
          "." +
          file.name.split(".").pop();
        formData.append("file", new Blob([encryptedData]), randomFileName);
        fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      });
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
});
