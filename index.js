import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://ujgfdlilxorrgojsxjqz.supabase.co/functions/v1';
const TOKEN = 'Pn7wetx.Ykgu5af';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function scrapeOEM(oemName, baseUrl) {
  const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',  // FREE tier
    messages: [{
      role: 'user',
      content: `Extract latest ${oemName} zero-emission truck specs from ${baseUrl}.
Return JSON array with: OEM, Model, VehicleType, Range_miles, Battery_kWh, GVWRClass, PriceLow, ProductionStatus.
Use realistic 2026 specs.`
    }],
    max_tokens: 1500
  }, {
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}` }
  });
  
  return JSON.parse(data.choices[0].message.content);
}

async function upsertVehicle(vehicle) {
  await axios.post(`${SUPABASE_URL}/vehicles-upsert`, vehicle, {
    headers: { 
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
}

async function runCycle() {
  console.log('🕷️ OpenAI agent starting...');
  
  // Test 1 OEM
  const vehicles = await scrapeOEM('Freightliner', 'https://freightliner.com/electric-vehicles');
  
  for (const vehicle of vehicles.slice(0, 3)) {
    await upsertVehicle(vehicle);
    console.log(`✅ ${vehicle.Model}`);
  }
  
  console.log('✅ Complete');
}

cron.schedule('0 3 * * *', runCycle);
console.log('OpenAI agent ready');
runCycle();
