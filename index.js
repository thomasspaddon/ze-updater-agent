import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const FLEETTRANSITION_URL = process.env.FLEETTRANSITION_URL || 'https://fleettransition.com';
const TOKEN = process.env.FLEETTRANSITION_TOKEN;

const perplexity = axios.create({
  baseURL: 'https://api.perplexity.ai/chat/completions',
  headers: { Authorization: `Bearer ${PERPLEXITY_API_KEY}` }
});

const VEHICLE_SCHEMA = {
  OEM: 'string', Model: 'string', YearAvailable: 'string', Powertrain: 'string',
  VehicleType: 'string', Range_miles: 'number', Battery_kWh: 'number',
  Efficiency_mi_kWh: 'number', MaxAC_kW: 'number', MaxDC_kW: 'number',
  GVWRClass: 'string', GVWR_lbs: 'number', Payload_lbs: 'number',
  Towing_lbs: 'number', Seats: 'number', PriceLow: 'number', PriceHigh: 'number',
  ChargingReqs: 'string', ProductionStatus: 'string', OEMSupport: 'string',
  HVIPIncentive: 'number', HVIPCategory: 'string', HVIPVehicleTypes: 'string',
  HVIPDealers: 'string', SalesContact: 'string', NewConversion: 'string'
};

async function getSources() {
  const res = await axios.get(`${FLEETTRANSITION_URL}/api/vehicles/sources`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  return res.data;
}

async function upsertVehicle(vehicle) {
  return axios.post(`${FLEETTRANSITION_URL}/api/vehicles/upsert`, vehicle, {
    headers: { 
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
}

async function scrapeOEM(oemData) {
  console.log(`🕷️  ${oemData.oem}`);
  
  const prompt = `Extract ${oemData.oem} ZE vehicles using EXACT fields: ${JSON.stringify(VEHICLE_SCHEMA)}.
Start: ${oemData.base_url}. JSON array only.`;

  const { data } = await perplexity.post('', {
    model: 'perplexity/sonnet-4-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 8000
  });

  try {
    return JSON.parse(data.choices[0].message.content).filter(v => v.confidence >= 0.7);
  } catch {
    return [];
  }
}

async function runCycle() {
  console.log('🚀 Update cycle...');
  const sources = await getSources();
  let count = 0;

  for (const source of sources) {
    const vehicles = await scrapeOEM(source);
    for (const v of vehicles) {
      try {
        await upsertVehicle(v);
        count++;
      } catch (e) {
        console.error(`❌ ${v.Model}:`, e.message);
      }
    }
  }
  console.log(`✅ ${count} vehicles updated`);
}

cron.schedule('0 3 * * *', runCycle);
console.log('👹 Agent running (3AM daily)');
runCycle();  // Test run
