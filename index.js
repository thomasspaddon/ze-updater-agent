import axios from 'axios';
import cron from 'node-cron';

const SUPABASE_EDGE = 'https://ujgfdlilxorrgojsxjqz.supabase.co/functions/v1/vehicles-upsert';
const TOKEN = 'Pn7wetx.Ykgu5af';

async function testInsert() {
  // Hardcoded test - no API calls
  axios.post(SUPABASE_EDGE, {
    OEM: 'Freightliner',
    Model: 'eCascadia Test',
    YearAvailable: '2026',
    Powertrain: 'BEV',
    VehicleType: 'Tractor',
    Range_miles: 230
  }, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
  }).catch(() => {});  // Silent fail
}

cron.schedule('0 3 * * *', testInsert);
testInsert();
