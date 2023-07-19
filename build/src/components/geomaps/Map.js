import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TiffLayer from './TiffLayers';
import NCLayer from './NCLayers';
import ShapeFileLayer from './ShapeFileLayers';
import './Map.css';
import L from 'leaflet';

// MapLayers Component: handles displaying GeoTiff and Polygon layers
function MapLayers({ selectedFiles, polygons }) {
  const [previousFiles, setPreviousFiles] = useState([]);
  const [legendAction, setLegendAction] = useState(null);

  const map = useMap();

  const options = {
    resolution: 255,
    opacity: 0.4,
  };

  // Memoized setLegend function to prevent re-creation on each render
  const setLegend = useCallback((option, layerLegend) => {
    setLegendAction({ option, layerLegend });
  }, []);

  useEffect(() => {
    // Identify removed files by comparing previousFiles and selectedFiles
    const removedFiles = previousFiles.filter(
      (prevFile) =>
        !selectedFiles.some((newFile) => (typeof newFile === 'string' ? JSON.parse(newFile).id : newFile.id) === prevFile.id),
    );

    // Remove layers of removed files
    if (removedFiles.length > 0) {
      removedFiles.forEach((file) => {
        if (file.type === 'tiff' || file.type === 'tif' || file.type === 'zip') {
          map.eachLayer((layer) => {
            if (layer.id === file.id) {
              map.removeLayer(layer);
            }
          });
        } else if (file.type === 'nc') {
          map.eachLayer((layer) => {
            if (layer.options.id === file.id) {
              map.removeLayer(layer);
            }
          });
        }
        setLegend('remove', { id: file.id });
      });
    }

    // Update previousFiles with the current selectedFiles
    setPreviousFiles(selectedFiles.map((file) => (typeof file === 'string' ? JSON.parse(file) : file)));
  }, [selectedFiles, map]);

  return (
    <>
      {selectedFiles.map((file) => {
        const parsedFile = typeof file === 'string' ? JSON.parse(file) : file;
        if (parsedFile.type === 'tif' || parsedFile.type === 'tiff') {
          return (
            <TiffLayer key={parsedFile.id} id={parsedFile.id} url={parsedFile.url} options={options} setLegend={setLegend} />
          );
        } else if (parsedFile.type === 'nc') {
          return <NCLayer key={parsedFile.id} id={parsedFile.id} url={parsedFile.url} options={options} setLegend={setLegend} />;
        } else if (parsedFile.type === 'zip') {
          return (
            <ShapeFileLayer key={parsedFile.id} id={parsedFile.id} url={parsedFile.url} options={options} setLegend={setLegend} />
          );
        }
        return null;
      })}

      {polygons.map((polygon, index) => (
        <Polygon key={index} positions={polygon.coordinates} />
      ))}
      <MapLegend map={map} legendAction={legendAction} />
    </>
  );
}

// MapLegend Component: displays legend for GeoTiff and Polygon layers
function MapLegend({ map, legendAction }) {
  useEffect(() => {
    if (!map) return;

    const legend = L.control({ position: 'topright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<h4>Map Legend</h4>';
      return div;
    };

    legend.addTo(map);
    map.legendControl = legend;

    return () => {
      if (map.legendControl) {
        map.legendControl.remove();
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map || !map.legendControl || !legendAction) return;

    const { option, layerLegend } = legendAction;
    const legendDiv = map.legendControl.getContainer();

    if (option === 'add' && layerLegend) {
      const layerDiv = document.createElement('div');
      layerDiv.id = `legend-item-${layerLegend.id}`;
      layerDiv.innerHTML = `
      <div>
        <strong style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 450px; display: inline-block;" title="${layerLegend.title}">
          ${layerLegend.title}
        </strong>
      </div>
      <div>
        ${layerLegend.text}
      </div>
    `;
      legendDiv.appendChild(layerDiv);
    } else if (option === 'remove' && layerLegend) {
      const layerDiv = document.getElementById(`legend-item-${layerLegend.id}`);
      if (layerDiv) {
        legendDiv.removeChild(layerDiv);
      }
    }
  }, [legendAction, map]);

  return null;
}

// GeoMap Component: renders the map and sets the initial view
export default function GeoMap({ selectedFiles, polygons = [], zoomSize }) {
  const [center, setCenter] = useState([54.526, 15.2551]);
  const map = useRef(null);

  useEffect(() => {
    // Calculate center based on polygons if they are available
    if (polygons.length > 0) {
      const latitudes = polygons.flatMap((polygon) => polygon.coordinates.map((coord) => coord[0]));
      const longitudes = polygons.flatMap((polygon) => polygon.coordinates.map((coord) => coord[1]));
      const avgLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
      const avgLon = longitudes.reduce((sum, lon) => sum + lon, 0) / longitudes.length;
      setCenter([avgLat, avgLon]);
    }
  }, [polygons]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <MapContainer style={{ width: '100%', height: '100%' }} center={center} zoom={zoomSize} scrollWheelZoom={true} ref={map}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">EO4EU</a> Consortium'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <TileLayer url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' maxZoom={20} subdomains={['mt1', 'mt2', 'mt3']} />
        <MapLayers selectedFiles={selectedFiles} polygons={polygons} />
      </MapContainer>
    </div>
  );
}
