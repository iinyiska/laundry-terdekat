// Geolocation utility for both web and native app
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    // Check if running on native app (Capacitor)
    const isNativeApp = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()

    if (isNativeApp) {
        // Use Capacitor Geolocation for native app (more accurate)
        const { Geolocation } = await import('@capacitor/geolocation')

        // Request permissions first
        const permissionStatus = await Geolocation.checkPermissions()
        if (permissionStatus.location !== 'granted') {
            const requestResult = await Geolocation.requestPermissions()
            if (requestResult.location !== 'granted') {
                throw new Error('Location permission denied')
            }
        }

        // Get current position with high accuracy
        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        })

        console.log('[Native] Location:', position.coords.latitude, position.coords.longitude, 'Accuracy:', position.coords.accuracy, 'm')

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        }
    } else {
        // Use browser geolocation for web
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('[Web] Location:', position.coords.latitude, position.coords.longitude, 'Accuracy:', position.coords.accuracy, 'm')
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    })
                },
                (error) => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            )
        })
    }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<any> {
    // Reverse geocoding with OpenStreetMap Nominatim
    // zoom=18 for street-level detail including house numbers
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&extratags=1`,
        {
            headers: {
                'User-Agent': 'LaundryTerdekat/1.0'
            }
        }
    )

    if (!response.ok) {
        throw new Error('Geocoding failed')
    }

    const data = await response.json()
    console.log('[Geocoding] Full address data:', data.address)

    return data
}

export function buildDetailedAddress(addr: any): string {
    // Extract address components with fallbacks
    const houseNumber = addr.house_number || ''
    const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.street || ''
    const building = addr.building || addr.amenity || addr.shop || addr.office || ''
    const complex = addr.residential || addr.industrial || addr.commercial || ''
    const neighbourhood = addr.neighbourhood || addr.hamlet || addr.quarter || ''
    const kelurahan = addr.suburb || addr.village || addr.subdistrict || addr.neighbourhood || ''
    const kecamatan = addr.district || addr.city_district || ''
    const city = addr.city || addr.town || addr.municipality || addr.county || addr.state || ''
    const postcode = addr.postcode || ''

    // Build detailed address string
    const addressParts = []

    // Primary: Street and number
    if (road) {
        let streetAddr = road
        if (houseNumber) streetAddr += ' No. ' + houseNumber
        addressParts.push(streetAddr)
    }

    // Building/Complex name
    if (building) addressParts.push(building)
    if (complex && complex !== building) addressParts.push(complex)

    // Neighbourhood
    if (neighbourhood && neighbourhood !== kelurahan) addressParts.push(neighbourhood)

    // Kelurahan/Desa
    if (kelurahan) addressParts.push(kelurahan)

    // Kecamatan
    if (kecamatan && kecamatan !== kelurahan) addressParts.push(kecamatan)

    // City
    if (city) addressParts.push(city)

    // Postcode
    if (postcode) addressParts.push(postcode)

    return addressParts.length > 0 ? addressParts.join(', ') : ''
}
