import http from 'http';
import URL from 'url';

import { promises as fs } from 'fs'
import { DOMParser } from '@xmldom/xmldom'
import canvas from 'canvas'
import { Canvg, presets } from 'canvg'

const preset = presets.node({ DOMParser, canvas, fetch });

//'./032.png', 'https://mascotsitecore-1ccb8.kxcdn.com/94801CE3C9954D2EA7D4C9FDFF329C9D-en.svg',
async function svgToPNG(url) {
    //const svg = await fs.readFile(input, 'utf8')
    const svg = await fetch(url).then(r => r.text());

    const cv = preset.createCanvas(72, 72)
    const ctx = cv.getContext('2d')
    const v = Canvg.fromString(ctx, svg, preset)

    // Render only first frame, ignoring animations.
    await v.render()

    const png = cv.toBuffer();
    //await fs.writeFile(output, png);
	return png;
}

http.createServer(async function (req, res) {
	const uri = URL.parse(`http://localhost${req.url}`);
	let link = decodeURIComponent(uri.query||'');
	if(link.indexOf('url=')==0)link=link.substr(4).trim();
	
	console.log(link);
	
	if(link.length == 0){
		res.write('');
		return res.end();
	}
	
	let buf = await svgToPNG(link);
	res.setHeader('Content-Type', 'image/png');
	res.write(buf);
	res.end();
	
}).listen(8080); //the server object listens on port 8080
