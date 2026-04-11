import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useLeafletIcons } from "../utils/leafletIcons";

const shopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const agentIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const DEFAULT_CENTER = [20.5937, 78.9629];

export default function DeliveryMap({ order, agentLocation }) {
  useLeafletIcons();

  const shopCoords = order?.shopId?.coords;
  const hasShop = shopCoords?.lat && shopCoords?.lng;

  const center = hasShop
    ? [shopCoords.lat, shopCoords.lng]
    : DEFAULT_CENTER;

  const routeLine =
    hasShop && agentLocation
      ? [
          [agentLocation.lat, agentLocation.lng],
          [shopCoords.lat, shopCoords.lng],
        ]
      : null;

  return (
    <MapContainer
      center={center}
      zoom={hasShop ? 14 : 5}
      style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hasShop ? (
        <Marker position={[shopCoords.lat, shopCoords.lng]} icon={shopIcon}>
          <Popup>
            <p className="font-medium">{order.shopId.name}</p>
            <p className="text-xs text-slate-500">{order.shopId.address}</p>
            <p className="text-xs font-medium text-blue-600">Pickup point</p>
          </Popup>
        </Marker>
      ) : null}

      {agentLocation ? (
        <Marker position={[agentLocation.lat, agentLocation.lng]} icon={agentIcon}>
          <Popup>
            <p className="font-medium">Your location</p>
          </Popup>
        </Marker>
      ) : null}

      {routeLine ? (
        <Polyline positions={routeLine} color="#0f172a" weight={3} dashArray="6 4" />
      ) : null}
    </MapContainer>
  );
}
