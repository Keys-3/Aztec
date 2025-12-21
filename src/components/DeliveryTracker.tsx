import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Truck, Clock, Navigation } from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Order } from '../lib/supabase';

interface DeliveryTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ isOpen, onClose, order }) => {
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [deliveryLocation, setDeliveryLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('Calculating...');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (order && apiKey && apiKey !== 'your-google-maps-api-key-here') {
      geocodeAddress(order.shipping_address);
    }
  }, [order, apiKey]);

  const geocodeAddress = async (address: any) => {
    const fullAddress = `${address.address_line_1}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`;

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          setDeliveryLocation(location);
          calculateRoute(currentLocation, location);
        }
      });
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const calculateRoute = (origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
          const duration = result.routes[0].legs[0].duration?.text || 'Unknown';
          setEstimatedTime(duration);
        }
      }
    );
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Order Pending',
          description: 'Your order is being processed'
        };
      case 'processing':
        return {
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: 'Processing',
          description: 'Preparing your order for shipment'
        };
      case 'shipped':
        return {
          icon: Truck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          text: 'Out for Delivery',
          description: 'Your order is on the way'
        };
      case 'delivered':
        return {
          icon: MapPin,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100',
          text: 'Delivered',
          description: 'Your order has been delivered'
        };
      default:
        return {
          icon: Package,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: status,
          description: 'Order status unknown'
        };
    }
  };

  if (!isOpen || !order) return null;

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Delivery Tracker</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Maps Configuration Required</h3>
            <p className="text-gray-600 mb-4">
              Please add your Google Maps API key to the .env file to enable delivery tracking.
            </p>
            <p className="text-sm text-gray-500">
              Get a free API key from: https://console.cloud.google.com/google/maps-apis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Track Your Delivery</h2>
            <p className="text-sm text-gray-600">Order #{order.id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <div className={`${statusInfo.bgColor} rounded-xl p-4 flex items-center space-x-4`}>
              <div className={`w-12 h-12 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
                <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${statusInfo.color}`}>{statusInfo.text}</h3>
                <p className="text-sm text-gray-600">{statusInfo.description}</p>
              </div>
              {order.status === 'shipped' && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Estimated Arrival</div>
                  <div className="text-lg font-semibold text-gray-900">{estimatedTime}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-emerald-600" />
              Live Tracking
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={deliveryLocation || currentLocation}
                  zoom={13}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                  }}
                >
                  <Marker
                    position={currentLocation}
                    title="Delivery Hub"
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                    onClick={() => setSelectedMarker('hub')}
                  />

                  {selectedMarker === 'hub' && (
                    <InfoWindow
                      position={currentLocation}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="p-2">
                        <h4 className="font-semibold">Delivery Hub</h4>
                        <p className="text-sm text-gray-600">Orders ship from here</p>
                      </div>
                    </InfoWindow>
                  )}

                  {deliveryLocation && (
                    <>
                      <Marker
                        position={deliveryLocation}
                        title="Delivery Address"
                        icon={{
                          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        }}
                        onClick={() => setSelectedMarker('delivery')}
                      />

                      {selectedMarker === 'delivery' && (
                        <InfoWindow
                          position={deliveryLocation}
                          onCloseClick={() => setSelectedMarker(null)}
                        >
                          <div className="p-2">
                            <h4 className="font-semibold">Delivery Address</h4>
                            <p className="text-sm text-gray-600">{order.shipping_address.full_name}</p>
                            <p className="text-sm text-gray-600">{order.shipping_address.address_line_1}</p>
                          </div>
                        </InfoWindow>
                      )}
                    </>
                  )}

                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                Delivery Address
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line_1}</p>
                {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                <p>{order.shipping_address.country}</p>
                <p className="pt-2 font-medium">Phone: {order.shipping_address.phone}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2 text-emerald-600" />
                Order Details
              </h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium text-emerald-600">₹{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium text-gray-900">{order.order_items?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-semibold text-emerald-900 mb-2">Delivery Instructions</h4>
            <p className="text-sm text-emerald-700">
              Our delivery team will contact you 30 minutes before arrival. Please ensure someone is available to receive the fresh produce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracker;
