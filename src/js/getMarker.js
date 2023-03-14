export const getData = async() => {
    const url = 'http://stagingback.guardacostascorona.com/api/contribute';

    const resp = await fetch(url);
    const data = await resp.json();
    
    return data; 
}
