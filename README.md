<p align="center">
<img width="300px" src="https://content.tylerburke.dev/images/bigsby-logo-light.svg" />
</p>

<a href="https://www.npmjs.com/package/bigsby"><img src="https://img.shields.io/npm/v/bigsby.svg"></a>
<a href="https://bundlephobia.com/result?p=bigsby"><img src="https://img.shields.io/bundlephobia/minzip/bigsby.svg"/></a>
<img src="https://img.shields.io/badge/license-MIT-blue.svg">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"/>

Bigsby is the newest NodeJS Lambda library on the block. Written in Typescript,
heavily leveraging decorators and classes, it might not be everyone's cup of 🫖, but its purpose is to
🧙‍🪄 away the heavy lifting and let you focus on the important stuff.

## Show me some code

```typescript
const bigsby = new Bigsby();

@Api()
class ArnyQuotesHandler implements ApiHandler {
  @Autowire(ArnyService)
  private service!: ArnyService;

  @ReqSchema(requestSchema)
  @ResSchema(200, responseSchema)
  public async invoke(@Body() request: GetQuoteRequest): Promise<string> {
    return this.service.getQuote(request.movie);
  }
}

const handler = bigsby.createApiHandler(ArnyQuotesHandler);
```

## Features

### 💉 [Injection](https://burketyler.github.io/bigsby/docs/usage/dependency-injection)

Bigsby uses [ts-injection](https://burketyler.github.io/ts-injection/) under the hood to provide an
easy to use, intuitive and clean dependency injection interface.

### 🔎 [Parsing](https://burketyler.github.io/bigsby/docs/usage/event-parsing)

Use a comprehensive set of decorators to map API Gateway events into the parameters your handler
needs, resulting in concise, clean and easy to read code.

### 👮 [Validation](https://burketyler.github.io/bigsby/docs/usage/validation)

Leveraging [Joi's](https://joi.dev/) powerful schema description language, Bigsby makes it easy
to define complex request and response schemas.

### 🔢 [Versioning](https://burketyler.github.io/bigsby/docs/usage/versioning)

Support for header or path based versioning is available out of the box with Bigsby.
You define the mapping, and we'll worry about getting the request to the right handler version.

### 🔐 [Authentication](https://burketyler.github.io/bigsby/docs/usage/authentication)

Register authentication methods to secure your APIs. Assign these methods at the global level,
to an individual handler, or even to a specific version of a handler.

### 🪝 [Lifecycle](https://burketyler.github.io/bigsby/docs/usage/lifecycle)

Tap into a diverse range of hooks exposed throughout Bigsby's request lifecycle. It's simple to
build highly customizable execution flows.

<a href="https://burketyler.github.io/bigsby/docs/setup"><p align="center" style="font-size: 25px">View full documentation</p></a>
