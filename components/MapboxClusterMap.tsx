"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Business {
  id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  average_rating: number;
  tier: string;
  cover_image_url?: string;
  city?: string;
}

interface MapboxClusterMapProps {
  businesses: Business[];
  className?: string;
}

const TIER_COLORS: Record<string, string> = {
  free: "#6B7280",
  verified_platinum: "#3B82F6",
  platinum_partner: "#7C3AED",
  platinum_elite: "#D4AF37",
};

const TEMECULA_CENTER: [number, number] = [-117.1484, 33.4936];

export default function MapboxClusterMap({ businesses, className = "" }: MapboxClusterMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: TEMECULA_CENTER,
      zoom: 12,
    });

    m.addControl(new mapboxgl.NavigationControl(), "top-right");

    m.on("load", () => {
      const geojson = toGeoJSON(businesses);

      m.addSource("businesses", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      m.addLayer({
        id: "clusters",
        type: "circle",
        source: "businesses",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step", ["get", "point_count"],
            "#7C3AED", 10, "#3B82F6", 30, "#D4AF37",
          ],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 30, 32],
          "circle-stroke-width": 2,
          "circle-stroke-color": "rgba(255,255,255,0.15)",
        },
      });

      // Cluster count text
      m.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "businesses",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 13,
        },
        paint: { "text-color": "#ffffff" },
      });

      // Individual pins — color by tier
      m.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "businesses",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match", ["get", "tier"],
            "platinum_elite", "#D4AF37",
            "platinum_partner", "#7C3AED",
            "verified_platinum", "#3B82F6",
            "#6B7280",
          ],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click cluster → zoom in
      m.on("click", "clusters", (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const src = m.getSource("businesses") as mapboxgl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom === undefined || zoom === null) return;
          const geom = features[0].geometry;
          if (geom.type === "Point") {
            m.easeTo({ center: geom.coordinates as [number, number], zoom });
          }
        });
      });

      // Click pin → popup
      m.on("click", "unclustered-point", (e) => {
        const f = e.features?.[0];
        if (!f || f.geometry.type !== "Point") return;
        const props = f.properties || {};
        const coords = f.geometry.coordinates.slice() as [number, number];
        const tierLabel =
          props.tier === "platinum_elite" ? "ELITE" :
          props.tier === "platinum_partner" ? "PARTNER" :
          props.tier === "verified_platinum" ? "VERIFIED" : "";
        const badge = tierLabel
          ? `<span style="background:${TIER_COLORS[props.tier]};color:#fff;font-size:9px;padding:2px 6px;border-radius:9px;font-weight:700">${tierLabel}</span>`
          : "";
        const rating = props.average_rating > 0
          ? `<span style="color:#D4AF37;font-size:12px">★ ${props.average_rating}</span>`
          : "";
        const img = props.cover_image_url
          ? `<img src="${props.cover_image_url}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px" />`
          : "";

        new mapboxgl.Popup({ offset: 15, maxWidth: "220px" })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:system-ui;color:#fff;background:#111827;padding:0;border-radius:8px;overflow:hidden">
              ${img}
              <div style="padding:8px 10px">
                <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
                  <strong style="font-size:13px">${props.name}</strong>
                  ${badge}
                </div>
                ${rating}
                <a href="/business/${props.slug}" style="display:block;margin-top:6px;color:#D4AF37;font-size:12px;text-decoration:none">View Listing →</a>
              </div>
            </div>
          `)
          .addTo(m);
      });

      // Cursor changes
      m.on("mouseenter", "clusters", () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "clusters", () => { m.getCanvas().style.cursor = ""; });
      m.on("mouseenter", "unclustered-point", () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "unclustered-point", () => { m.getCanvas().style.cursor = ""; });

      setLoaded(true);
    });

    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  // Update data when businesses change
  useEffect(() => {
    if (!map.current || !loaded) return;
    const src = map.current.getSource("businesses") as mapboxgl.GeoJSONSource | undefined;
    if (src) {
      src.setData(toGeoJSON(businesses));
    }
  }, [businesses, loaded]);

  return (
    <div ref={mapContainer} className={`h-full w-full min-h-[300px] ${className}`} />
  );
}

function toGeoJSON(businesses: Business[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: businesses
      .filter((b) => b.latitude && b.longitude)
      .map((b) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [b.longitude!, b.latitude!],
        },
        properties: {
          id: b.id,
          name: b.name,
          slug: b.slug,
          tier: b.tier,
          average_rating: b.average_rating,
          cover_image_url: b.cover_image_url || "",
          city: b.city || "",
        },
      })),
  };
}
