export type RedirectMap = Record<string, string>;

function normalizeSourcePath(source: string): string {
  let normalized = source;
  try { normalized = decodeURI(source); } catch { /* Malformed encodings remain exact paths. */ }
  return normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

export function validateRedirects(value: unknown): RedirectMap {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Redirects must be an object of exact source paths to local target paths.');
  }
  const redirects: RedirectMap = {};
  for (const [source, target] of Object.entries(value)) {
    if (!source.startsWith('/') || source.startsWith('//') || /[?#\r\n]/.test(source)) {
      throw new Error(`Invalid legacy redirect source: ${source}`);
    }
    if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//') || /[\r\n\\]/.test(target)) {
      throw new Error(`Redirect ${source} must target a local absolute path.`);
    }
    const parsed = new URL(target, 'https://danielgaio.com');
    if (parsed.origin !== 'https://danielgaio.com') throw new Error(`Redirect ${source} must stay on the website.`);
    const location = parsed.pathname + parsed.search + parsed.hash;
    const normalizedSource = normalizeSourcePath(source);
    if (normalizedSource === normalizeSourcePath(parsed.pathname)) throw new Error(`Redirect ${source} points to itself.`);
    if (redirects[normalizedSource] && redirects[normalizedSource] !== location) throw new Error(`Conflicting encoded/slash variants for ${source}.`);
    redirects[normalizedSource] = location;
  }
  return redirects;
}

/** Exact legacy redirects precede the export's directory-index rewrite. */
export function createViewerRequestCode(redirects: RedirectMap = {}): string {
  const code = `var redirects = ${JSON.stringify(validateRedirects(redirects))};
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var lookupUri = uri;
  try { lookupUri = decodeURI(uri); } catch (error) {}
  if (lookupUri.length > 1 && lookupUri.endsWith('/')) lookupUri = lookupUri.slice(0, -1);
  var target = redirects[lookupUri];
  if (!target && uri === '/') target = '/en/';
  if (target) {
    var pairs = [];
    var query = request.querystring || {};
    Object.keys(query).forEach(function(key) {
      var field = query[key];
      var values = field.multiValue || [{value: field.value}];
      values.forEach(function(item) {
        pairs.push(key + '=' + (item.value || ''));
      });
    });
    if (pairs.length) target += (target.indexOf('?') === -1 ? '?' : '&') + pairs.join('&');
    return {statusCode: 301, statusDescription: 'Moved Permanently', headers: {location: {value: target}}};
  }
  if (uri.endsWith('/')) request.uri += 'index.html';
  else if (!uri.split('/').pop().includes('.')) request.uri += '/index.html';
  return request;
}`;
  if (Buffer.byteLength(code, 'utf8') > 10_000) {
    throw new Error('The exact redirect map exceeds the CloudFront Function 10 KB limit.');
  }
  return code;
}
