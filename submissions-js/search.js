function searchPSAOrder() {
  const input = document.getElementById("psa-lookup").value.trim();

  const orderPages = {
    "220": "/submissions/psa-tracker-order-220.html",
    "868": "/submissions/psa-tracker-order-868.html",
    "869": "/submissions/psa-tracker-order-869.html",
    "000": "/submissions/psa-tracker-order-000.html",
    "001": "/submissions/psa-tracker-order-001.html",
    "203": "/submissions/psa-tracker-order-203.html",
    "949": "/submissions/psa-tracker-order-949.html",
    "996": "/submissions/psa-tracker-order-996.html",
    "999": "/submissions/psa-tracker-order-999.html",
    "038": "/submissions/psa-tracker-order-038.html",
    "907": "/submissions/psa-tracker-order-907.html",
    "908": "/submissions/psa-tracker-order-908.html",
    "909": "/submissions/psa-tracker-order-909.html",
    "911": "/submissions/psa-tracker-order-911.html",
    "625": "/submissions/psa-tracker-order-625.html",
    "626": "/submissions/psa-tracker-order-626.html",
    "627": "/submissions/psa-tracker-order-627.html",
    "161": "/submissions/psa-tracker-order-161.html",
    "239": "/submissions/psa-tracker-order-239.html",
    "259": "/submissions/psa-tracker-order-259.html",
    "275": "/submissions/psa-tracker-order-275.html",
    "297": "/submissions/psa-tracker-order-297.html",
    "715": "/submissions/psa-tracker-order-715.html",
    "721": "/submissions/psa-tracker-order-721.html",
    "270": "/submissions/psa-tracker-order-270.html",
    "296": "/submissions/psa-tracker-order-296.html",
    "333": "/submissions/psa-tracker-order-333.html",
    "396": "/submissions/psa-tracker-order-396.html",
    "562": "/submissions/psa-tracker-order-562.html",
    "210": "/submissions/psa-tracker-order-210.html",
    "526": "/submissions/psa-tracker-order-526.html",
    "872": "/submissions/psa-tracker-order-872.html",
    "998": "/submissions/psa-tracker-order-998.html",
    "423": "/submissions/psa-tracker-order-423.html",
    "456": "/submissions/psa-tracker-order-456.html",
    "858": "/submissions/psa-tracker-order-858.html",
    "891": "/submissions/psa-tracker-order-891.html",
    "903": "/submissions/psa-tracker-order-903.html",
    "428": "/submissions/psa-tracker-order-428.html",
    "431": "/submissions/psa-tracker-order-431.html",
    "718": "/submissions/psa-tracker-order-718.html",
    "786": "/submissions/psa-tracker-order-786.html",
    "151": "/submissions/psa-tracker-order-151.html",
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
