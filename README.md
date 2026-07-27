![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/customerio-provider

[![npm version](https://img.shields.io/npm/v/@seneca/customerio-provider.svg)](https://npmjs.com/package/@seneca/customerio-provider)
[![build](https://github.com/senecajs/seneca-customerio-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-customerio-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-customerio-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-customerio-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-customerio-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-customerio-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-customerio-provider/maintainability)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

Provides access to the Customerio API using the Seneca *provider*
convention. Customerio API entities are represented as Seneca entities so
that they can be accessed using the Seneca entity API and messages.
See [seneca-entity](senecajs/seneca-entity) and the [Seneca Data
Entities
Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

NOTE: underlying third party SDK needs to be replaced as out of date and has a security issue.

## Install

```sh
$ npm install @seneca/customerio-provider @seneca/env
```



<!--START:options-->

## Quick Example

```js

// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
Seneca()
  // Get API keys using the seneca-env plugin
  .use('env', {
    var: {
      $CUSTOMERIO_APIKEY: String,
      $CUSTOMERIO_USERTOKEN: String,
    }
  })
  .use('provider', {
    provider: {
      customerio: {
        keys: {
          apikey: { value: '$CUSTOMERIO_APIKEY' },
          usertoken: { value: '$CUSTOMERIO_USERTOKEN' },
        }
      }
    }
  })
  .use('customerio-provider')

let board = await seneca.entity('provider/customerio/board')
  .load$('<customerio-board-id>')

Console.log('BOARD', board)

board.desc = 'New description'
board = await board.save$()

Console.log('UPDATED BOARD', board)

```

## More Examples

See [test/](test/) for more usage examples.

## Motivation

A [Seneca.js](http://senecajs.org) plugin.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-customerio-provider/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

### Options

* `debug` : boolean <i><small>false</small></i>


Set plugin options when loading with:
```js


seneca.use('CustomerioProvider', { name: value, ... })


```


<small>Note: <code>foo.bar</code> in the list above means 
<code>{ foo: { bar: ... } }</code></small> 



<!--END:options-->

<!--START:action-list-->

### Action Patterns

* [role:entity,base:customerio,cmd:load,name:repo,zone:provider](#-roleentitybasecustomeriocmdloadnamerepozoneprovider-)
* [role:entity,base:customerio,cmd:save,name:repo,zone:provider](#-roleentitybasecustomeriocmdsavenamerepozoneprovider-)
* [sys:provider,get:info,provider:customerio](#-sysprovidergetinfoprovidercustomerio-)


<!--END:action-list-->

<!--START:action-desc-->

### Action Descriptions

### &laquo; `role:entity,base:customerio,cmd:load,name:repo,zone:provider` &raquo;

Load Customerio repository data into an entity.



----------
### &laquo; `role:entity,base:customerio,cmd:save,name:repo,zone:provider` &raquo;

Update Customerio repository data from an entity.



----------
### &laquo; `sys:provider,get:info,provider:customerio` &raquo;

Get information about the provider.



----------


<!--END:action-desc-->

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Part of the [Senecajs org](https://github.com/senecajs/).
