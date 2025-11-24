# Territory Rush — MVP skeleton

Két szöveges specifikáció alapján felhúzott alap projektváz: backend (Express + WebSocket game-server), frontend (Vue 3 + Vite + Pixi), Postgres + Redis + nginx + docker-compose.

## Mappák
- `backend/` — Express API + WebSocket match loop stubbok (auth/user/lobby/shop modulok), game tick demó.
- `frontend/` — Vue 3 + Vite + Pinia + Tailwind + Pixi canvas. Home/Lobby/Game/Profile nézetek, alap store-ok.
- `infra/` — docker-compose + nginx reverse proxy config.

## Futatás lokálisan
```bash
cd backend && npm install && npm run dev
# külön shell
cd frontend && npm install && npm run dev
```
Frontend dev szerver proxyn át hívja a `:4000` API-t és WebSocketet.

Dev-ben az auth ki van kapcsolva (`DEV_SKIP_AUTH=true`), a lobby `/quick-play` azonnal indít egy AI elleni meccset.

## Docker
```bash
cd infra
docker compose up --build
```
- Frontend: http://localhost:5173 (nginx-en keresztül 80-as porton is elérhető)
- API + WS: http://localhost:4000

## Környezeti változók
- Lásd `backend/.env.example`
- Alap JWT secret/DB URL/Redis URL dev értékekkel.
- Frontendnél a `VITE_API_BASE` és `VITE_WS_URL` állítható (`frontend/.env.example`).

## Következő lépések
- Valódi adatbázis/Redis réteg bekötése (auth, progression).
- Game-server rendszerek implementálása (movement/combat/capture/spawn/AI).
- Pixi render rész kiterjesztése: unit/effekt rétegek, interakciók.
- Auth flow a frontendben (login/register), matchmaking token kezelés.
