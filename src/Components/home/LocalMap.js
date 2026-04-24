import React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

const LOCATION = {
  lat: -22.93476,
  lng: -43.32685,
  name: "CB Vittoria Sports",
  street: "Estr. dos Três Rios, 2110",
  district: "Freguesia (Jacarepaguá)",
  city: "Rio de Janeiro · RJ",
  cep: "22745-005",
};

const markerIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [38, 38],
});

const MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;
const WAZE_URL = `https://waze.com/ul?ll=${LOCATION.lat},${LOCATION.lng}&navigate=yes`;

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true">
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LocalMap() {
  return (
    <section className="local">
      <header className="local__head">
        <span className="local__eyebrow">Local oficial · 4ª etapa</span>
        <h2 className="local__title">
          ONDE <em>ROLA</em>
        </h2>
        <p className="local__lead">
          Toda a competição acontece nas quadras do CB Vittoria Sports,
          referência em futevôlei na Zona Oeste do Rio.
        </p>
      </header>

      <article className="local__card">
        <div className="local__map">
          <MapContainer
            center={[LOCATION.lat, LOCATION.lng]}
            zoom={17}
            className="local__map-container"
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
          <div className="local__map-fade" aria-hidden="true" />
        </div>

        <div className="local__info">
          <div className="local__info-head">
            <span className="local__pin"><PinIcon /></span>
            <div>
              <span className="local__kicker">Endereço</span>
              <h3 className="local__name">{LOCATION.name}</h3>
            </div>
          </div>

          <address className="local__address">
            <span>{LOCATION.street}</span>
            <span>{LOCATION.district}</span>
            <span>{LOCATION.city} · CEP {LOCATION.cep}</span>
          </address>

          <div className="local__actions">
            <a className="local-btn local-btn--primary" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              <span>Traçar rota · Google Maps</span>
              <ArrowIcon />
            </a>
            <a className="local-btn local-btn--ghost" href={WAZE_URL} target="_blank" rel="noopener noreferrer">
              <span>Abrir no Waze</span>
              <ArrowIcon />
            </a>
          </div>
        </div>
      </article>

      <style>{`
        .local {
          position: relative;
          padding: 56px 16px 72px;
          max-width: 1080px;
          margin: 0 auto;
        }
        .local__head {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        .local__eyebrow {
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f4b223;
        }
        .local__title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: clamp(38px, 7vw, 64px);
          line-height: 0.9;
          letter-spacing: 0.04em;
          color: #fff;
          margin: 0;
        }
        .local__title em {
          font-style: normal;
          background: linear-gradient(90deg, #fcd462, #f4b223);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .local__lead {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(239, 234, 255, 0.7);
          max-width: 520px;
          margin: 0;
        }

        .local__card {
          position: relative;
          display: grid;
          grid-template-columns: 1fr;
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(160deg, rgba(26, 15, 46, 0.95), rgba(13, 7, 23, 0.95));
          border: 1px solid rgba(244, 178, 35, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 30px 60px -30px rgba(0, 0, 0, 0.7);
        }
        @media (min-width: 880px) {
          .local__card { grid-template-columns: 1.4fr 1fr; }
        }

        .local__map {
          position: relative;
          height: 380px;
        }
        @media (min-width: 880px) {
          .local__map { height: 100%; min-height: 420px; }
        }
        .local__map-container {
          height: 100%;
          width: 100%;
          filter: saturate(0.85) contrast(0.95);
        }
        .local__map-fade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, transparent 70%, rgba(13, 7, 23, 0.6));
        }

        .local__info {
          padding: 28px 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: linear-gradient(180deg, transparent, rgba(244, 178, 35, 0.04));
          border-top: 1px dashed rgba(244, 178, 35, 0.2);
        }
        @media (min-width: 880px) {
          .local__info {
            border-top: none;
            border-left: 1px dashed rgba(244, 178, 35, 0.2);
            padding: 32px 28px;
          }
        }

        .local__info-head {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .local__pin {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(244, 178, 35, 0.12);
          border: 1px solid rgba(244, 178, 35, 0.4);
          color: #fcd462;
          flex-shrink: 0;
        }
        .local__kicker {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(239, 234, 255, 0.55);
          display: block;
        }
        .local__name {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: 26px;
          letter-spacing: 0.05em;
          color: #fff;
          margin: 2px 0 0;
        }

        .local__address {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-style: normal;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(239, 234, 255, 0.72);
          padding-left: 56px;
        }

        .local__actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }

        .local-btn {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 11px;
          font-family: 'Sora', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease;
        }
        .local-btn:hover { transform: translateY(-2px); }
        .local-btn:focus-visible { outline: 2px solid #f4b223; outline-offset: 3px; }

        .local-btn--primary {
          background: linear-gradient(135deg, #fcd462, #f4b223 60%, #d99413);
          color: #1a0f00;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 12px 28px -14px rgba(244, 178, 35, 0.7);
        }

        .local-btn--ghost {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.14);
        }
        .local-btn--ghost:hover {
          background: rgba(244, 178, 35, 0.08);
          border-color: rgba(244, 178, 35, 0.5);
          color: #fcd462;
        }

        /* Leaflet popup overrides */
        .local :global(.leaflet-popup-content-wrapper),
        .local .leaflet-popup-content-wrapper {
          background: #0a0710;
          color: #fff;
          border: 1px solid rgba(244, 178, 35, 0.4);
          border-radius: 8px;
          font-family: 'Sora', sans-serif;
        }
        .local .leaflet-popup-tip { background: #0a0710; }
      `}</style>
    </section>
  );
}
