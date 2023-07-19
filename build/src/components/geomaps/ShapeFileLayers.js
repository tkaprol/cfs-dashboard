import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import shp from 'shpjs';

const ShapeFileLayer = ({ id, url, options, setLegend }) => {
  const map = useMap();
  const layerRef = useRef(null);
  useEffect(() => {
    if (layerRef[id]) {
      return;
    }
    const geo = L.geoJson(null, {
      style: () => ({
        color: options.color || '#3388ff',
        weight: options.weight || 2,
        opacity: options.opacity || 0.6,
      }),
      onEachFeature: (feature, layer) => {
        const properties = feature.properties || {};
        const popupContent = Object.entries(properties)
          .map(([key, value]) => `${key}: ${value}`)
          .join('<br />');
        layer.bindPopup(popupContent);
      },
    });
    geo.id = id;
    geo.addTo(map);
    layerRef[id] = geo;
    shp(url).then((data) => {
      if (layerRef[id] && data) {
        geo.addData(data);
        const bounds = geo.getBounds();
        map.fitBounds(bounds);
        if (setLegend) {
          setLegend('add', {
            id,
            title: `Shapefile Layer ${id}`,
            text: `Data from ${url}`,
          });
        }
      }
    });
    // Cleanup function: remove layer from the map on unmount
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }

      // Remove legend entry for the shapefile layer
      if (setLegend) {
        setLegend('remove', { id });
      }
    };
  }, [id, url, options, map, setLegend]);

  return null;
};

export default ShapeFileLayer;
