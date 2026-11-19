import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"
import type { LatLng } from "../types"

const DEFAULT_CENTER: LatLng = { lat: 6.9271, lng: 79.8612 } // map ake default center location aka define karanava
// map ake marker akak sadaha avashya data structure aka define karanava
export interface MapMarker {
  id: string
  lat: number
  lng: number
  color: string
  label?: string | number
  popup?: React.ReactNode
}
 // me function aken system akata custom marker design akak hadanava
const pin = (color: string, label?: string | number) =>
  L.divIcon({
    className: "",
    html: `<div class="eco-pin" style="background:${color}"><span>${label ?? ""}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28]
  })
// user thoragaththa location akata map aka smooth animation akakin genyanava
function Fly({ to }: { to?: LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (to) map.flyTo([to.lat, to.lng], Math.max(map.getZoom(), 15), { duration: 0.8 })
  }, [to, map])
  return null
}
// siyaluma location akavara pennanava
function Fit({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points.map((p) => [p.lat, p.lng] as [number, number]), { padding: [40, 40], maxZoom: 16 })
    else if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15)
  }, [points, map])
  return null
}
// onama thanak click karama a isthanaye coordinates labagannava
function ClickCatcher({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) }) })
  return null
}
// parent component aken props labagannava
export function MapView({ markers, line, height = 420, focus, fit = true, start }: { markers: MapMarker[]; line?: LatLng[]; height?: number | string; focus?: LatLng | null; fit?: boolean; start?: LatLng }) {
  const pts = markers.map((m) => ({ lat: m.lat, lng: m.lng }))
  const centre = pts[0] ?? DEFAULT_CENTER
  return (
    <div className="overflow-hidden rounded-2xl border border-line" style={{ height }}>
      <MapContainer center={[centre.lat, centre.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> // google map venuvata pavichchi karanava
        {fit && <Fit points={start ? [start, ...pts] : pts} />} // fit true num map ake okkoma location fit karanava
        <Fly to={focus} /> // focus location akata map aka smoothly move karanava
        {line && line.length > 1 && <Polyline positions={line.map((p) => [p.lat, p.lng] as [number, number])} pathOptions={{ color: "#1e9e5a", weight: 5, opacity: 0.85 }} />} // location kihipayak athara line aka draw karanava
        {start && <CircleMarker center={[start.lat, start.lng]} radius={9} pathOptions={{ color: "#0b3d2e", fillColor: "#ffc72c", fillOpacity: 1, weight: 3 }}><Popup>Start / depot</Popup></CircleMarker>} // route ake start point aka penvanava
        {markers.map((m) => ( // map ake siyaluma pickup locations mark karanava
          <Marker key={m.id} position={[m.lat, m.lng]} icon={pin(m.color, m.label)}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
// component aken userta map aka click karala thamange pickup location aka thoraganna puluvan
export function LocationPicker({ value, onChange, height = 260 }: { value: LatLng | null; onChange: (p: LatLng) => void; height?: number }) {
  const centre = value ?? DEFAULT_CENTER
  return (
    <div className="overflow-hidden rounded-xl border border-line" style={{ height }}>
      <MapContainer center={[centre.lat, centre.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickCatcher onPick={onChange} />
        <Fly to={value} />
        {value && <Marker position={[value.lat, value.lng]} icon={pin("#e5a800")} />}
      </MapContainer>
    </div>
  )
}

export const useMyLocation = () => (onFound: (p: LatLng) => void, onFail: () => void) => {
  if (!navigator.geolocation) return onFail()
  navigator.geolocation.getCurrentPosition(
    (pos) => onFound({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) }),
    onFail,
    { timeout: 8000 }
  )
}
