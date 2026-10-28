# SKY CLASH

Original full-3D browser jet combat over **Port Meridian**. Three.js client, shared quaternion physics, authoritative Node.js WebSocket server. Falcon interceptor and Wraith delta stealth; no helicopters or borrowed game assets.

## Run

Node.js 22+:

```sh
npm ci
npm test
npm run build
npm start
```

Open `http://localhost:3000` in separate browsers/devices. Launch online with the same room code, maximum 10 players. Leaving room blank creates a code; share the HUD code. The server serves both the production client and WebSocket endpoint on the same port. `/health` reports process health.

`npm run dev` runs the Vite client. For development, run `npm start` separately and configure `VITE_SERVER_URL=ws://localhost:3000` before starting Vite. A separately hosted static client needs `VITE_SERVER_URL=wss://YOUR-SERVER` at build time. Online play reports an unconfigured server honestly; practice is separate and bots are explicitly labeled.

## Controls

Mouse: pitch/yaw. A/D: continuous roll. Q/E: rudder. W/S: throttle. Shift: boost. Left mouse: machine guns. Right mouse: hold lock, release missile after completed lock. Space: flares. Tab: scoreboard. Escape: hangar. Touch devices have a captured joystick, roll buttons, throttle slider and independent weapon/boost/flare controls. Landscape is recommended; no desktop launch gate.

## Architecture

- `shared/flight.js`: dependency-free deterministic fixed-step quaternion flight and swept building collisions.
- `shared/world.js`: shared collider geometry and safe spawns; original 550m landmark skyline.
- `shared/combat.js`: server-owned gun heat, hits, missile acquisition/ammo, flares and building obstruction.
- `server/index.js`: 30Hz authority, 15Hz snapshots, five-minute rooms, room cap 10, input clamping, 2KB messages, 45 messages/sec per socket, handshake deadline, heartbeat and backpressure.
- `client/main.js`: prediction with sequence acknowledgement/replay and interpolated remote state, explicit practice simulation, bounded VFX, quality controls and dynamic pixel ratio.
- `client/city.js`, `jets.js`, `effects.js`, `ui.js`: procedural original 3D art and responsive instruments.

## Deploy on Render

`render.yaml` defines one **free** Node service in Singapore, serving frontend + WebSocket. Free services sleep when inactive and are **not always-on**. No paid plan is authorized or required by this source. Select the public repository in Render and use the Blueprint, or create a Node web service with build `npm ci && npm test && npm run build` and start `npm start`. Main-branch deploys follow passing GitHub checks. `Dockerfile` is an alternative reproducible build. GitHub Actions runs physics, combat, 10-client integration tests and the production build.

## Verified / remaining

14 automated tests pass, including full quaternion loop/roll, collision tunneling/lethal hits/scrapes, deterministic replay, gun obstruction, lock/release ammo, 10 independent real WebSocket connections sharing snapshots, room capacity, forged-position rejection and message flood disconnect.

Cloud QA browser currently disables WebGL; 3D rendering, chase-camera feel, desktop/mobile frame-rate and real-device touch are **not visually verified**. Three.js jet/effects construction was smoke-tested. This is a playable initial implementation requiring real GPU playtesting and weapon/flight balancing, not a claim of production readiness. Reconnect rejoins the room with a new player identity; rooms and scores are memory-only and reset on server restart. No account persistence, matchmaking, spectator mode or anti-cheat beyond authority/protocol validation.
