import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = 'Pn7wetx.Ykgu5af';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function runCycle() {
  console.log('Running...');  // 1 log only
  
  try {
    // Freightliner only (1 OEM)
    const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Freightliner eCascadia specs JSON: {OEM:"Freightliner", Model:"eCascadia", Range_miles:230, Battery_kWh:438, VehicleType:"Tractor", GVWRClass:"Class 8", PriceLow:450000}' }],
      max_tokens: 200  // Tiny response
    }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` } });
    
    const vehicles = [JSON.parse(data.choices[0].message.content)];  // 1 vehicle
    
    await axios.post('https://ujgfdlilxorrgojsxjqz.supabase.co/functions/v1/vehicles-upsert', vehicles[0], {
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Done');  // 1 log only
  } catch (e) {
    console.error(e.message);  // 1 error log max
  }
}

cron.schedule('0 3 * * *', runCycle);
runCycle();
