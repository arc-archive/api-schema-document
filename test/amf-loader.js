export const AmfLoader = {};
AmfLoader.load = async function(compact) {
  const file = '/demo-api' + (compact ? '-compact' : '') + '.json';
  const url = location.protocol + '//' + location.host + '/base/demo/' + file;
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      const data = JSON.parse(e.target.response);
      resolve(data);
    });
    xhr.open('GET', url);
    xhr.send();
  });
};
