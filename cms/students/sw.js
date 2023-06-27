const staticCache = 'students-app-v7';
const dynamicCache = 'd-students-app-v7';
// list of all static files, which we need in cache
const assetUrls = [
    './index.html',
    './offline.html',
    './student/src/css/style-students.css',
    './student/src/js/students-main.js'
];
  
  self.addEventListener('install', async event => {
    console.log('V1 installing…');
    const cache = await caches.open(staticCache);
    cache.addAll(assetUrls);
    console.log("success install");  
  });

  // update cache files
  self.addEventListener('activate', async event =>
  {
    console.log("Activating...");
    // get all keys in current cache
    const cacheNames = await caches.keys();
    // delete all unmatched
    await Promise.all(
      cacheNames.filter(name => name !== staticCache).filter(name => name !== dynamicCache)
      // delete other cache
      .map(name => caches.delete(name))
    )
  });
  
// requesting
self.addEventListener('fetch', event => {
  console.log("Fetch", event.request.url);
  const {request} = event;
  const url = new URL(request.url)
  // get data located on server
  if(url.origin === location.origin)
  {
    event.respondWith(cacheFirst(request));
  }
  else
  {
    event.respondWith(netWorkFirst(request));
  }
 
});

async function cacheFirst(request)
{
  console.log("Fetch from cache");
  // found smth in cache
  const cached = await caches.match(request);
  // get it from cache or if not, then from server
  return cached ?? await fetch(request);
}
async function netWorkFirst(request)
{
  console.log("Fetch from network");
  // for caching POST queries
  const cache = await caches.open(dynamicCache);
  try {
      const response = await fetch(request);
      // put response in cache
      cache.put(request, response.clone());
      return response;
  }
  // otherwise get data from cache
  catch(e)
  {
    const cached = await cache.match(request);
    // if no data, then go offline
    return cached ?? cache.match('/offline.html');
  }
}