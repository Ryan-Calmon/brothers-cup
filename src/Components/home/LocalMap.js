import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Card } from "../../Components/ui";

const LOCATION = {
  lat: -22.93476,
  lng: -43.32685,
  name: "CB Vittoria Sports",
  address:
    "CB Vittoria Sports - Estr. dos Três Rios, 2110 - Freguesia (Jacarepaguá), Rio de Janeiro - RJ, 22745-005",
};

const markerIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [38, 38],
});

export default function LocalMap() {
  return (
    <section className="px-4 py-12 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        📍 Local do Torneio
      </h2>

      <Card className="overflow-hidden">
        <div className="h-[400px] w-full">
          <MapContainer
            center={[LOCATION.lat, LOCATION.lng]}
            zoom={17}
            className="h-full w-full"
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[LOCATION.lat, LOCATION.lng]} icon={markerIcon}>
              <Popup>{LOCATION.name}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="p-4 text-center">
          <p className="text-brand-200 text-sm">{LOCATION.address}</p>
        </div>
      </Card>
    </section>
  );
}
