// sw.js - Versão SIMPLIFICADA e FUNCIONAL
const CACHE_NAME = 'fenix-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/main.js',
  '/logo-fenix-small.png',
  '/logo-fenix.png'
];

// INSTALAÇÃO
self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto, adicionando arquivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// ATIVAÇÃO
self.addEventListener('activate', event => {
  console.log('Service Worker ativado!');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH (SERVE DO CACHE OU REDE)
self.addEventListener('fetch', event => {
  // Ignora requisições do Live Server WebSocket
  if (event.request.url.includes('ws://')) return;
  
  // Ignora requisições do Chrome DevTools
  if (event.request.url.includes('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrou
        if (response) {
          return response;
        }
        
        // Se não tem no cache, busca na rede
        return fetch(event.request)
          .then(networkResponse => {
            // Não cacheia se não for sucesso
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Adiciona ao cache para próximo uso
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.log('Fetch falhou, retornando fallback:', error);
            // Se offline e não tem no cache, retorna página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline - Sem conexão');
          });
      })
  );
});

console.log('Service Worker carregado!');