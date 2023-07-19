import { useEffect, useRef, useState } from "react";
import proj4 from "proj4";
import { useLeafletContext } from "@react-leaflet/core";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { fromArrayBuffer } from "geotiff";
import L from "leaflet";

window.proj4 = proj4; // Making proj4 globally available for GeoRasterLayer

const TiffLayer = ({ id, url, options, setLegend }) => {
  const geoTiffLayerRef = useRef(null);
  const context = useLeafletContext();
  const map = useMap();

  useEffect(() => {
    // Function to load and display GeoTIFF layer on the map
    const loadTiff = async () => {
      let layerExists = false;
      map.eachLayer(layer => {
        if (layer.id === id) {
          layerExists = true;
        }
      });
      if (layerExists) {
        return;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch GeoTIFF: ${response.statusText}`);
      // Fetch and parse the GeoTIFF file
      const arrayBuffer = await response.arrayBuffer();
      const georaster = await parseGeoraster(arrayBuffer);

      // Create GeoRaster layer with parsed data
      const layerOptions = { ...options, georaster };
      const geoRasterLayer = new GeoRasterLayer(layerOptions);
      geoRasterLayer.id = id;
      geoTiffLayerRef.current = geoRasterLayer;

      // Add GeoRaster layer to the map
      const container = context.layerContainer || map;
      container.addLayer(geoRasterLayer);
      map.fitBounds(geoRasterLayer.getBounds());
      let legendData = {
        id,
        title: `Tiff Layer (${id})`,
        text: "No metadata available",
      };
      try {
        // Generate and display legend based on GeoTIFF metadata
        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const meta = image.getFileDirectory();
        legendData.text =meta.GDAL_METADATA;
      } catch (error) {
      } finally {
        setLegend("add", legendData);
      }
    };

    loadTiff();

    // Cleanup: remove the layer and legend on component unmount
    return () => {
      const container = context.layerContainer || map;
      if (geoTiffLayerRef.current && container.hasLayer(geoTiffLayerRef.current)) {
        container.removeLayer(geoTiffLayerRef.current);
      }
    };
  }, [id, url, map, options, context]);

  return null;
};

export default TiffLayer;
