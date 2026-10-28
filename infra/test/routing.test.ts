import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import fs from 'node:fs';
import { createViewerRequestCode, validateRedirects } from '../lib/routing.js';

function route(uri: string, querystring: Record<string, unknown> = {}, redirects: Record<string, string> = {}) {
  const context = vm.createContext({ event: { request: { uri, querystring, method: 'GET' } } });
  return vm.runInContext(`${createViewerRequestCode(redirects)}; handler(event);`, context) as {
    uri?: string; statusCode?: number; headers?: { location: { value: string } };
  };
}

test('English entrypoint is a permanent redirect, retaining encoded and repeated query values', () => {
  const result = route('/', { source: { value: 'a%20b' }, tag: { value: 'one', multiValue: [{ value: 'one' }, { value: 'two' }] } });
  assert.equal(result.statusCode, 301);
  assert.equal(result.headers?.location.value, '/en/?source=a%20b&tag=one&tag=two');
});

test('known legacy article paths redirect to local exports before index resolution', () => {
  const result = route('/introdu%C3%A7%C3%A3o-012345abcdef', {}, { '/introdu%C3%A7%C3%A3o-012345abcdef': '/pt/blog/introdução/' });
  assert.equal(result.statusCode, 301);
  assert.equal(result.headers?.location.value, '/pt/blog/introdu%C3%A7%C3%A3o/');
  assert.equal(route('/introdução-012345abcdef/', {}, { '/introdu%C3%A7%C3%A3o-012345abcdef': '/pt/blog/introdução/' }).statusCode, 301);
});

test('existing Medium feed subscriptions permanently reach the static feed without losing query values', () => {
  for (const uri of ['/feed', '/feed/']) {
    const result = route(uri, {
      source: { value: 'rss%20reader' },
      tag: { value: 'one', multiValue: [{ value: 'one' }, { value: 'two' }] },
    });
    assert.equal(result.statusCode, 301, uri);
    assert.equal(result.headers?.location.value, '/feed.xml?source=rss%20reader&tag=one&tag=two', uri);
  }
  assert.equal(route('/feed.xml').uri, '/feed.xml');
  assert.equal(route('/feed.xml').statusCode, undefined);
  assert.equal(route('/feed-unknown').statusCode, undefined);
});

test('directory and extensionless routes resolve to their own index; assets remain intact', () => {
  assert.equal(route('/en/').uri, '/en/index.html');
  assert.equal(route('/pt/blog/an-article/').uri, '/pt/blog/an-article/index.html');
  assert.equal(route('/en').uri, '/en/index.html');
  assert.equal(route('/_next/static/chunk.js').uri, '/_next/static/chunk.js');
  assert.equal(route('/favicon.ico').uri, '/favicon.ico');
  assert.equal(route('/not-a-real-page').uri, '/not-a-real-page/index.html');
});

test('unlisted old-looking paths have no unverified external fallback', () => {
  const result = route('/unknown-012345abcdef');
  assert.equal(result.statusCode, undefined);
  assert.equal(result.uri, '/unknown-012345abcdef/index.html');
});

test('reject external/open redirects, malformed sources, loops and oversize functions', () => {
  assert.throws(() => validateRedirects({ '/old': 'https://example.com' }), /local/);
  assert.throws(() => validateRedirects({ '/old': '//example.com' }), /local/);
  assert.throws(() => validateRedirects({ '/old': '/\\example.com' }), /local/);
  assert.throws(() => validateRedirects({ '/old': '/old' }), /itself/);
  assert.throws(() => validateRedirects({ '/old': '/old/' }), /itself/);
  assert.throws(() => validateRedirects({ '/ol%C3%A1': '/new/', '/olá/': '/different/' }), /Conflicting/);
  assert.throws(() => validateRedirects({ '/old?query=1': '/new/' }), /source/);
  assert.throws(() => createViewerRequestCode({ [`/${'a'.repeat(10_000)}`]: '/new/' }), /10 KB/);
});

test('every imported legacy URL variant redirects locally with valid encoded Location headers', () => {
  const file = new URL('../../content/blog/redirects.json', import.meta.url);
  const redirects = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
  assert(Object.keys(redirects).length > 0);
  assert(Buffer.byteLength(createViewerRequestCode(redirects), 'utf8') <= 10_000);
  for (const [source, target] of Object.entries(redirects)) {
    const normalizedTarget = new URL(target, 'https://danielgaio.com');
    const expected = normalizedTarget.pathname + normalizedTarget.search + normalizedTarget.hash;
    const result = route(source, { source: { value: 'medium%20archive' } }, redirects);
    assert.equal(result.statusCode, 301, source);
    assert.equal(result.headers?.location.value, expected + (expected.includes('?') ? '&' : '?') + 'source=medium%20archive', source);
    assert(!/[^\x20-\x7e]/.test(result.headers?.location.value ?? ''), source);
  }
});
