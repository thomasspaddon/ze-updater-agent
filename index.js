import axios from 'axios';
import cron from 'node-cron';

const SUPABASE_EDGE = 'https://ujgfdlilxorrgojsxjqz.supabase.co/functions/v1/vehicles-upsert';
const TOKEN = 'Pn7wetx.Ykgu5af';

async function testInsert() {
  // Hardcoded test - no API calls
  axios.post(SUPABASE_EDGE, {
  OEM: 'Freightliner',
  Model: 'eCascadia AgentTest',
  YearAvailable: '2026',
  Powertrain: 'BEV',
  VehicleType: 'Tractor',  // ← This was missing!
  Range_miles: 230,
  Battery_kWh: 438,
  GVWRClass: 'Class 8'
}, {
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
});

cron.schedule('0 3 * * *', testInsert);
testInsert();
