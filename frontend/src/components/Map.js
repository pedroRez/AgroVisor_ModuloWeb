import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const MapComponent = () => {
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (L.DomUtil.get("map") !== null) {
      L.DomUtil.get("map")._leaflet_id = null;
    }

    const map = L.map("map", {
      center: [-20.3702, -42.5189], // Pains / Sumidouro / MG
      zoom: 16,
      zoomControl: true,
      dragging: true,
    });

    const esriSat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri",
      }
    );

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    });

    esriSat.addTo(map); // ESRI como padrão

    const baseMaps = {
      "Satélite ESRI": esriSat,
      "Mapa Padrão (OSM)": osm,
    };
    L.control.layers(baseMaps).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: true,
      },
    });
    map.addControl(drawControl);

    map.on("moveend", () => {
      const center = map.getCenter();
      setCoordinates({ lat: center.lat.toFixed(6), lng: center.lng.toFixed(6) });
    });

    map.on(L.Draw.Event.CREATED, async function (event) {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      const geojson = layer.toGeoJSON();
      const nome = prompt("Nome do Pasto:");
      const body = {
        nome: nome || "Sem nome",
        geojson: geojson.geometry,
      };
      await fetch("http://localhost:8000/pastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      alert("Pasto enviado!");
    });

    fetch("http://localhost:8000/pastos")
      .then((res) => res.json())
      .then((data) => {
        data.forEach((pasto) => {
          const layer = L.geoJSON(pasto.geojson);
          layer.bindPopup(pasto.nome);
          layer.addTo(drawnItems);
        });
      });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <div id="map" style={{ height: "100%", width: "100%" }}></div>
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(255,255,255,0.8)",
          padding: "5px 10px",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        Coordenadas do centro: {coordinates.lat}, {coordinates.lng}
      </div>
    </div>
  );
};

export default MapComponent;
