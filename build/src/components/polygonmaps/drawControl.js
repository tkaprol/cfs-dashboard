import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { FeatureGroup, useMap } from 'react-leaflet';
import EditControl from './EditControl';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Modal, Button } from 'antd';

export default function DrawControl({ isActive, polygon, onCordsChange, setDrawnItems }) {
  const map = useMap();
  const _editableFG = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('The edited shape is outside the permitted bounds');

  // Convert Leaflet GeoJSON coordinates to [lng, lat] format
  const extractCoordinates = (layer) => {
    try {
      const geojson = layer.toGeoJSON();
      if (geojson && geojson.geometry) {
        if (geojson.geometry.type === 'Polygon') {
          // Convert Leaflet's [lat, lng] to our [lng, lat] format
          return geojson.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);
        }
      }
      return [];
    } catch (error) {
      console.error('Error extracting coordinates:', error);
      return [];
    }
  };

  // Check if a layer is within bounds of another layer (if applicable)
  const isLayerWithinBounds = (layer) => {
    // This is where you would implement bounds checking logic if needed
    // For now, we'll return true to allow any shape
    return true;
  };

  // Handle creation of new shapes
  const _onCreated = (e) => {
    const { layer } = e;

    if (isLayerWithinBounds(layer)) {
      // Extract coordinates and send to parent
      const coordinates = extractCoordinates(layer);
      onCordsChange(coordinates);
    } else {
      setErrorMessage('The shape is outside the permitted bounds');
      setIsOpen(true);
      map.removeLayer(layer);
    }
  };

  // Handle editing of existing shapes
  const _onEdited = (e) => {
    const {
      layers: { _layers },
    } = e;

    // Get the first (and likely only) edited layer
    const editedLayer = Object.values(_layers)[0];

    if (editedLayer && isLayerWithinBounds(editedLayer)) {
      // Extract coordinates and send to parent
      const coordinates = extractCoordinates(editedLayer);
      onCordsChange(coordinates);
    } else {
      setErrorMessage('The edited shape is outside the permitted bounds');
      setIsOpen(true);

      // Reload the feature group if needed
      updateFeatureGroup();
    }
  };

  // Handle deleted shapes
  const _onDeleted = (e) => {
    // Send empty coordinates to parent to clear the form
    onCordsChange([]);
  };

  // Update the feature group with the current polygon
  const updateFeatureGroup = () => {
    if (!_editableFG.current) return;

    // Clear existing layers
    _editableFG.current.clearLayers();

    // If we have a polygon to display, add it
    if (polygon) {
      try {
        const leafletGeoJSON = new L.GeoJSON(polygon, {
          style: {
            fillColor: '#3388ff', // Match the default Leaflet draw color
            color: '#3388ff',
            weight: 3,
            opacity: 0.5,
            fillOpacity: 0.2,
          },
        });

        leafletGeoJSON.eachLayer((layer) => {
          _editableFG.current.addLayer(layer);
        });

        // Try to fit bounds if possible
        const bounds = leafletGeoJSON.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error('Error creating GeoJSON from polygon:', error);
      }
    }
  };

  // Initialize the feature group
  const _onFeatureGroupReady = (reactFGref) => {
    _editableFG.current = reactFGref;

    // Share the reference with the parent component
    if (setDrawnItems) {
      setDrawnItems(reactFGref);
    }

    // Update with existing polygon if available
    updateFeatureGroup();
  };

  // Update feature group when polygon prop changes
  useEffect(() => {
    updateFeatureGroup();
  }, [polygon, map]);

  // Modal handlers
  const handleModalClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <FeatureGroup
        ref={(reactFGref) => {
          if (reactFGref) _onFeatureGroupReady(reactFGref);
        }}
      >
        <EditControl
          position='topright'
          onEdited={_onEdited}
          onCreated={_onCreated}
          onDeleted={_onDeleted}
          draw={{
            circle: false,
            circlemarker: false,
            polyline: false,
            rectangle: true,
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: '<strong>Error:</strong> Shape edges cannot cross!',
              },
              shapeOptions: {
                color: '#3388ff',
                weight: 3,
              },
            },
            marker: false,
          }}
          edit={{
            remove: true,
            edit: true,
            poly: {
              allowIntersection: false,
            },
          }}
          leaflet={{ map }}
        />
      </FeatureGroup>

      <Modal
        title='Error'
        open={isOpen}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        footer={[
          <Button key='ok' type='primary' onClick={handleModalClose}>
            OK
          </Button>,
        ]}
      >
        <p>{errorMessage}</p>
      </Modal>
    </>
  );
}
