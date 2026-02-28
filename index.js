import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = 'Pn7wetx.Ykgu5af';
const OPENAI_KEY = process.env.OPENAI_API_KEY || 'sk-fake';

async function testUpsert() {
  try {
    await axios.post('https://ujgfdlilxorrgojsxjqz.supabase.co/functions/v1/vehicles-upsert', {
      OEM: 'Freightliner',
      Model: 'eCascadia',
      YearAvailable: '2026',
      Powertrain: 'BEV',
      VehicleType: 'Tractor',
      Range_miles: 230,
      Battery_kWh: 438
    }, {
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
    });
  } catch(e) {}
}

cron.schedule('0 3 * * *', testUpsert);
testUpsert();
