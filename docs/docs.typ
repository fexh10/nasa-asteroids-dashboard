#import "@preview/rubber-article:0.5.1": *
#import "@preview/zebraw:0.6.1": *

#show: zebraw
#show link: set text(fill: blue)

#show: article.with(
  page-margins: 1.5in,
  page-paper: "a4",
  lang: "it",
  header-display: true,
  header-title: "Relazione Progetto"
)

#maketitle(
  title: "Relazione Progetto",
  authors: ("Fernando H. Gavezzotti",),
  date: none,
)

#outline()
#pagebreak()


= API NASA 

Per la realizzazione della dashboard l'API NASA scelta è stata `Asteroids-NeoWs`, che fornisce dati sugli asteroidi vicini alla Terra; in particolare, la scelta è ricaduta su questa API per la possibilità ampia di visualizzazione dei dati, che si presta bene alla realizzazione di una dashboard. In particolare i dati forniti da questa API che sono stati utilizzati sono: 

- ID dell'asteroide
- Nome dell'asteroide
- Nasa JPL URL (link alla pagina dell'asteroide sul sito della NASA)
- Magnitudine assoluta dell'asteroide
- Diametro stimato dell'asteroide
- Se l'asteroide è potenzialmente pericoloso o meno
- Se l'asteroide è una sentinella o meno
- Data di avvicinamento alla terra
- Velocità dell'asteroide
- Distanza dell'asteroide dalla terra

= Architettura

L'architettura del progetto è stata progettata per essere modulare, scalabile e sicura. Il progetto è stato suddiviso in tre componenti principali:

- Database
- Backend
- Frontend

== Database

Per il database è stato scelto il sistema di gestione dei database relazionali PostgreSQL. 

#figure(
  image("assets/db_diagram.svg", height: 30%),
  caption: "Diagramma del database", 
)

Per la realizzazione del database è stata utilizzata una tecnica di normalizzazione separando in tabelle distinte le informazioni sugli asteroidi e le informazioni sugli avvicinamenti alla terra. In questo modo è stato possibile evitare la ridondanza dei dati e garantire l'integrità referenziale tra le tabelle. Inoltre è stato creato un index in SQL tra `idx_close_approach_date` e `close_approach_date` per migliorare le performance delle query che filtrano per data di avvicinamento.

== Backend

Per il backend è stato utilizzato Node JS con il framework Express. Il backend si occupa di:

- Popolare il database con i dati forniti dall'API NASA, che avviene in due modi: al primo avvio del server vengono inserite le informazioni a partire da una data di inizio fino al giorno precedente a quello attuale, e successivamente viene eseguito un processo schedulato ogni giorno per inserire le informazioni del giorno precedente.
- Fornire un'API interna al frontend per recuperare i dati dal database, in modo da non esporre direttamente l'API NASA o il database al frontend.

== Frontend

Il frontend è stato realizzato usando JavaScript, HTML e CSS per creare una dashboard moderna e leggibile. Per la visualizzazione dei dati è stato utilizzato ApexCharts, una libreria JavaScript per la creazione di grafici interattivi. 

= Query principali

Di seguito sono riportate le query principali utilizzate per recuperare i dati dal database:
#v(1.3em)


```sql
-- Query per recuperare tutti gli asteroidi con i loro avvicinamenti alla terra ordinati per data di avvicinamento. Viene utilizzata dall'API per interna per recuperare i dati da visualizzare nella dashboard.
SELECT 
  a.id,
  a.name, 
  a.nasa_jpl_url,
  a.is_potentially_hazardous,
  a.is_sentry_object,
  a.absolute_magnitude_h,
  a.estimated_diameter_min_m,
  a.estimated_diameter_max_m,
  TO_CHAR(c.close_approach_date, 'YYYY-MM-DD') as close_approach_date, 
  c.miss_distance_km, 
  c.relative_velocity_kmh
FROM close_approaches c
JOIN asteroids a ON c.asteroid_id = a.id
ORDER BY c.close_approach_date ASC
```
#pagebreak()
```sql
-- Query per inserire gli asteroidi recuperati dall'API NASA nel database. I campi $1, $2, ... $8 rappresentano i valori da inserire, che vengono passati come parametri alla query, in modo da prevenire attacchi di SQL injection. La clausola ON CONFLICT (id) DO NOTHING garantisce che se un asteroide con lo stesso ID esiste già nel database, l'inserimento viene ignorato, evitando così duplicati o errori.
INSERT INTO asteroids (
  id, name, nasa_jpl_url, absolute_magnitude_h, 
  estimated_diameter_min_m, estimated_diameter_max_m, 
  is_potentially_hazardous, is_sentry_object
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (id) DO NOTHING;
```

```sql
-- Query per inserire gli avvicinamenti alla terra recuperati dall'API NASA nel database.
INSERT INTO close_approaches (
  asteroid_id, close_approach_date, epoch_date_close_approach, 
  relative_velocity_kmh, miss_distance_km, orbiting_body
) VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (asteroid_id, epoch_date_close_approach) DO NOTHING;
```

= Insight ottenuti

Osservando i dati raccolti e visualizzati tramite grafici, è possibile ottenere alcune informazioni interessanti.

+ Guardando il grafico "Hazard Assessment" è possibile notare che la maggior parte degli asteroidi vicini alla Terra non sono potenzialmente pericolosi, ma ci sono comunque alcuni asteroidi che lo sono, e che quindi è importante monitorarli attentamente.
+ L'affermazione del punto precedente si conferma guardando anche il grafico "Daily Approach Count", che mostra che per ciascun giorno la maggior parte degli avvicinamenti alla Terra sono di asteroidi non pericolosi.
+ Dal grafico 3D è possibile notare che gli asteroidi più vicini alla Terra tendono ad essere anche quelli classificati come potenzialmente pericolosi.
+ Alcuni asteroidi classificati come non pericolosi sono monitorati costantamente dalla NASA (sentry object) perché potrebbero rappresentare una minaccia in futuro.

= Riflessione Personale e Contestuale

Lavorare con dati esterni e API pubbliche è una sfida che ho affrontato durante lo sviluppo di #link("https://github.com/fexh10/aw-cli", "aw-cli"), un'interfaccia a riga di comando (CLI) che interagisce con l'API GraphQL di #link("https://anilist.co", "AniList"). Questa esperienza mi ha insegnato che le API pubbliche possono essere imprevedibili, soggette a cambiamenti e possono presentare limitazioni di rate limit. Per questo motivo, nel progetto della dashboard, ho implementato un deboucing delle API interne per evitare di sovraccaricare il server con richieste frequenti. Per lo stesso motivo è presente un database che viene popolato con i dati dell'API NASA, in modo da non dover fare richieste all'API esterna ogni volta che il frontend richiede i dati.

= Proposte di miglioramento

Il progetto potrebbe essere espanso e migliorato in diversi modi:

+ Quando vengono presi i dati giornalieri dall'API NASA, se sono presenti asteroidi pericolosi o molto vicini alla Terra, potrebbe essere inviata una notifica via email, Telegram Bot o altro canale di comunicazione, in modo da avvisare gli utenti senza dover accedere alla dashboard.
+ Potrebbe essere integrata anche l'API CAD, che fornisce i dati sugli asteroidi che si avvicineranno e che si sono già avvicinati alla Terra. In questo modo sarebbe possibile visualizzare il percorso che un asteroide ha seguito nel tempo e prevederne il percorso futuro, in modo da avere una visione più completa della situazione.
+ Potrebbe essere implementata una generazione di report periodici da un sistema di intelligenza artificiale, che analizza i dati raccolti e fornisce un'analisi approfondita della situazione degli asteroidi vicini alla Terra, evidenziando eventuali trend o anomalie nei dati. 