import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Form, InputNumber, Button, Row, Col } from 'antd';
import DrawControl from './drawControl';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './polygonMap.css';

// MapController component to access map instance
const MapController = ({ onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
};

export default function PolygonMap({
  onGeometryChange,
  selectedPolygon,
  polygonCords,
  zoomSize,
  drawing,
  removePolygons,
  deleteAll,
  toBbox,
}) {
  const [defaultGeoJSON, setDefaultGeoJSON] = useState(null);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const [map, setMap] = useState(null);
  const drawnItemsRef = useRef(null);

  // Handle map ready
  const handleMapReady = (mapInstance) => {
    setMap(mapInstance);
  };

  // Handle coordinates from DrawControl
  const getCords = (childData) => {
    if (!childData || childData.length === 0) {
      form.setFieldsValue({ points: [] });
      onGeometryChange([]);
      setDefaultGeoJSON(null);
      return;
    }

    let formattedCoordinates;

    if (Array.isArray(childData[0]) && childData[0].length > 0 && !isNaN(childData[0][0])) {
      formattedCoordinates = childData;
    } else if (Array.isArray(childData[0]) && Array.isArray(childData[0][0])) {
      formattedCoordinates = childData[0];
    } else {
      console.error('Invalid coordinate format received from DrawControl');
      return;
    }

    // Convert Leaflet's [lat, lng] to [lng, lat] for the application
    formattedCoordinates = formattedCoordinates.map((coord) => [coord[1], coord[0]]);

    onGeometryChange([formattedCoordinates]);
    updateFormWithCoordinates(formattedCoordinates);
    updateMapGeoJSON(formattedCoordinates);
  };

  // Update form values when coordinates change
  const updateFormWithCoordinates = (coordinates) => {
    // Skip if no coordinates
    if (!coordinates || coordinates.length === 0) {
      form.setFieldsValue({ points: [] });
      return;
    }

    // Remove the closing point if it's the same as the first point
    const formCoordinates = [...coordinates];
    if (
      formCoordinates.length > 1 &&
      formCoordinates[0][0] === formCoordinates[formCoordinates.length - 1][0] &&
      formCoordinates[0][1] === formCoordinates[formCoordinates.length - 1][1]
    ) {
      formCoordinates.pop();
    }

    // Format for the form
    const formPoints = formCoordinates.map((coord) => ({
      lon: coord[0],
      lat: coord[1],
    }));

    // Update the form
    form.setFieldsValue({ points: formPoints });
  };
  const getCords = childData => {
    //console.log(childData);
    setCords(childData);
    sendData(childData);
  };

  // Update GeoJSON for the map
  const updateMapGeoJSON = (coordinates) => {
    if (!coordinates || coordinates.length === 0) {
      setDefaultGeoJSON(null);
      return;
    }

    const closedCoordinates = [...coordinates];
    if (
      closedCoordinates.length > 0 &&
      (closedCoordinates[0][0] !== closedCoordinates[closedCoordinates.length - 1][0] ||
        closedCoordinates[0][1] !== closedCoordinates[closedCoordinates.length - 1][1])
    ) {
      closedCoordinates.push([...closedCoordinates[0]]);
    }

    const geoJsonFeature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [closedCoordinates],
      },
      properties: {},
    };

    setDefaultGeoJSON(geoJsonFeature);
  };

  // Clear polygons when deleteAll is true
  useEffect(() => {
    if (deleteAll) {
      setDefaultGeoJSON(null);
      form.setFieldsValue({ points: [] });
      removePolygons(false);

      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
      }
    }
  }, [deleteAll, removePolygons, form]);

  // Set up initial polygons from props
  useLayoutEffect(() => {
    if (selectedPolygon?.length > 0 && selectedPolygon[0]?.length > 0) {
      const coordinates = selectedPolygon[0];

      // Update form and map
      updateFormWithCoordinates(coordinates);
      updateMapGeoJSON(coordinates);

      // Pass to parent
      onGeometryChange([coordinates]);
    }
  }, [selectedPolygon]);

  // Handle manual polygon addition from form
  const handleAddPolygon = async () => {
    try {
      const values = await form.validateFields();
      const points = values.points;
      if (!points || points.length < 3) {
        setError('At least 3 points are required to form a polygon.');
        return;
      }

      // Map points to [lng, lat] array
      const coordinates = points.map((p) => [parseFloat(p.lon), parseFloat(p.lat)]);

      // Ensure the polygon is closed
      if (
        coordinates.length > 0 &&
        (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
          coordinates[0][1] !== coordinates[coordinates.length - 1][1])
      ) {
        coordinates.push([...coordinates[0]]);
      }

      // Update the map and parent component
      updateMapGeoJSON(coordinates);
      onGeometryChange([coordinates]);
      setError('');

      // If we have a map reference, fit bounds to the new polygon
      if (map && defaultGeoJSON) {
        try {
          const bounds = L.geoJSON(defaultGeoJSON).getBounds();
          map.fitBounds(bounds);
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      }
    } catch (err) {
      console.error('Form validation error:', err);
      setError('Please check the input fields.');
    }
  };

  // Reference for the DrawControl component
  const setDrawnItems = (items) => {
    drawnItemsRef.current = items;
  };

  return (
    <div className='PolygonMap'>
      {/* Manual Input Section */}
      <div
        style={{
          marginBottom: '10px',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Form form={form}>
          {/* Table Headers */}
          <Row gutter={16} style={{ marginBottom: '8px' }}>
            <Col span={8}>
              <strong>Longitude</strong>
            </Col>
            <Col span={8}>
              <strong>Latitude</strong>
            </Col>
            <Col span={8}>
              <strong>Actions</strong>
            </Col>
          </Row>
          {/* Dynamic List of Points */}
          <Form.List name='points'>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Row key={field.key} gutter={16} style={{ marginBottom: 8 }}>
                    <Col span={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'lon']}
                        fieldKey={[field.fieldKey, 'lon']}
                        rules={[
                          { required: true, message: 'Missing longitude' },
                          { type: 'number', min: -180, max: 180, message: 'Longitude must be between -180 and 180' },
                        ]}
                      >
                        <InputNumber placeholder='Longitude' style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'lat']}
                        fieldKey={[field.fieldKey, 'lat']}
                        rules={[
                          { required: true, message: 'Missing latitude' },
                          { type: 'number', min: -90, max: 90, message: 'Latitude must be between -90 and 90' },
                        ]}
                      >
                        <InputNumber placeholder='Latitude' style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Button onClick={() => remove(field.name)}>Delete</Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button onClick={() => add()} style={{ marginTop: '10px', marginRight: '5px' }}>
                    Add Point
                  </Button>
                  <Button type='primary' onClick={handleAddPolygon} style={{ marginTop: '10px', marginRight: '5px' }}>
                    Create Polygon
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      form.setFieldsValue({ points: [] });
                      setDefaultGeoJSON(null);
                      onGeometryChange([]);
                      if (drawnItemsRef.current) {
                        drawnItemsRef.current.clearLayers();
                      }
                    }}
                    style={{ marginTop: '10px' }}
                  >
                    Clear All
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
        {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{error}</p>}
      </div>

      {/* Map Container */}
      <MapContainer style={{ width: '100%', height: '750px' }} className='map' center={[0, 0]} zoom={5} minZoom={3}>
        <MapController onMapReady={handleMapReady} />
        <TileLayer
          attribution='© <a href="http://osm.org/copyright">EO4EU</a> Consortium'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <DrawControl
          isActive={drawing}
          polygon={defaultGeoJSON}
          onCordsChange={getCords}
          setDrawnItems={setDrawnItems}
        />
      </MapContainer>
    </div>
  );
}

function DrawControl({ isActive,polygon,onCordsChange }) {
  const map = useMap();
  const _editableFG = React.useRef(null);
  const sendData = (coordinates) => {
    console.log(coordinates._layers['31']._latlngs);
    onCordsChange(coordinates._layers['31']._latlngs);
  };
  const _onCreated = (event) => {
    // Get the coordinates of the created polygon
    var polygonCoordinates = event.layer.getLatLngs();

    // Do something with the polygon coordinates
    console.log('Polygon Coordinates:', event.layer._latlngs[0]);

    //sendData(polygonCoordinates);
    
    onCordsChange(event.layer._latlngs[0]);
  }
  const _onEdited = (event) =>  sendData( event.layers); 

  const _onFeatureGroupReady = (reactFGref) => {
    if(polygon){
            let leafletGeoJSON = new L.GeoJSON(polygon);

    leafletGeoJSON.eachLayer((layer) => {
      reactFGref.addLayer(layer);
    });    _editableFG.current = reactFGref;

    }


    // store the ref for future access to content

  };

  React.useEffect(() => {
    if (_editableFG.current)
      console.log(
        "ref",
        _editableFG.current.getLayers().map((l) => l.toGeoJSON())
      );
  }, [_editableFG]);

  return (
    <FeatureGroup
      ref={(reactFGref) => {
        if (reactFGref) _onFeatureGroupReady(reactFGref);
      }}
      eventHandlers={{
        add(e) {
          map.fitBounds(e.target.getBounds());
        }
      }}
    >
      <EditControl
        position="topright"
        onEdited={_onEdited}
        onCreated={_onCreated}
        // onDeleted={_onDeleted}
        // onMounted={_onMounted}
        // onEditStart={_onEditStart}
        // onEditStop={_onEditStop}
        // onDeleteStart={_onDeleteStart}
        // onDeleteStop={_onDeleteStop}
        draw={{
          circle: false,
          circlemarker: false,
          polyline: false
        }}
        leaflet={{ map }}
      />
    </FeatureGroup>
  );
}

function FeatureRenderer({polygon }) {
  const map = useMap();
  return (
    <FeatureGroup
      eventHandlers={{
        add(e) {
          map.fitBounds(e.target.getBounds());
        }
      }}
    >
      <GeoJSON data={polygon} />
    </FeatureGroup>
  );
}
