/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

type Center = {
  collectioncenter_id: string | number;
  name?: string | null;
  phone?: string | null;
  latitude?: number | null | string;
  longitude?: number | null | string;
  district_id?: { district_name?: string | null } | null;
};

export default function CustomMap({ centers, focusId }: { centers: Center[]; focusId?: string | number | null }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<Array<{ id: string | number; marker: any }>>([]);
  const infoWindowRef = useRef<any | null>(null);

  useEffect(() => {
    let mounted = true;

    function initMap() {
      if (!mapRef.current) return;
      // If map already initialized, just update markers
      if ((window as any).google && (window as any).google.maps) {
        if (!googleMapRef.current) {
          googleMapRef.current = new (window as any).google.maps.Map(mapRef.current, {
            center: { lat: 9.9326, lng: -84.0907 },
            zoom: 11,
          });
        }
        updateMarkers();
      }
    }

    function updateMarkers() {
      // clear existing
      markersRef.current.forEach(({ marker }) => {
        try {
          (window as any).google.maps.event.clearListeners(marker, 'click');
        } catch {}
        marker.setMap(null);
      });
      markersRef.current = [];
      
      if (!googleMapRef.current) return;

      const valid = centers
        
        .map((c) => ({
          id: c.collectioncenter_id,
          lat: typeof c.latitude === "string" ? Number(c.latitude) : c.latitude,
          lng: typeof c.longitude === "string" ? Number(c.longitude) : c.longitude,
          name: c.name,
        }))
        .filter((p) => Number.isFinite(p.lat as number) && Number.isFinite(p.lng as number));
        console.log("incoming centers:", centers);
        console.log("parsed markers:", valid);
      valid.forEach((v) => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: Number(v.lat), lng: Number(v.lng) },
          map: googleMapRef.current,
          title: v.name ?? String(v.id),
        });

        // add click listener to fetch details and show InfoWindow
        const handleClick = async () => {
          try {
            const res = await fetch(`/api/collectioncenters/${v.id}/get`);
            const body = await res.json();
            if (!res.ok) {
              console.error('Error fetching center detail', body?.error);
              return;
            }
            const data = body?.data ?? null;
            const content = `
              <div style="min-width:180px">
                <div style="font-weight:600;margin-bottom:6px">${(data?.name) ?? 'Centro'}</div>
                <div style="font-size:13px;color:#333;margin-bottom:4px">Distrito: ${data?.district_id?.district_name ?? '—'}</div>
                <div style="font-size:13px;color:#333">Tel: ${data?.phone ?? '—'}</div>
              </div>
            `;

            // close previous InfoWindow
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
              infoWindowRef.current = null;
            }

            infoWindowRef.current = new (window as any).google.maps.InfoWindow({
              content,
            });
            infoWindowRef.current.open({ map: googleMapRef.current, anchor: marker });
          } catch (err) {
            console.error('Error loading center info', err);
          }
        };

        marker.addListener('click', handleClick);

        markersRef.current.push({ id: v.id, marker });
      });
      
    }

    // load script if not present
    const existing = (window as any).google && (window as any).google.maps;
    if (!existing) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => {
        if (!mounted) return;
        initMap();
      };
      script.onerror = () => {
        console.error("Google Maps script failed to load");
      };

      return () => {
        mounted = false;
        // do not remove script to avoid reloading on HMR; just clear markers
        markersRef.current.forEach(({ marker }) => {
          try {
            (window as any).google.maps.event.clearListeners(marker, 'click');
          } catch {}
          marker.setMap(null);
        });
        markersRef.current = [];
      };
    } else {
      // already loaded
      initMap();
      return () => {
        mounted = false;
        markersRef.current.forEach(({ marker }) => {
          try {
            (window as any).google.maps.event.clearListeners(marker, 'click');
          } catch {}
          marker.setMap(null);
        });
        markersRef.current = [];
      };
    }
  }, [centers]);

  // Pan to focused marker and open info window when focusId changes
  useEffect(() => {
    if (typeof focusId === 'undefined' || focusId === null) return;
    if (!googleMapRef.current || !markersRef.current.length) return;

    const entry = markersRef.current.find((m) => String(m.id) === String(focusId));
    if (!entry) return;

    (async () => {
      try {
        const pos = entry.marker.getPosition();
        googleMapRef.current.panTo(pos);

        const res = await fetch(`/api/collectioncenters/${entry.id}/get`);
        const body = await res.json();
        if (!res.ok) return;
        const data = body?.data ?? null;
        const content = `
          <div style="min-width:180px">
            <div style="font-weight:600;margin-bottom:6px">${(data?.name) ?? 'Centro'}</div>
            <div style="font-size:13px;color:#333;margin-bottom:4px">Distrito: ${data?.district_id?.district_name ?? '—'}</div>
            <div style="font-size:13px;color:#333">Tel: ${data?.phone ?? '—'}</div>
          </div>
        `;

        if (infoWindowRef.current) {
          infoWindowRef.current.close();
          infoWindowRef.current = null;
        }
        infoWindowRef.current = new (window as any).google.maps.InfoWindow({ content });
        infoWindowRef.current.open({ map: googleMapRef.current, anchor: entry.marker });
      } catch (err) {
        console.error('Error focusing marker', err);
      }
    })();
  }, [focusId]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-xl border border-gray-200 shadow-sm" />;
}
