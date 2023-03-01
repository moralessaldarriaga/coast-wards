import './app.scss';
import { useMapBox } from './src/js/map';


// map legend scroll to top element
const scrollOfMap = () => {
    const indexHome = document.getElementById('app');
    indexHome.scrollIntoView({ 
        behavior: 'smooth'
    });
} 

useMapBox();
document.getElementById('mapbox_legend__js').onclick = scrollOfMap;

// document.querySelector('h1').innerHTML= `Hello`;

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="/vite.svg" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//   </div>
// `

// setupCounter(document.querySelector('#counter'))
