import React from 'react'
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import provinsiJson from "../data/38provinsi.json";
import provinceColors from "../data/colorMappingEachProvince.json";
import { useState } from 'react';
import { useEffect } from 'react';

import L from "leaflet";

const MapLeaflet = ({
    kodeProvinsi,
    onProvinceClick,
    selectedProvinceCode,
    isProvinceClicked,
    clickable = true,
    hoverable = true,
    earthquakeData = [],
    onEarthquakePointClicked,
    isProvinceColored = false
}) => {
    const [selectedProvince, setSelectedProvince] = useState(selectedProvinceCode || "");
    const [hoveredProvince, setHoveredProvince] = useState(null);

    useEffect(() => {
        if (!isProvinceClicked) {
            setSelectedProvince(null);
        }
    }, [isProvinceClicked]);

    const getStyle = (feature) => {
        const kodeProv = feature.properties.KODE_PROV.toString();
        let color = "rgba(0, 0, 255, 0)";
        let outlineColor = "rgba(0, 0, 150, 1)";
        let weight = 0.2;

        if (selectedProvince === kodeProv) {
            color = "rgba(0, 0, 255, 0.5)";
            weight = 1;
        } else if (hoveredProvince === kodeProv) {
            color = "rgba(0, 0, 255, 0.2)";
            weight = 1;
        } else if (isProvinceColored && !isProvinceClicked) {
            const provinceColor = provinceColors.find(prov => prov.provinsi_id.toString() === kodeProv)?.color || "rgb(0, 0, 255)";
            color = provinceColor.replace("rgb", "rgba").replace(")", ", 0.5)");
        }

        return {
            fillColor: color,
            color: outlineColor,
            weight: weight,
            fillOpacity: 1,
        };
    };

    const getEarthquakeColor = (depth) => {
        if (depth <= 50) return "rgba(255, 0, 0, 1)";
        if (depth <= 100) return "rgba(255, 165, 0, 1)";
        if (depth <= 250) return "rgba(230, 230, 0, 1)";
        if (depth <= 600) return "rgba(0, 128, 0, 1)";
        return "rgba(0, 0, 255, 1)";
    };

    const handleProvinceClick = (event, feature) => {
        if (!clickable) return;


        const { PROVINSI, KODE_PROV } = feature.properties;
        console.log(feature);
        setSelectedProvince(prev => (prev === KODE_PROV ? null : KODE_PROV));
        // onProvinceClick(PROVINSI, KODE_PROV);
    };


    return (
        <div className='w-full g'>
            <div className='w-full h-[100vh]'>
                <MapContainer
                    center={[-2.5489, 117.148]}
                    zoom={4.5}
                    minZoom={1}
                    maxZoom={12}
                    className="w-full h-full rounded-[10px] border z-10 border-light-border dark:border-dark-border overflow-hidden"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <GeoJSON
                        data={provinsiJson.data}
                        style={getStyle}
                        onEachFeature={(feature, layer) => {
                            layer.on({
                                mouseover: () => setHoveredProvince(feature.properties.KODE_PROV),
                                mouseout: () => setHoveredProvince(null),
                                click: (event) => handleProvinceClick(event, feature)
                            });
                            layer.bindTooltip(`Provinsi ${feature.properties.PROVINSI}`, { permanent: false, direction: "top" });
                        }}
                    />
                    {earthquakeData.map((data, index) => {
                        const coordinates = data.Coordinates.split(",").map(Number);
                        if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) return null;
                        const [lat, lon] = coordinates;
                        const depth = parseFloat(data.Kedalaman.replace(" km", ""));
                        const color = getEarthquakeColor(depth);

                        return (
                            <>
                                <Marker key={`marker-${index}`} position={[lat, lon]}
                                    icon={L.divIcon({
                                        className: "earthquake-marker",
                                        html: `<div style='background-color: ${color}; width: 12px; height: 12px; border-radius: 50%;'></div>`
                                    })}
                                    eventHandlers={{ click: () => onEarthquakePointClicked(data.Id) }}>
                                    <Popup>Magnitude: {data.Magnitude}</Popup>
                                </Marker>
                                <Marker key={`text-${index}`} position={[lat, lon]}
                                    icon={L.divIcon({
                                        className: "earthquake-text",
                                        iconSize: [30, 15],
                                        iconAnchor: [15, 30],
                                        html: `<div style='color: ${color}; font-size: 12px; font-weight: bold; text-align: center; background: rgba(255, 255, 255, 0.7); padding: 2px 4px; border-radius: 3px;'>${data.Magnitude}</div>`
                                    })} />
                            </>
                        );
                    })}
                </MapContainer>
            </div>
            dsds
            {/* , */}
        </div>
    )


    // return (
    //     <div className='w-full g'>
    //         <div className='w-full h-[100vh]'>
    //             <MapContainer
    //                 center={[-2.5489, 117.148]}
    //                 zoom={4.5}
    //                 minZoom={1}
    //                 maxZoom={12}
    //                 className="w-full h-full rounded-[10px] border z-10 border-light-border dark:border-dark-border overflow-hidden"
    //             >
    //                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    //                 <GeoJSON
    //                     data={provinsiJson.data}
    //                     style={getStyle}
    //                     onEachFeature={(feature, layer) => {
    //                         layer.on({
    //                             mouseover: () => setHoveredProvince(feature.properties.KODE_PROV),
    //                             mouseout: () => setHoveredProvince(null),
    //                             click: (event) => handleProvinceClick(event, feature)
    //                         });
    //                         layer.bindTooltip(`Provinsi ${feature.properties.PROVINSI}`, { permanent: false, direction: "top" });
    //                     }}
    //                 />
    //                 {earthquakeData.map((data, index) => {
    //                     const coordinates = data.Coordinates.split(",").map(Number);
    //                     if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) return null;
    //                     const [lat, lon] = coordinates;
    //                     const depth = parseFloat(data.Kedalaman.replace(" km", ""));
    //                     const color = getEarthquakeColor(depth);

    //                     return (
    //                         <>
    //                             <Marker key={`marker-${index}`} position={[lat, lon]}
    //                                 icon={L.divIcon({
    //                                     className: "earthquake-marker",
    //                                     html: `<div style='background-color: ${color}; width: 12px; height: 12px; border-radius: 50%;'></div>`
    //                                 })}
    //                                 eventHandlers={{ click: () => onEarthquakePointClicked(data.Id) }}>
    //                                 <Popup>Magnitude: {data.Magnitude}</Popup>
    //                             </Marker>
    //                             <Marker key={`text-${index}`} position={[lat, lon]}
    //                                 icon={L.divIcon({
    //                                     className: "earthquake-text",
    //                                     iconSize: [30, 15],
    //                                     iconAnchor: [15, 30],
    //                                     html: `<div style='color: ${color}; font-size: 12px; font-weight: bold; text-align: center; background: rgba(255, 255, 255, 0.7); padding: 2px 4px; border-radius: 3px;'>${data.Magnitude}</div>`
    //                                 })} />
    //                         </>
    //                     );
    //                 })}
    //             </MapContainer>
    //         </div>
    //         dsds
    //         {/* , */}
    //     </div>
    // )
}

export default MapLeaflet