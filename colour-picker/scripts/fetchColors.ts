import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

interface Color {
  name: string;
  hex: string;
  rgb: string;
}

async function fetchColors() {
  const colors: Color[] = [];
  
  // Fetch colors from all 4 pages
  for (let page = 1; page <= 4; page++) {
    const url = page === 1 
      ? 'https://color-term.com/winsornewton-colors/index.html'
      : `https://color-term.com/winsornewton-colors/${page}/index.html`;
      
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Find all h2 elements (color names)
      $('h2').each((_, element) => {
        const h2 = $(element);
        const h3 = h2.next('h3');
        const h4 = h3.next('h4');
        
        if (h2 && h3 && h4) {
          const name = h2.text().trim();
          const hex = h3.text().trim();
          const rgb = h4.text().trim();
          
          if (name && hex && rgb) {
            colors.push({
              name: name.replace(/-/g, ' '),
              hex: hex.trim(),
              rgb: rgb.trim()
            });
          }
        }
      });
      
      console.log(`Fetched colors from page ${page}`);
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
    }
  }

  // Save to a JSON file
  const outputPath = path.join(process.cwd(), 'src', 'data', 'winsorNewtonColors.json');
  
  // Ensure the directory exists
  fs.mkdirSync(path.join(process.cwd(), 'src', 'data'), { recursive: true });
  
  // Write the colors to the file
  fs.writeFileSync(
    outputPath,
    JSON.stringify(colors, null, 2),
    'utf-8'
  );

  console.log(`Saved ${colors.length} colors to ${outputPath}`);
  
  // Print first few colors as example
  console.log('\nExample colors:');
  colors.slice(0, 3).forEach(color => {
    console.log(`${color.name}: ${color.hex} (${color.rgb})`);
  });
}

// Run the script
fetchColors().catch(console.error); 