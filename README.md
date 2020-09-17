# m-ld.io Web Base
Base library for m-ld.io web projects.

Template project setup is in the `template` folder.

The `build` package contains the build-time dev dependencies and utilities.

The `runtime` package contains the runtime dependencies and utilities.

## Vercel
*For website delivery and serverless lambdas.*

The team account is https://vercel.com/m-ld.

Setup:
1. Install the [vercel CLI](https://vercel.com/download).
1. Root `vercel.json` has build and lambda environment configuration for CD builds.
1. For local development:
   - root file `.env.build` has build configuration.
     Note the empty `NPM_TOKEN` in the template file causes npm to use your local environment's npm token.
   - root file `.env` has lambda configuration.
1. For lambdas, create a source folder `api` per [Vercel convention](https://vercel.com/docs/serverless-functions/introduction),
   and use the runtime package exports to create path functions.

## Eleventy
*For static site generation.*

Setup:
1. Root `.eleventy.js` exports the Eleventy configuration function.

## Modernizr
*For browser feature detection.*

Setup:
1. `src/modernizr-custom.js` contains a downloaded custom Modernizr script.
   Note that this location is included by the default Eleventy configuration.

## Bulma
*For a CSS framework.*

See `template/src/main.scss`.

## Fontawesome
*For icons.*

See `template/src/main.scss`.

## Logz
*For remote logging.*

Setup:
1. Ensure that `LOGZ_KEY` is available in `.env` and `vercel.json` (`env` key).
1. Use `loglevel` for runtime logging.
1. Import from `@m-ld/io-web-runtime/dist/client`.
1. Call `configureLogging` before using log methods.
1. Call `setLogToken` when the session token is renewed.

## Google reCAPTCHA
*For bot detection.*

Setup:
1. Import from `@m-ld/io-web-runtime/dist/client`.
1. `await Grecaptcha.ready` before making any requests to a reCAPTCHA-authorised lambda.
1. Call `await Grecaptcha.execute('<action>')` to get a token.

## Browserify
*For script packaging.*

Setup:
1. `@m-ld/io-web-build` has the function `renderTs` which can be used in a `11ty.js` template
   to compile and package a root TypeScript file.

## TypeScript
*For scripts and serverless lambdas.*

See `template/tsconfig.template.json` (named to avoid IDE misunderstandings).
