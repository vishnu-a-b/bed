import L from "leaflet";

// Define a custom icon
export const hospitalIcon = L.icon({
  iconUrl: "/icons/hospital.png", // URL of the custom marker image
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Point of the icon that corresponds to the marker's location
  popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
});

export const carIcon = L.icon({
    iconUrl: "/icons/car2.png", // URL of the custom marker image
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Point of the icon that corresponds to the marker's location
    popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
  });

export const userIcon = L.icon({
    iconUrl: "/icons/user.png", // URL of the custom marker image
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Point of the icon that corresponds to the marker's location
    popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
  });