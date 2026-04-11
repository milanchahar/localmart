import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { useLeafletIcons } from "../utils/leafletIcons";

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export default function ShopsMap({ shops }) {
  useLeafletIcons();

  const withCoords = shops.filter(
    (s) => s.coords?.lat && s.coords?.lng
  );

  const center =
    withCoords.length > 0
      ? [withCoords[0].coords.lat, withCoords[0].coords.lng]
      : DEFAULT_CENTER;

  const zoom = withCoords.length > 0 ? 13 : DEFAULT_ZOOM;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "320px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((shop) => (
        <Marker key={shop._id} position={[shop.coords.lat, shop.coords.lng]}>
          <Popup>
            <div>
              <p className="font-medium">{shop.name}</p>
              <p className="text-xs text-slate-500">{shop.category}</p>
              <p className="text-xs text-slate-500">{shop.address}</p>
              <Link
                to={`/shop/${shop._id}`}
                className="mt-1 block text-xs text-blue-600 underline"
              >
                View shop
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {withCoords.length === 0 ? null : null}
    </MapContainer>
  );
}
