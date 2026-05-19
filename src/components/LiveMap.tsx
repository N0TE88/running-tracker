import { useEffect, useRef } from "react";

export type LiveMapHandle = {
  reset: () => void;
  pushPoint: (lat: number, lng: number) => void;
};

type Props = {
  onReady?: (handle: LiveMapHandle) => void;
  initialRoute?: [number, number][];
  height?: number;
};

export function LiveMap({ onReady, initialRoute, height = 480 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let map: any = null;
    let polyline: any = null;
    let marker: any = null;
    let route: [number, number][] = initialRoute ? [...initialRoute] : [];
    let disposed = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current) return;

      const start = route[0] ?? [36.8065, 10.1815];
      map = L.map(containerRef.current, { zoomControl: true }).setView(start, 14);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap, © CARTO",
          maxZoom: 19,
        },
      ).addTo(map);

      polyline = L.polyline(route, {
        color: "#FF5CBA",
        weight: 5,
        opacity: 0.95,
      }).addTo(map);

      if (route.length > 0) {
        marker = L.circleMarker(route[route.length - 1], {
          radius: 7,
          color: "#2B00FF",
          fillColor: "#FF5CBA",
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        if (route.length > 1) map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
      }

      onReady?.({
        reset: () => {
          route = [];
          polyline.setLatLngs([]);
          if (marker) {
            marker.remove();
            marker = null;
          }
        },
        pushPoint: (lat, lng) => {
          route.push([lat, lng]);
          polyline.setLatLngs(route);
          if (!marker) {
            marker = L.circleMarker([lat, lng], {
              radius: 7,
              color: "#2B00FF",
              fillColor: "#FF5CBA",
              fillOpacity: 1,
              weight: 2,
            }).addTo(map);
          } else {
            marker.setLatLng([lat, lng]);
          }
          map.setView([lat, lng], Math.max(map.getZoom(), 16));
        },
      });
    })();

    return () => {
      disposed = true;
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-2xl border border-border bg-card"
    />
  );
}
