export function getSunriseSunset(date: Date, lat: number, lng: number) {
  const rad = Math.PI / 180;
  const lw = rad * -lng;
  const phi = rad * lat;
  
  const d = date.valueOf() / 86400000 - 0.5 + 2440588 - 2451545;
  const m = rad * (357.5291 + 0.98560028 * d);
  const center = rad * (280.459 + 0.98564736 * d);
  const l = center + rad * 1.915 * Math.sin(m) + rad * 0.02 * Math.sin(2 * m);
  const dec = Math.asin(Math.sin(l) * 0.39779);
  
  const jTransit = 2451545 + d + 0.0053 * Math.sin(m) - 0.0069 * Math.sin(2 * l);
  
  const h0 = (Math.sin(-0.833 * rad) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  const h = Math.acos(Math.max(-1, Math.min(1, h0)));
  const jSet = jTransit + (h / (Math.PI * 2));
  const jRise = jTransit - (h / (Math.PI * 2));
  
  return {
    sunrise: new Date((jRise - 2440587.5) * 86400000),
    sunset: new Date((jSet - 2440587.5) * 86400000)
  };
}
