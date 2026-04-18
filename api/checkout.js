import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skuData = JSON.parse(readFileSync(join(__dirname, '../lib/sku_map.json'), 'utf8'));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { skus, qtds } = req.query;

  if (!skus) {
    return res.status(400).json({ error: 'Parametro skus e obrigatorio. Ex: /api/checkout?skus=SKU1,SKU2' });
  }

  const skuList = skus.split(',').map(s => s.trim());
  const qtdList = qtds ? qtds.split(',') : skuList.map(() => '1');

  const cartParts = [];
  for (let i = 0; i < skuList.length; i++) {
    const variantId = skuData[skuList[i]];
    if (variantId) cartParts.push(`${variantId}:${parseInt(qtdList[i] || '1')}`);
  }

  if (cartParts.length === 0) {
    return res.status(404).json({ error: 'Nenhum SKU encontrado' });
  }

  const cartUrl = `https://vpahv8-rr.myshopify.com/cart/${cartParts.join(',')}`;
  return res.redirect(302, cartUrl);
}
