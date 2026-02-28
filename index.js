import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://ujgfdlilxorrgojsxjqz.supabase.co';
const TOKEN = 'Pn7wetx.Ykgu5af';

async function getSources() {
  const { data } = await axios.get(`${SUPABASE_URL}/functions/v1/vehicles-sources`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return data;
}

async function upsertVehicle(vehicle) {
  await axios.post(`${SUPABASE_URL}/functions/v1/vehicles-upsert`, vehicle, {
    headers: { 
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
}

async function runCycle() {
  console.log('Starting Edge Function cycle...');
  
  const sources = await getSources();
  console.log(`Found ${sources.length} sources`);
  
  for (const source of sources.slice(0, 1)) {
    console.log(`Scraping ${source.oem}...`);
    
    const { data } = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'perplexity/sonnet-4-mini',
      messages: [{ role: 'user', content: `Extract ${source.oem} EV specs from ${source.base_url}. Return JSON array: OEM, Model, Range_miles, Battery_kWh, VehicleType.` }],
      max_tokens: 2000
    });
    
    const vehicles = JSON.parse(data.choices[0].message.content);
    
    for (const vehicle of vehicles.slice(0, 2)) {
      await upsertVehicle(vehicle);
      console.log(`✅ Upserted ${vehicle.Model}`);
    }
  }
  console.log('✅ Complete');
}

cron.schedule('0 3 * * *', runCycle);
console.log('Edge agent ready');
runCycle();
