document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("skill-form");
  form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      alert("Please fill in all required fields correctly.");
    }
    form.classList.add("was-validated");
  });

  // Scroll to results on load if available
  const results = document.querySelector(".results");
  if (results) {
    results.scrollIntoView({ behavior: "smooth" });
  }
});
