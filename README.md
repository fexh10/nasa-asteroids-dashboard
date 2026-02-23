# NASA Asteroids Dashboard

> [English](#english) | [Italiano](#italiano)

---

> [!Note]
> A demo version of the dashboard is available [here](https://nasa-asteroids-dashboard.onrender.com/). It is automatically deployed on Render at every push to the `main` branch, but it may take a few minutes for the changes to be reflected on the live site. Please note that the demo version uses a free-tier database, which has limited storage capacity and may not contain all the data from the production version.

---

- [NASA Asteroids Dashboard](#nasa-asteroids-dashboard)
  - [English](#english)
    - [Project Overview](#project-overview)
    - [Features](#features)
    - [Technologies Used](#technologies-used)
    - [Installation and Setup](#installation-and-setup)
  - [Italiano](#italiano)
    - [Panoramica del Progetto](#panoramica-del-progetto)
    - [Funzionalità](#funzionalità)
    - [Tecnologie Utilizzate](#tecnologie-utilizzate)
    - [Installazione e Configurazione](#installazione-e-configurazione)


---

## English

### Project Overview

The NASA asteroids dashboard is a full-stack web application that provides users with real-time information about near-Earth objects. The dashboard fetches data from NASA's Near Earth Object Web Service (NeoWs) API and displays it in an interactive and user-friendly interface.

### Features

- **Automated synchronization**: a scheduleded cron job runs daily at 00:01 to fetch the latest data from the day before, ensuring that the dashboard always displays up-to-date information about near-Earth objects.
- **Database storage**: the fetched data is stored in a PostgreSQL database, allowing efficient querying and data management. The previous day's data is stored to maintain a historical record of near-Earth objects, and the start date is set to 2025-12-01 but can be modified before the first run.
- **Interactive dashboard**: dynamic charts powered by ApexCharts allow users to visualize the data in an engaging way, making it easier to understand trends and patterns.
- **Advanced filtering and search**: users can filter and search for specific near-Earth objects based on various criteria, such as size, distance from Earth, and potential hazard level.
- **Modern UI/UX design**: modern design built with Bootstrap 5 and CSS, featuring a native dark mode toggle.
- **API debouncing**: API calls are debounced to reduce unnecessary requests and improve performance.

### Technologies Used

- **Backend**: `Node.js` with `Express.js` for building the server and handling API requests. `node-cron` is used for scheduling the daily data fetch, and `pg` is used for interacting with the PostgreSQL database.
- **Frontend**: `HTML5`, `CSS3`, `Javascript`, `Bootstrap 5` and `ApexCharts`.
- **Database**: `PostgreSQL` for storing the fetched data.
  
### Installation and Setup

To run the project locally, it's necessary to have: 

- Node.js (`v22.22.0`)
- npm (`v10.9.4`)
- PostgreSQL (`v17.0`)
- A NASA API key (https://api.nasa.gov/)

Clone the repository and install the dependencies:

```bash
npm install
```

Create a `.env` file in the root directory of the project and add the following environment variables:
```
PORT=3000
DATABASE_URL=postgres://postgres_user:postgres_pwd@localhost:5432/nasa_asteroids
NASA_API_KEY=DEMO_KEY
INITIAL_SYNC_DATE=2025-12-01
```

And then start the server:

```bash
npm start
```

The dashboard will be accessible at `http://localhost:3000`.

## Italiano

### Panoramica del Progetto

La NASA Asteroids Dashboard è un'applicazione web full-stack che fornisce agli utenti informazioni in tempo reale sugli oggetti vicini alla Terra (Near-Earth Objects - NEO). La dashboard recupera i dati dall'API Near Earth Object Web Service (NeoWs) della NASA e li mostra in un'interfaccia interattiva e intuitiva.

### Funzionalità

- **Sincronizzazione automatica**: un cron job programmato viene eseguito ogni giorno alle 00:01 per recuperare gli ultimi dati del giorno precedente, assicurando che la dashboard mostri sempre informazioni aggiornate sugli oggetti vicini alla Terra.
- **Archiviazione su database**: i dati recuperati vengono salvati in un database PostgreSQL, permettendo interrogazioni e una gestione dei dati efficienti. I dati del giorno precedente vengono salvati per mantenere uno storico degli oggetti, e la data di inizio della sincronizzazione è impostata al 2025-12-01 ma può essere modificata prima del primo avvio.
- **Dashboard interattiva**: grafici dinamici basati su ApexCharts permettono agli utenti di visualizzare i dati in modo accattivante, facilitando la comprensione di tendenze e pattern.
- **Filtri e ricerca avanzati**: gli utenti possono filtrare e cercare specifici oggetti in base a vari criteri, come dimensioni, distanza dalla Terra e potenziale livello di pericolosità.
- **Design UI/UX moderno**: design moderno realizzato con Bootstrap 5 e CSS, completo di un toggle nativo per la modalità scura.
- **Debouncing delle API**: le chiamate API utilizzano il debouncing per ridurre le richieste non necessarie e migliorare le prestazioni generali.

### Tecnologie Utilizzate

- **Backend**: `Node.js` con `Express.js` per costruire il server e gestire le richieste API. `node-cron` viene utilizzato per programmare la sincronizzazione giornaliera dei dati, e `pg` per interagire con il database PostgreSQL.
-  **Frontend**: `HTML5`, `CSS3`, `Javascript`, `Bootstrap 5` e `ApexCharts`.
- **Database**: `PostgreSQL` per l'archiviazione dei dati recuperati.

### Installazione e Configurazione

Per eseguire il progetto localmente, è necessario avere:

- Node.js (`v22.22.0`)
- npm (`v10.9.4`)
- PostgreSQL (`v17.0`)
- Una chiave API della NASA (https://api.nasa.gov/)

Clona il repository e installa le dipendenze:
```bash
npm install
```

Crea un file `.env` nella directory principale del progetto e aggiungi le seguenti variabili d'ambiente:
```
PORT=3000
DATABASE_URL=postgres://postgres_user:postgres_pwd@localhost:5432/nasa_asteroids
NASA_API_KEY=DEMO_KEY
INITIAL_SYNC_DATE=2025-12-01
```

E poi avvia il server:
```bash
npm start
```

La dashboard sarà accessibile all'indirizzo `http://localhost:3000`.