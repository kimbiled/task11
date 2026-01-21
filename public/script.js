const out = document.getElementById('output');
const statusLine = document.getElementById('statusLine');

function setOutput(status, data) {
  statusLine.textContent = `Status: ${status}`;
  statusLine.className =
    'status ' + (status >= 200 && status < 300 ? 'ok' : 'bad');
  out.textContent =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function clearOutput() {
  statusLine.textContent = 'Status: —';
  statusLine.className = 'status';
  out.textContent = '{}';
}

async function request(method, url, body) {
  try {
    const opts = { method, headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    const text = await res.text();

    // Try JSON parse, fallback to raw
    let parsed = text;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch (e) {}

    setOutput(res.status, parsed);
  } catch (err) {
    setOutput(0, { error: String(err) });
  }
}

function buildProductsUrl() {
  const category = document.getElementById('qCategory').value.trim();
  const minPrice = document.getElementById('qMinPrice').value.trim();
  const sort = document.getElementById('qSort').value.trim();
  const fields = document.getElementById('qFields').value.trim();

  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (minPrice) params.set('minPrice', minPrice);
  if (sort) params.set('sort', sort);
  if (fields) params.set('fields', fields);

  const qs = params.toString();
  return '/api/products' + (qs ? `?${qs}` : '');
}

function openProductsUrl() {
  window.open(buildProductsUrl(), '_blank');
}

async function getProducts() {
  await request('GET', buildProductsUrl());
}

function openByIdUrl() {
  const id = document.getElementById('getId').value.trim() || '1';
  window.open(`/api/products/${encodeURIComponent(id)}`, '_blank');
}

async function getById() {
  const id = document.getElementById('getId').value.trim();
  if (!id) return setOutput(0, { error: 'Введите id' });
  await request('GET', `/api/products/${encodeURIComponent(id)}`);
}

function fillPostSample() {
  document.getElementById('postBody').value = `{
  "name": "Mouse",
  "price": 50,
  "category": "Electronics"
}`;
}

async function postProduct() {
  const raw = document.getElementById('postBody').value;
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return setOutput(0, { error: 'POST body is not valid JSON' });
  }
  await request('POST', '/api/products', body);
}

function fillPutSample() {
  document.getElementById('putBody').value = `{
  "name": "Mouse Pro",
  "price": 80,
  "category": "Electronics"
}`;
}

async function putProduct() {
  const id = document.getElementById('putId').value.trim();
  if (!id) return setOutput(0, { error: 'Введите id для PUT' });

  const raw = document.getElementById('putBody').value;
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return setOutput(0, { error: 'PUT body is not valid JSON' });
  }

  await request('PUT', `/api/products/${encodeURIComponent(id)}`, body);
}

async function deleteProduct() {
  const id = document.getElementById('deleteId').value.trim();
  if (!id) return setOutput(0, { error: 'Введите id для DELETE' });
  await request('DELETE', `/api/products/${encodeURIComponent(id)}`);
}
