# simcolog

A simple logger for Javascript runtimes and the browser.

## Installation

### npm

```sh
npx jsr add @mapokapo/simcolog
```

### Deno

```sh
deno add @mapokapo/simcolog
```

### Bun

```sh
bunx jsr add @mapokapo/simcolog
```

## Usage

```ts
import { defaultLogger } from "@mapokapo/simcolog";
// or in Deno
import { defaultLogger } from "jsr:@mapokapo/simcolog@^0.1.13";

const logEverything = true;

const myLogger = defaultLogger.modify({
  level: logEverything ? "trace" : "info",
});

myLogger.info("Hello info!"); // [TIMETAMP] [info] Hello info!
myLogger.trace("Hello trace!"); // [TIMETAMP] [trace] Hello trace!

let messageHistory: string[] = [];

const newLogger = myLogger.modify({
  includeTimestamp: false,
  level: "info",
  logCallback: message => messageHistory.push(message),
});

newLogger.info("Hello info!"); // [info] Hello info!
newLogger.warn("Hello warn!"); // [warn] Hello warn!
newLogger.trace("Hello trace!"); // nothing gets printed

newLogger.info(`Message history: ${messageHistory.join(", ")}`); // [info] Hello info!, [warn] Hello warn!
```
