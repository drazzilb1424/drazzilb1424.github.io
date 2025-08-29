function searchPSAOrder() {
  const input = document.getElementById("psa-lookup").value.trim();

  const orderPages = {
    "018": "/submissions/psa-tracker-order-018/",
    "161": "/submissions/psa-tracker-order-161.html",
    "202": "/submissions/psa-tracker-order-202.html",
    "240": "/submissions/psa-tracker-order-240.html",
    "257": "/submissions/psa-tracker-order-257.html",
    "258": "/submissions/psa-tracker-order-258.html",
    "278": "/submissions/psa-tracker-order-278.html",
    "385": "/submissions/psa-tracker-order-385.html",
    "418": "/submissions/psa-tracker-order-418.html",
    "463": "/submissions/psa-tracker-order-463.html",
    "484": "/submissions/psa-tracker-order-484.html",
    "538": "/submissions/psa-tracker-order-538.html",
    "581": "/submissions/psa-tracker-order-581.html",
    "695": "/submissions/psa-tracker-order-695.html",
    "701": "/submissions/psa-tracker-order-701.html",
    "757": "/submissions/psa-tracker-order-757.html",
    "781": "/submissions/psa-tracker-order-781.html",
    "878": "/submissions/psa-tracker-order-878.html",
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