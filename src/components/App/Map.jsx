import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { calculateDistance } from '../../utils/location';

// --- Constants (Heroicon-style Professional SVGs) ---

const ICONS = {
    // Professional User Location: White circle with gray User Silhouette (Heroicon style)
    USER_LOC: `
        <div class="relative w-10 h-10 flex items-center justify-center">
            <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            <div class="relative w-8 h-8 bg-white rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-500 mt-1">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
            <div class="absolute -bottom-1 w-2 h-2 bg-white transform rotate-45 border-r border-b border-white z-0"></div>
        </div>
    `,
    HUNGER: (initials = "JD", status = 'open', isMe = false) => {
        // Use inline hex colors — Tailwind can't compile dynamic classes in raw HTML strings
        let pinColor = '#16a34a';        // green-600 (others)
        let borderCol = '#ffffff';       // white
        let stickColor = 'rgba(22,163,74,0.5)';

        if (status === 'locked') {
            pinColor = '#6b7280';         // gray-500
            stickColor = 'rgba(107,114,128,0.5)';
        } else if (isMe) {
            pinColor = '#ef4444';         // red-500 (my pin)
            borderCol = '#fecaca';        // red-200
            stickColor = 'rgba(239,68,68,0.5)';
        }

        return `
        <div style="position:relative;width:48px;height:48px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
             <div style="position:relative;width:40px;height:40px;background:${pinColor};border-radius:50%;box-shadow:0 4px 6px rgba(0,0,0,0.15);border:2px solid ${borderCol};display:flex;align-items:center;justify-content:center;z-index:10;">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width:20px;height:20px;">
                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                 </svg>
             </div>
             <div style="width:2px;height:12px;background:${stickColor};border-radius:0 0 4px 4px;"></div>
             <div style="width:16px;height:4px;background:rgba(0,0,0,0.1);border-radius:50%;filter:blur(1px);"></div>
        </div>
    `
    },
    RESCUE: `
        <div class="relative w-10 h-10 flex flex-col items-center justify-end group hover:-translate-y-1 transition-transform duration-200">
             <div class="relative w-8 h-8 bg-green-600 rounded-full shadow-lg border-2 border-white flex items-center justify-center z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                 </svg>
             </div>
             <div class="w-0.5 h-3 bg-green-600/50 rounded-b-full"></div>
             <div class="w-3 h-1 bg-black/10 rounded-full blur-[1px]"></div>
        </div>
    `
};

// --- Components ---

function MapClickHandler({ position, mode, onPinCreateRequest, onError }) {
    useMapEvents({
        click(e) {
            // Check if click target is likely a button or popup interaction
            if (e.originalEvent.target.closest('button') || e.originalEvent.target.closest('.leaflet-popup-content-wrapper')) {
                return;
            }

            if (mode !== 'spotter' || !position) return;
            const distance = calculateDistance(
                position[0], position[1],
                e.latlng.lat, e.latlng.lng
            );
            if (distance > 200) { // Changed to 200m based on requirements
                onError(`Too far! You can only pin within 200m of your location.`);
            } else {
                onPinCreateRequest(e.latlng);
            }
        },
    });
    return null;
}

function LocationButton({ position }) {
    const map = useMap();
    return (
        <div className="absolute bottom-24 right-4 z-[400]">
            <button
                onClick={() => position && map.flyTo(position, 17, { animate: true })} // Zoom 17 (~200m view)
                className="bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all border border-gray-100"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

// Routing Machine Component
function RoutingControl({ position, destination }) {
    const map = useMap();
    const routingControlRef = useRef(null);

    // Initialize Routing Control ONCE
    useEffect(() => {
        if (!L.Routing) {
            console.error("Leaflet Routing Machine not loaded");
            return;
        }

        if (!routingControlRef.current) {
            routingControlRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(position[0], position[1]),
                    L.latLng(destination.lat, destination.lng)
                ],
                routeWhileDragging: false, // Better performance
                showAlternatives: false,
                addWaypoints: false,
                fitSelectedRoutes: false, // Don't zoom automatically on every update
                show: false, // Hide instruction panel
                lineOptions: {
                    styles: [{ color: '#3b82f6', weight: 5, opacity: 0.7 }]
                },
                createMarker: function () { return null; }
            }).addTo(map);
        }

        return () => {
            if (routingControlRef.current) {
                try {
                    map.removeControl(routingControlRef.current);
                    routingControlRef.current = null;
                } catch (e) {
                    console.warn("Error removing routing control", e);
                }
            }
        };
    }, [map]); // Only run on mount/unmount

    // Update waypoints when position changes
    useEffect(() => {
        if (routingControlRef.current && position && destination) {
            const newWaypoints = [
                L.latLng(position[0], position[1]),
                L.latLng(destination.lat, destination.lng)
            ];
            routingControlRef.current.setWaypoints(newWaypoints);
        }
    }, [position, destination]);

    return null;
}

// --- Icons Setup ---

const createHungerIcon = (user = "JD", status = 'open', isMe = false) => {
    const initials = user.length > 2 ? user.substring(0, 2).toUpperCase() : user.toUpperCase();
    return divIcon({
        className: 'custom-pin-marker',
        html: ICONS.HUNGER(initials, status, isMe),
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48]
    });
};

const rescueIcon = divIcon({
    className: 'custom-pin-marker',
    html: ICONS.RESCUE,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const userIcon = divIcon({
    className: 'custom-icon',
    html: ICONS.USER_LOC,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

// Auto-center map when user location is found
function RecenterMap({ position, hasUserLocation }) {
    const map = useMap();
    const hasCenteredRef = useRef(false);

    useEffect(() => {
        if (hasUserLocation && !hasCenteredRef.current) {
            map.flyTo(position, 17, { animate: true }); // Default zoom 17 (~200m)
            hasCenteredRef.current = true;
        }
    }, [position, hasUserLocation, map]);
    return null;
}

export default function Map({ mode, pins, user, onPinAdd, onPinDelete, onPinEdit, onPinLock, onPinCancel, onPinComplete, onPinMove }) {
    const [position, setPosition] = useState([23.8103, 90.4125]); // Default to Dhaka
    const [locationPermission, setLocationPermission] = useState('prompt'); // prompt, granted, denied
    const [hasUserLocation, setHasUserLocation] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const [isCreatingPin, setIsCreatingPin] = useState(false);
    const [newPinLocation, setNewPinLocation] = useState(null);
    const [newPinDesc, setNewPinDesc] = useState('');
    const [newPinTTL, setNewPinTTL] = useState('2h');
    const [peopleCount, setPeopleCount] = useState(1);

    // Additional ref to block map clicks when dragging
    const isDraggingRef = useRef(false);

    // Navigation State
    const activeRoutePin = pins.find(p => p.status === 'locked' && p.locked_by === user?.id);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    setLocationPermission('granted');
                    setHasUserLocation(true);
                },
                (err) => {
                    console.error("Location Error:", err);
                    if (!hasUserLocation) {
                        setLocationPermission('denied');
                    }
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        } else {
            setLocationPermission('denied');
        }
    }, [hasUserLocation]);

    const handlePinCreateRequest = (latlng) => {
        if (isDraggingRef.current) return; // Don't create if dragging
        setNewPinLocation(latlng);
        setIsCreatingPin(true);
    };

    const submitNewPin = () => {
        if (!newPinDesc.trim() || newPinDesc.length < 3) {
            alert("Please provide a description (min 3 chars).");
            return;
        }
        const newPin = {
            id: Date.now(),
            lat: newPinLocation.lat,
            lng: newPinLocation.lng,
            type: 'hunger',
            title: 'Hunger Spot',
            desc: newPinDesc,
            ttl: newPinTTL,
            people_count: peopleCount,
            trustScore: 100,
            user: 'Me'
        };
        onPinAdd(newPin);
        setIsCreatingPin(false);
        setNewPinDesc('');
        setNewPinLocation(null);
        setPeopleCount(1);
    };

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            {/* Same Error/Pin Creation Views */}
            {errorMsg && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold animate-fade-in-out">
                    {errorMsg}
                </div>
            )}

            {isCreatingPin && (
                <div className="absolute inset-0 z-[2000] bg-black/50 flex items-end justify-center p-4 animate-fade-in" onClick={(e) => {
                    if (e.target === e.currentTarget) setIsCreatingPin(false);
                }}>
                    <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl mb-20 animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">📍 New Spot</h3>
                            <button onClick={() => setIsCreatingPin(false)} className="text-gray-400 font-bold">✕</button>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl mt-1 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                rows="3"
                                placeholder="Who needs help? (e.g. 3 people near park)"
                                value={newPinDesc}
                                onChange={e => setNewPinDesc(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-400 uppercase">People in Need</label>
                            <div className="flex gap-2 mt-1">
                                {[1, 2, 3, 4, 5].map(bucket => (
                                    <button
                                        key={bucket}
                                        onClick={() => setPeopleCount(bucket)}
                                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all border ${peopleCount === bucket ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-110' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {bucket}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase">Expires In</label>
                            <div className="flex gap-2 mt-1">
                                {['1h', '2h', '4h'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setNewPinTTL(t)}
                                        className={`flex-1 py-3 border rounded-xl text-xs font-bold transition-all ${newPinTTL === t ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={submitNewPin}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                        >
                            Confirm Location
                        </button>
                    </div>
                </div>
            )}

            {/* Same Location Denied View */}
            {locationPermission === 'denied' && (
                <div className="absolute inset-0 z-[1500] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-4.5h.75z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" className="opacity-70" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Location Required</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            KindBite needs your location to show food spots and hungry people near you.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg"
                        >
                            Enable Location & Retry
                        </button>
                    </div>
                </div>
            )}

            <MapContainer
                center={position}
                zoom={17}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className={locationPermission === 'denied' ? 'blur-sm grayscale' : ''}
            >
                {/* Auto Recenter */}
                <RecenterMap position={position} hasUserLocation={hasUserLocation} />

                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <MapClickHandler
                    position={position}
                    mode={mode}
                    onPinCreateRequest={handlePinCreateRequest}
                    onError={(msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 3000); }}
                />

                <LocationButton position={position} />

                <Marker position={position} icon={userIcon}><Popup>You are Here</Popup></Marker>

                {mode === 'spotter' && (
                    <Circle center={position} radius={200} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.05, weight: 1.5, dashArray: '6, 6' }} />
                )}

                {/* Routing Line if Active */}
                {activeRoutePin && (
                    <RoutingControl position={position} destination={activeRoutePin} />
                )}

                {pins.map(pin => {
                    const isLockedByMe = pin.locked_by === user?.id;
                    const isLockedByOther = pin.status === 'locked' && !isLockedByMe;
                    const isMe = pin.user_id === user?.id;

                    return (
                        <Marker
                            key={pin.id}
                            position={[pin.lat, pin.lng]}
                            icon={pin.type === 'rescue' ? rescueIcon : createHungerIcon(pin.user, pin.status, isMe)}
                            draggable={mode === 'spotter' && isMe}
                            eventHandlers={{
                                dragstart: () => { isDraggingRef.current = true; },
                                dragend: (e) => {
                                    isDraggingRef.current = false;
                                    const newPos = e.target.getLatLng();
                                    // Optimistic update handled by onPinMove, no duplicate pin
                                    if (onPinMove) onPinMove(pin.id, newPos.lat, newPos.lng);
                                }
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -45]} opacity={0.9} className="font-bold text-xs">
                                {(pin.description || pin.desc || 'Hunger Spot').length > 20
                                    ? (pin.description || pin.desc || 'Hunger Spot').substring(0, 20) + '...'
                                    : (pin.description || pin.desc || 'Hunger Spot')}
                            </Tooltip>

                            <Popup className="custom-popup" closeButton={false}>
                                <div className="min-w-[170px] p-2">
                                    <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border border-gray-200 ${pin.status === 'locked' ? 'bg-gray-200 text-gray-500' : 'bg-orange-50 text-orange-600'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-900 leading-none">
                                                {pin.user || "User"} {isMe && <span className="text-red-500">(You)</span>}
                                            </span>
                                            <span className="text-[9px] text-gray-400">
                                                {pin.status === 'locked' ? (isLockedByMe ? 'Locked by YOU' : 'Locked by someone') : (pin.ttl || '2h') + ' left'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3 font-normal leading-relaxed">{pin.description || pin.desc || 'No description'}</p>

                                    {/* Action Buttons */}
                                    {mode === 'spotter' && isMe ? (
                                        pin.status === 'locked' ? (
                                            <div className="w-full bg-gray-100 text-gray-500 py-1.5 rounded-md text-[10px] font-bold text-center border border-gray-200">
                                                Locked by Donor - Cannot Delete 🛡️
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Stop bubbling to map click
                                                    onPinDelete(pin.id);
                                                }}
                                                className="w-full bg-red-50 text-red-600 py-1.5 rounded-md text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                                            >
                                                Delete Pin
                                            </button>
                                        )
                                    ) : mode === 'donor' ? (
                                        isLockedByMe ? (() => {
                                            const distToPin = calculateDistance(position[0], position[1], pin.lat, pin.lng);
                                            const isCloseEnough = distToPin <= 50;
                                            return (
                                                <div className="space-y-2">
                                                    {isCloseEnough ? (
                                                        <button
                                                            onClick={() => onPinComplete(pin.id)}
                                                            className="w-full bg-green-500 text-white py-2 rounded-md text-xs font-bold hover:bg-green-600 shadow-sm animate-pulse"
                                                        >
                                                            📸 I'M HERE - Take Photo (+50 TS)
                                                        </button>
                                                    ) : (
                                                        <button disabled className="w-full bg-gray-200 text-gray-500 py-2 rounded-md text-xs font-bold cursor-not-allowed">
                                                            📍 {Math.round(distToPin)}m away — Get closer (50m)
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onPinCancel(pin.id)}
                                                        className="w-full bg-gray-100 text-gray-600 py-1.5 rounded-md text-[10px] font-bold hover:bg-gray-200"
                                                    >
                                                        Cancel Help
                                                    </button>
                                                </div>
                                            );
                                        })() : isLockedByOther ? (
                                            <button disabled className="w-full bg-gray-100 text-gray-400 py-1.5 rounded-md text-xs font-bold cursor-not-allowed">
                                                Locked by another Donor 🔒
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onPinLock(pin.id)}
                                                className="w-full bg-orange-500 text-white py-1.5 rounded-md text-xs font-bold hover:bg-orange-600 shadow-sm"
                                            >
                                                Rescue & Lock (-10 TS if fraud) 🛡️
                                            </button>
                                        )
                                    ) : null}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    );
}
