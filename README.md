# simcolog

A simple console logger for Javascript runtimes and the browser.

## Installation

### NPM

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
import { defaultLogger } from "jsr:@mapokapo/simcolog@^0.1.9";

const logEverything = true;

const myLogger = defaultLogger.modify({
  level: logEverything ? "trace" : "info",
});

myLogger.info("Hello info!"); // [TIMETAMP] [info] Hello info!
myLogger.trace("Hello trace!"); // [TIMETAMP] [trace] Hello trace!

const newLogger = myLogger.modify({
  includeTimestamp: false,
  level: "info",
});

newLogger.info("Hello info!"); // [info] Hello info!
newLogger.trace("Hello trace!"); // nothing gets printed
```
