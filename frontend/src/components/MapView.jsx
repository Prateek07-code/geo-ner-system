import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function MapViewport({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lon], 10);
      return;
    }

    const bounds = locations.map((location) => [
      location.lat,
      location.lon,
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 10,
    });
  }, [map, locations]);

  return null;
}

function MapView({ entities = [] }) {
  const locations = entities
    .filter((entity) => {
      const resolved = entity?.resolved;

      return (
        resolved &&
        Number.isFinite(resolved.lat) &&
        Number.isFinite(resolved.lon) &&
        resolved.lat >= -90 &&
        resolved.lat <= 90 &&
        resolved.lon >= -180 &&
        resolved.lon <= 180
      );
    })
    .map((entity, index) => {
      const resolved = entity.resolved;

      return {
        id: `${entity.text}-${index}`,
        name: entity.text,
        state: resolved.state,
        district: resolved.district,
        lat: resolved.lat,
        lon: resolved.lon,
        confidence: resolved.confidence,
      };
    });

  return (
    <section className="overflow-hidden rounded-2xl border border-geo-blue/15 bg-white shadow-sm">
      <div className="border-b border-geo-blue/15 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-geo-orange/65">
          Geospatial Resolution
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">
          Resolved coordinates from extracted place entities
        </h2>
      </div>

      <div className="h-[420px] w-full">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewport locations={locations} />

          {locations.map((location) => (
            <Marker key={location.id} position={[location.lat, location.lon]}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-navy">{location.name}</p>
                  <p className="text-geo-blue/80">
                    {location.district}, {location.state}
                  </p>
                  <p className="font-medium text-geo-orange">
                    Confidence:{" "}
                    {Number.isFinite(location.confidence)
                      ? `${Math.round(location.confidence * 100)}%`
                      : "N/A"}
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
