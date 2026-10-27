import { createPinia } from 'pinia'

/**
 * Eine Pinia-Instanz für App und Router-Guard.
 * So sieht der Guard denselben Auth-Store wie die Komponenten.
 */
export const pinia = createPinia()
