import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapView({ entities }) {
  const locations = entities
    .filter(
      (entity) =>
        entity.resolved &&
        typeof entity.resolved.lat === "number" &&
        typeof entity.resolved.lon === "number"
    )
    .map((entity, index) => ({
      id: `${entity.text}-${index}`,
      name: entity.text,
      state: entity.resolved.state,
      district: entity.resolved.district,
      lat: entity.resolved.lat,
      lon: entity.resolved.lon,
      confidence: entity.resolved.confidence
    }));

  const defaultCenter = [20.5937, 78.9629];

  const center =
    locations.length > 0
      ? [locations[0].lat, locations[0].lon]
      : defaultCenter;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Geographic View
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Resolved Locations on Map
        </h2>
      </div>

      <div className="h-[420px] w-full">
        <MapContainer
          center={center}
          zoom={locations.length > 0 ? 10 : 5}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lon]}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{location.name}</p>

                  <p className="text-sm">
                    {location.district}, {location.state}
                  </p>

                  <p className="text-sm">
                    Confidence:{" "}
                    {Math.round(location.confidence * 100)}%
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

export default MapView;