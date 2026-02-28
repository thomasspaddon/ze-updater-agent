import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const FLEETTRANSITION_URL = process.env.FLEETTRANSITION_URL || 'https://fleettransition.com';
const TOKEN = process.env.FLEETTRANSITION_TOKEN;

async function runCycle() {
  console.log('Starting quiet cycle...'); // Only 1 log
  
  try {
    const { data: sources } = await axios.get(`${FLEETTRANSITION_URL}/api/vehicles/sources`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      timeout: 30000
    });
    
    for (const source of sources.slice(0, 1)) {  // 1 OEM first
      const { data } = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'perplexity/sonnet-4-mini',
        messages: [{ role: 'user', content: `Extract ${source.oem} vehicles from ${source.base_url}. JSON only.` }],
        max_tokens: 2000,
        temperature: 0.1
      }, { timeout: 45000 });
      
      const vehicles = JSON.parse(data.choices[0].message.content);
      for (const vehicle of vehicles) {
        await axios.post(`${FLEETTRANSITION_URL}/api/vehicles/upsert`, vehicle, {
          headers: { Authorization: `Bearer ${TOKEN}` },
          timeout: 10000
        });
      }
    }
    console.log('✅ Cycle complete');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

cron.schedule('0 3 * * *', runCycle);
console.log('Agent ready');
runCycle();  // Test
