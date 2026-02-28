import axios from 'axios';
import cron from 'node-cron';

const EDGE_URL = 'https://ujgfdlilxorrgojsxjqz.supabase.co/functions/v1/vehicles-upsert';
const TOKEN = 'Pn7wetx.Ykgu5af';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function scrapeOEMs() {
  // Freightliner
  const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Latest Freightliner eCascadia specs. JSON with ALL fields: OEM Model YearAvailable etc.' }],
    max_tokens: 500
  }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` } });
  
  const vehicles = JSON.parse(data.choices[0].message.content);
  for (const v of vehicles) {
    await axios.post(EDGE_URL, v, {
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
    });
  }
}

cron.schedule('0 3 * * *', scrapeOEMs);
scrapeOEMs();
