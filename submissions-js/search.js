function searchPSAOrder() {
  const input = document.getElementById("psa-lookup").value.trim();

  const orderPages = {
    "018": "/submissions/psa-tracker-order-018/",
    "161": "/submissions/psa-tracker-order-161.html",
    "257": "/submissions/psa-tracker-order-257.html",
    "278": "/submissions/psa-tracker-order-278.html",
    "757": "/submissions/psa-tracker-order-757.html",
    "781": "/submissions/psa-tracker-order-781.html",
    "878": "/submissions/psa-tracker-order-878.html",
    "847": "/submissions/psa-tracker-order-847.html",
    "854": "/submissions/psa-tracker-order-854.html",
    "382": "/submissions/psa-tracker-order-382.html",
    "337": "/submissions/psa-tracker-order-337.html",
    "241": "/submissions/psa-tracker-order-241.html",
    "170": "/submissions/psa-tracker-order-170.html",
    "008": "/submissions/psa-tracker-order-008.html",
    "213": "/submissions/psa-tracker-order-213.html",
    "311": "/submissions/psa-tracker-order-311.html",
    "449": "/submissions/psa-tracker-order-449.html",
    "852": "/submissions/psa-tracker-order-852.html",
    "902": "/submissions/psa-tracker-order-902.html",
  };

  if (orderPages[input]) {
    window.location.href = orderPages[input];
  } else {
    window.location.href = "/submission-not-found.html"; // Redirect to not found page
  }
}

function searchPSACert() {
  const certNumber = document.getElementById("psa-cert-lookup").value.trim();
  if (certNumber) {
    // Example: redirect to your cert lookup page with cert as query param
    window.location.href = `/psa-cert.html?cert=${certNumber}`;
  } else {
    alert("Please enter a valid cert number.");
  }
}

function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';

}
