import { NetCDFReader } from "netcdfjs";
import { useMap } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';
import L from "leaflet";

const NCLayer = ({ id, url, options, setLegend }) => {
  const map = useMap();
  const layerRef = useRef({});
  const legendAddedRef = useRef(false); // Track if legend is already added
  const ncFileRef = useRef(null); // Store NetCDF file
  const latitudesRef = useRef([]); // Store latitudes
  const longitudesRef = useRef([]); // Store longitudes
  let selectedVariableNames = []

  useEffect(() => {
    const loadNC = async () => {
      if (layerRef.current[id]) {
        return;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch NetCDF: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();

        // Initialize NetCDF
        const ncFile = new NetCDFReader(arrayBuffer);
        const latitudes = ncFile.getDataVariable("latitude");
        const longitudes = ncFile.getDataVariable("longitude");
        const variables = ncFile.variables;
        const dimensionNames = ncFile.dimensions.map(dim => dim.name);

        // Filter out dimension variables and get variable names
        const variableNames = variables
          .filter(item => !dimensionNames.includes(item.name))
          .map(item => item.name);

        // Store references for use in the update function
        ncFileRef.current = ncFile;
        latitudesRef.current = latitudes;
        longitudesRef.current = longitudes;

        // Generate legend only if not already added
        if (!legendAddedRef.current) {
          let variableOptions = ""; // Initialize as empty string

          variableNames.forEach(variableName => {
            const values = ncFile.getDataVariable(variableName);
            const valuesSelected = values[0];
            const valuesMin = Math.min(...valuesSelected);
            const valuesMax = Math.max(...valuesSelected);

            const colorPickerMinId = `colorPickerMin${id}${variableName}`;
            const colorPickerMaxId = `colorPickerMax${id}${variableName}`;
            const opacityId = `opacityNumber${id}${variableName}`;

            // Concatenate each variable's HTML to `variableOptions`
            variableOptions += `
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" value="${variableName}" onchange="window.handleSelectChange('${variableName}', this.checked, '${id}')">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;" title="${variableName}">
                  ${variableName}
                </span>
                <span title="${valuesMin}">min: ${parseFloat(valuesMin).toPrecision(3)}</span>
                <input type="color" class="colorPickerLegend" id="${colorPickerMinId}" value="#00FF00" onchange="window.handleSelectChange('${variableName}', undefined, '${id}')">
                <span title="${valuesMax}">max: ${parseFloat(valuesMax).toPrecision(3)}</span>
                <input type="color" class="colorPickerLegend" id="${colorPickerMaxId}" value="#FF0000" onchange="window.handleSelectChange('${variableName}', undefined, '${id}')">
                <span">opacity:</span>
                <input type="number" id="${opacityId}" min="0" max="10" value="5" style="width: 50px;" 
                  onchange="window.handleSelectChange('${variableName}', undefined, '${id}')">
              </label>
            `;
          });

          // Wrap variable options in a container
          const legendText = `
            <div>
              <div id="${id}-variable-checkboxes">${variableOptions}</div>
            </div>
          `;
          const legendData = {
            id,
            title: `NetCDF Layer (${id})`,
            text: legendText,
          };

          // Add the legend and mark it as added
          setLegend("add", legendData);
          legendAddedRef.current = true;
        }
      } catch (error) {
        console.error("Error loading NetCDF data:", error);
      }
    };

    loadNC();

    return () => {
      // Remove the map layer only, without removing the legend
      if (layerRef.current[id]) {
        layerRef.current[id].forEach(layer => layer.remove());
        delete layerRef.current[id];
      }
    };
  }, [id, url, map, options]);

  const handleSelectChange = (variableName, checked, id) => {
    map.eachLayer(layer => {
      if (layer.options.id === id) {
        map.removeLayer(layer);
      }
    });
    if (checked === true) {
      // Add variableName if it's not already in the array
      selectedVariableNames = [...selectedVariableNames, variableName];
    } else if(checked === false) {
      // Remove variableName from the array
      selectedVariableNames = selectedVariableNames.filter(item => item !== variableName);
    }
    updateLayers(selectedVariableNames, id);
  };


  useEffect(() => {
    window.handleSelectChange = handleSelectChange;
  }, [])

  const updateLayers = (selectedVariables, id) => {
    console.log(selectedVariables, id)
    const ncFile = ncFileRef.current; // Access the stored NetCDF file
    const latitudes = latitudesRef.current; // Access stored latitudes
    const longitudes = longitudesRef.current; // Access stored longitudes
    selectedVariables.forEach(variableName => {
      const values = ncFile.getDataVariable(variableName);
      const valuesSelected = values[0];
      const valuesMin = Math.min(...valuesSelected);
      const valueMax = Math.max(...valuesSelected);
      const colorPickerMinId = `colorPickerMin${id}${variableName}`;
      const colorPickerMaxId = `colorPickerMax${id}${variableName}`;
      const opacityId = `opacityNumber${id}${variableName}`;
      const colorPickerMin = document.getElementById(colorPickerMinId).value;
      const colorPickerMax = document.getElementById(colorPickerMaxId).value;
      const opacityNumber = document.getElementById(opacityId).value;

      const colorScale = d3.scaleLinear()
        .domain([valuesMin, (valueMax + valuesMin) / 2, valueMax])
        .range([colorPickerMin, colorPickerMax]);
      let iteration = 0;
      const data = [];
      for (const latitude of latitudes) {
        for (const longitude of longitudes) {
          const concValue = values[0][iteration]; // Adjust if needed for different indices
          data.push({ latitude, longitude, value: concValue });
          iteration += 1;
        }
      }
      const bounds = [];
      data.forEach(point => {
        const latLngBounds = [
          [point.latitude - 0.06, point.longitude - 0.06],  // Bottom-left corner
          [point.latitude + 0.03, point.longitude + 0.03]   // Top-right corner
        ];
    
        // Add the rectangle to the map
        L.rectangle(latLngBounds, {
          id: id,
          variable: variableName,
          color: "",
          fillColor: colorScale(point.value),
          weight: 1,
          opacity: opacityNumber / 10,
          fillOpacity: opacityNumber / 10,
        }).addTo(map);

        bounds.push(latLngBounds);
      });
      if (bounds.length > 0) {
        const combinedBounds = L.latLngBounds(bounds);
        map.fitBounds(combinedBounds);  // Fit the map to the bounds of all the rectangles
      }    
    });
  };
  return null;
};

export default NCLayer;
