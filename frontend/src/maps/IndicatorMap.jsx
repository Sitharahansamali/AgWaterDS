import { useEffect, useMemo, useState } from 'react'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './indicatorMap.css'

const NIGERIA_CENTER = [9.08, 8.6753]
const COLORS = ['#d9f0e5', '#a8dcca', '#6bbfa9', '#329c8b', '#176b66']
const MISSING_COLOR = '#CBD5E1'

function formatNumber(value) {
  return typeof value === 'number' ? value.toFixed(3) : value ?? 'No data'
}

function MapBounds({ geojson }) {
  const map = useMap()

  useEffect(() => {
    if (!geojson?.features?.length) return
    const bounds = L.geoJSON(geojson).getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [18, 18] })
  }, [geojson, map])

  return null
}

function popupElement(properties) {
  const container = document.createElement('div')
  container.className = 'indicator-popup'

  const title = document.createElement('strong')
  title.textContent = properties.admin_name || properties.admin_id || 'Administrative area'
  container.appendChild(title)

  for (const [label, value] of [
    ['Indicator value', formatNumber(properties.indicator_value)],
    ['Unit', properties.unit || 'Not provided'],
    ['Data source', properties.data_source || 'Not provided'],
  ]) {
    const paragraph = document.createElement('p')
    paragraph.textContent = `${label}: ${value}`
    container.appendChild(paragraph)
  }

  return container
}

export default function IndicatorMap({ geojson, indicatorName }) {
  const [selectedArea, setSelectedArea] = useState(null)

  const values = useMemo(
    () => (geojson?.features || [])
      .map((feature) => feature.properties?.indicator_value)
      .filter((value) => typeof value === 'number' && Number.isFinite(value)),
    [geojson]
  )

  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const getColor = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return MISSING_COLOR
    if (max === min) return COLORS[COLORS.length - 1]
    const index = Math.min(
      COLORS.length - 1,
      Math.floor(((value - min) / (max - min)) * COLORS.length)
    )
    return COLORS[index]
  }

  const style = (feature) => ({
    fillColor: getColor(feature.properties?.indicator_value),
    weight: 1,
    color: '#ffffff',
    fillOpacity: 0.8,
  })

  const onEachFeature = (feature, layer) => {
    const properties = feature.properties || {}
    layer.bindPopup(popupElement(properties))
    layer.on({
      click: () => setSelectedArea(properties),
      mouseover: (event) => event.target.setStyle({ weight: 2, color: '#123B46', fillOpacity: 0.95 }),
      mouseout: (event) => event.target.setStyle(style(feature)),
    })
  }

  if (!geojson?.features?.length) {
    return <div className="indicator-map-message">No geographic records are available for this selection.</div>
  }

  return (
    <div className="indicator-map-section">
      <div className="indicator-map-heading">
        <div>
          <h3>{indicatorName} Choropleth</h3>
          <p>Click an administrative area to inspect its returned value.</p>
        </div>
        <span>{geojson.features.length} administrative areas</span>
      </div>

      <div className="indicator-map-container">
        <MapContainer center={NIGERIA_CENTER} zoom={5} className="indicator-leaflet-map" scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds geojson={geojson} />
          <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />
        </MapContainer>
      </div>

      <div className="indicator-map-legend" aria-label="Map legend">
        <span><i style={{ backgroundColor: MISSING_COLOR }} /> No data</span>
        {COLORS.map((color, index) => <span key={color}><i style={{ backgroundColor: color }} /> {index === 0 ? formatNumber(min) : index === COLORS.length - 1 ? formatNumber(max) : ''}</span>)}
      </div>

      {selectedArea && (
        <div className="indicator-selected-area">
          <strong>{selectedArea.admin_name || selectedArea.admin_id}</strong>
          <span>{formatNumber(selectedArea.indicator_value)} {selectedArea.unit || ''}</span>
        </div>
      )}
    </div>
  )
}
