import 'unpoly';
import '@picocss/pico/css/pico.jade.min.css'
import persist from '@alpinejs/persist'
import Alpine from 'alpinejs';
import './styles.css'
import 'unpoly/unpoly.min.css'

import { tracksComponent } from './components/tracks';
import { playerPageComponent } from './components/playerPage';

window.alpine = Alpine;
Alpine.plugin(persist);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

Alpine.data('tracks', tracksComponent);
Alpine.data('playerPage', playerPageComponent);

Alpine.start();
