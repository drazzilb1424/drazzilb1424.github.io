function searchPSAOrder() {
  const input = document.getElementById("psa-lookup").value.trim();

  const orderPages = {

    "337": "/submissions/psa-tracker-order-337.html",
    "852": "/submissions/psa-tracker-order-852.html",
    "115": "/submissions/psa-tracker-order-115.html",
    "097": "/submissions/psa-tracker-order-097.html",
    "674": "/submissions/psa-tracker-order-674.html",
    "670": "/submissions/psa-tracker-order-670.html",
    "676": "/submissions/psa-tracker-order-676.html",
    "718": "/submissions/psa-tracker-order-718.html",
    "536": "/submissions/psa-tracker-order-536.html",
    "182": "/submissions/psa-tracker-order-182.html",
    "605": "/submissions/psa-tracker-order-605.html",
    "606": "/submissions/psa-tracker-order-606.html",
    "607": "/submissions/psa-tracker-order-607.html",
    "608": "/submissions/psa-tracker-order-608.html",
    "220": "/submissions/psa-tracker-order-220.html",
    "222": "/submissions/psa-tracker-order-222.html",
    "867": "/submissions/psa-tracker-order-867.html",
    "868": "/submissions/psa-tracker-order-868.html",
    "869": "/submissions/psa-tracker-order-869.html",
    "000": "/submissions/psa-tracker-order-000.html",
    "001": "/submissions/psa-tracker-order-001.html",
    "166": "/submissions/psa-tracker-order-166.html",
    "203": "/submissions/psa-tracker-order-203.html",
    "949": "/submissions/psa-tracker-order-949.html",
    "995": "/submissions/psa-tracker-order-995.html",
    "996": "/submissions/psa-tracker-order-996.html",
    "999": "/submissions/psa-tracker-order-999.html",
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

