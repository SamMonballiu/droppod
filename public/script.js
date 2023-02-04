const form = document.getElementById("form");

form.addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();
  const files = document.getElementById("files");
  const formData = new FormData();
  
  for (let i = 0; i < files.files.length; i++) {
    formData.append("files", files.files[i]);
  }

  const url = `${window.location.href}upload_files`;
  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((res) => console.log(res))
    .catch((err) => ("Error occured", err));
}
