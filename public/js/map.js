let mapToken = mapKey;
maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: "map", // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});
const marker = new maptilersdk.Marker()
  .setLngLat(coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: 24, className: "my-class" }).setHTML(
      `<p><b> ${listingLocation}</b> Exact location will be preovided on booking</p>`
    )
  )
  .addTo(map);
let attribElement = document.querySelector(".maplibregl-control-container");

if (attribElement) {
  attribElement.style.display = "none";
}

// const gc = new maptilersdkMaptilerGeocoder.GeocodingControl({
//   country: ["DE", "FR"]
// });
// map.addControl(gc, "top-left");
