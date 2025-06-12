import React from "react";
import "../styles/local.css";
import "leaflet/dist/leaflet.css";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import { Icon } from "leaflet";
function Local(){
    const customIcon = new Icon({
        iconUrl:"https://cdn-icons-png.flaticon.com/512/447/447031.png ",
        iconSize: [38,38]
    })
    const markers =[
    {
        geocode: [-22.92834549927698, -43.31889144580466],
        popUp: "Local do Torneio !"
    }
    ]
    return(
        <div>
            <div className="local-wrapper">
              
        <div className="local-container" id="local">
              <h2 className="local-do-torneio"> Local do Torneio </h2>
        <MapContainer center={[-22.92834549927698, -43.31889144580466]} zoom={20}>
        <TileLayer 
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(marker => ( 
            <Marker position={marker.geocode} icon={customIcon}>
                <Popup>
                {marker.popUp}
                </Popup> 
            </Marker>
            ))}
        </MapContainer> 
        <p className="endereco">Casa da Serra - Estr. dos Três Rios, 2740 - Jacarepaguá, Rio de Janeiro - RJ, 22745-005 </p>
        </div>
        </div>
        </div>
    );
}
export default Local;