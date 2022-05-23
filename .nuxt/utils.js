import Vue from 'vue'
import { isSamePath as _isSamePath, joinURL, normalizeURL, withQuery, withoutTrailingSlash } from 'ufo'

// window.{{globals.loadedCallback}} hook
// Useful for jsdom testing or plugins (https://github.com/tmpvar/jsdom#dealing-with-asynchronous-script-loading)
if (process.client) {
  window.onNuxtReadyCbs = []
  window.onNuxtReady = (cb) => {
    window.onNuxtReadyCbs.push(cb)
  }
}

export function createGetCounter (counterObject, defaultKey = '') {
  return function getCounter (id = defaultKey) {
    if (counterObject[id] === undefined) {
      counterObject[id] = 0
    }
    return counterObject[id]++
  }
}

export function empty () {}

export function globalHandleError (error) {
  if (Vue.config.errorHandler) {
    Vue.config.errorHandler(error)
  }
}

export function interopDefault (promise) {
  return promise.then(m => m.default || m)
}

export function hasFetch(vm) {
  return vm.$options && typeof vm.$options.fetch === 'function' && !vm.$options.fetch.length
}
export function purifyData(data) {
  if (process.env.NODE_ENV === 'production') {
    return data
  }

  return Object.entries(data).filter(
    ([key, value]) => {
      const valid = !(value instanceof Function) && !(value instanceof Promise)
      if (!valid) {
        console.warn(`${key} is not able to be stringified. This will break in a production environment.`)
      }
      return valid
    }
    ).reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {})
}
export function getChildrenComponentInstancesUsingFetch(vm, instances = []) {
  const children = vm.$children || []
  for (const child of children) {
    if (child.$fetch) {
      instances.push(child)
      continue; // Don't get the children since it will reload the template
    }
    if (child.$children) {
      getChildrenComponentInstancesUsingFetch(child, instances)
    }
  }
  return instances
}

export function applyAsyncData (Component, asyncData) {
  if (
    // For SSR, we once all this function without second param to just apply asyncData
    // Prevent doing this for each SSR request
    !asyncData && Component.options.__hasNuxtData
  ) {
    return
  }

  const ComponentData = Component.options._originDataFn || Component.options.data || function () { return {} }
  Component.options._originDataFn = ComponentData

  Component.options.data = function () {
    const data = ComponentData.call(this, this)
    if (this.$ssrContext) {
      asyncData = this.$ssrContext.asyncData[Component.cid]
    }
    return { ...data, ...asyncData }
  }

  Component.options.__hasNuxtData = true

  if (Component._Ctor && Component._Ctor.options) {
    Component._Ctor.options.data = Component.options.data
  }
}

export function sanitizeComponent (Component) {
  // If Component already sanitized
  if (Component.options && Component._Ctor === Component) {
    return Component
  }
  if (!Component.options) {
    Component = Vue.extend(Component) // fix issue #6
    Component._Ctor = Component
  } else {
    Component._Ctor = Component
    Component.extendOptions = Component.options
  }
  // If no component name defined, set file path as name, (also fixes #5703)
  if (!Component.options.name && Component.options.__file) {
    Component.options.name = Component.options.__file
  }
  return Component
}

export function getMatchedComponents (route, matches = false, prop = 'components') {
  return Array.prototype.concat.apply([], route.matched.map((m, index) => {
    return Object.keys(m[prop]).map((key) => {
      matches && matches.push(index)
      return m[prop][key]
    })
  }))
}

export function getMatchedComponentsInstances (route, matches = false) {
  return getMatchedComponents(route, matches, 'instances')
}

export function flatMapComponents (route, fn) {
  return Array.prototype.concat.apply([], route.matched.map((m, index) => {
    return Object.keys(m.components).reduce((promises, key) => {
      if (m.components[key]) {
        promises.push(fn(m.components[key], m.instances[key], m, key, index))
      } else {
        delete m.components[key]
      }
      return promises
    }, [])
  }))
}

export function resolveRouteComponents (route, fn) {
  return Promise.all(
    flatMapComponents(route, async (Component, instance, match, key) => {
      // If component is a function, resolve it
      if (typeof Component === 'function' && !Component.options) {
        try {
          Component = await Component()
        } catch (error) {
          // Handle webpack chunk loading errors
          // This may be due to a new deployment or a network problem
          if (
            error &&
            error.name === 'ChunkLoadError' &&
            typeof window !== 'undefined' &&
            window.sessionStorage
          ) {
            const timeNow = Date.now()
            const previousReloadTime = parseInt(window.sessionStorage.getItem('nuxt-reload'))

            // check for previous reload time not to reload infinitely
            if (!previousReloadTime || previousReloadTime + 60000 < timeNow) {
              window.sessionStorage.setItem('nuxt-reload', timeNow)
              window.location.reload(true /* skip cache */)
            }
          }

          throw error
        }
      }
      match.components[key] = Component = sanitizeComponent(Component)
      return typeof fn === 'function' ? fn(Component, instance, match, key) : Component
    })
  )
}

export async function getRouteData (route) {
  if (!route) {
    return
  }
  // Make sure the components are resolved (code-splitting)
  await resolveRouteComponents(route)
  // Send back a copy of route with meta based on Component definition
  return {
    ...route,
    meta: getMatchedComponents(route).map((Component, index) => {
      return { ...Component.options.meta, ...(route.matched[index] || {}).meta }
    })
  }
}

export async function setContext (app, context) {
  // If context not defined, create it
  if (!app.context) {
    app.context = {
      isStatic: process.static,
      isDev: true,
      isHMR: false,
      app,

      payload: context.payload,
      error: context.error,
      base: app.router.options.base,
      env: {"GOOGLE_OAUTH_API":"https://www.googleapis.com/oauth2/v3","GOOGLE_SHEET_API":"https://oauth2.googleapis.com/token","GOOGLE_API_KEY":"AIzaSyA6AtWIq-Zxtb1Fj3JA_ayvmzblPq8O6yA","GOOGLE_SHEET_ID":"1hwGZ_pygHH22JiihOUZXVvFegX0s8NHCei1PZPp9WYI","GOOGLE_APP_ID":"158606466769-dboggti0h34cj85tj8b7h32adirn9kob.apps.googleusercontent.com","REDIRECT_URL":"http://localhost:3000","PROJECT_SHEET_NAME":"project","REPORT_SHEET_NAME":"","SERVICE_ACCOUNT_PRIVATE_KEY":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDq5cM17JNslh4+\nsmWYtjJVKgp36gZZMpbS7M6GRA/I3ISkMeNRL8nGob38x9y2cm67+T0yx2Gsuhtq\n7wp9hqLxkioQvxXirocN3WMNiWfgvI7JT2ggsxc6eoO7gY4NMBczMakM4mHr1TML\nUHtN3Rx7QpdVoMx8Y3MIZgokce/9LtAvFF9K2pgF/SMq5dP57vYVupX2RxeWxuvg\n1DusS6m4kCx2SQfVUn93D8c0Up45xIALJ650T+21fLxSyU4CWTN4r00xyuonPsqd\nfboVfN4YPSq94czv38bCkEksN+Wsd4lXjs/9xKTNgcTb3c4qPupOS4wTEbB7Ixbs\nkhpFMByDAgMBAAECggEADiLVpKEgHiDKoStLQe11CfsFtkG3MBcDTJ5Dr4DZElVz\nBg6ah4BAvFtve47rkW9Bir5tGGk3T5XDoKPSFcvMco1BStC1GHc4WXVBSMdEIRo3\n3ZWRxqYAd9x3oQki61hBjSsn6UaWbgLel4e4Y+8yj5hqUxTiOXoiqha59YeF0c6p\n5EhFvC62v0BgwXJHLDii6XQu9NVSVQWXkg70mfjC5l2FhpQCM7wKbkvmsDBu+GG4\n4SW366KOQuJ41nCmTVa8nimdTEEjzvhVI3kkcBW06z4+uXbmuZ4NY2jfksAEKiND\nn5PatuP86bEeq6rQXK2KCpZ5ILLv7S271anLSZYJwQKBgQD4BtGFJdv1pWRHkG+u\nlrYkPCpRCvw7dOuhdiiVc+/x+OgjyWiFNRrSchVCX9A//Fgqockrp8kSbYg81SvZ\nzUlBmpvUOmLDS90DLHQ+0KFeSrtYo/Im8nIF2VwEx8bDSbllcJ0pJPFoM3LSXKD/\neh+zP19OTolWh9MAvnXSm1JYxQKBgQDycuVAq7dN3lEyuObJkwHVWVzVurj/z0wx\ng7Dt0bbLBLEg0JtlkDvy+BroyJ+AdXWZP+sp6nvULWy6G+VTGsWP7T/ntY+cuVxR\n1uztbb2TeS4XLtxsUT2GqGiFEN27bjQo6Q4QFKAZ9hjKM9jYlktvpoQlam9ixT/s\nawTZ4NKkpwKBgAL5gfXI2HR/wU4ia1R6tkCFADTsns3Pvyu2kRIJy+zpAU+8kKZY\nVrQDbkHXiFXcHuqT+iet4Xl5GtMv81CvZ5uD0S6gbKLO/B2XoOVH90d8Ofb8MGFL\nMxbi3nmoM7gP4EtZKGlf6g1H4K6pMb0ep9asgeYchwUkp+EwZ5VZC4nJAoGAK8hZ\n5BreaF58dVd0vfQhQaD4pdQpcnDCBrMMcXYMt47qWc2yMl4gpVjuqxkHzM/pY7pq\nQlCI+iEV4GoHOMG96abjgnmELL5AkLrqYFoQASDCFQeuYJUvMjEZZuZL1HwrSTQF\nCRxgaS/K/EDuqPZDOy9r78HPyZtrVstgvePexkMCgYAIgUSJmpD1+3TYjXffTRWa\n0XTY7eQjARBk+tVL6Uh3OEcdnkBu6rhP+eyJ05iVSu4pE7juyUVwN+gStMq6w3gI\nOZ04pc/bvQsTgoXB0kjPUrOGINRsUSYRSkFGna07nKF9EiBHtJj9nUr6mCGI8S/K\ntebWzTk7woJEXwMZarDnYg==\n-----END PRIVATE KEY-----\n","SERVICE_ACCOUNT":"spreadsheet@opportune-lore-350007.iam.gserviceaccount.com"}
    }
    // Only set once

    if (context.req) {
      app.context.req = context.req
    }
    if (context.res) {
      app.context.res = context.res
    }

    if (context.ssrContext) {
      app.context.ssrContext = context.ssrContext
    }
    app.context.redirect = (status, path, query) => {
      if (!status) {
        return
      }
      app.context._redirected = true
      // if only 1 or 2 arguments: redirect('/') or redirect('/', { foo: 'bar' })
      let pathType = typeof path
      if (typeof status !== 'number' && (pathType === 'undefined' || pathType === 'object')) {
        query = path || {}
        path = status
        pathType = typeof path
        status = 302
      }
      if (pathType === 'object') {
        path = app.router.resolve(path).route.fullPath
      }
      // "/absolute/route", "./relative/route" or "../relative/route"
      if (/(^[.]{1,2}\/)|(^\/(?!\/))/.test(path)) {
        app.context.next({
          path,
          query,
          status
        })
      } else {
        path = withQuery(path, query)
        if (process.server) {
          app.context.next({
            path,
            status
          })
        }
        if (process.client) {
          // https://developer.mozilla.org/en-US/docs/Web/API/Location/replace
          window.location.replace(path)

          // Throw a redirect error
          throw new Error('ERR_REDIRECT')
        }
      }
    }
    if (process.server) {
      app.context.beforeNuxtRender = fn => context.beforeRenderFns.push(fn)
    }
    if (process.client) {
      app.context.nuxtState = window.__NUXT__
    }
  }

  // Dynamic keys
  const [currentRouteData, fromRouteData] = await Promise.all([
    getRouteData(context.route),
    getRouteData(context.from)
  ])

  if (context.route) {
    app.context.route = currentRouteData
  }

  if (context.from) {
    app.context.from = fromRouteData
  }

  app.context.next = context.next
  app.context._redirected = false
  app.context._errored = false
  app.context.isHMR = Boolean(context.isHMR)
  app.context.params = app.context.route.params || {}
  app.context.query = app.context.route.query || {}
}

export function middlewareSeries (promises, appContext) {
  if (!promises.length || appContext._redirected || appContext._errored) {
    return Promise.resolve()
  }
  return promisify(promises[0], appContext)
    .then(() => {
      return middlewareSeries(promises.slice(1), appContext)
    })
}

export function promisify (fn, context) {
  let promise
  if (fn.length === 2) {
      console.warn('Callback-based asyncData, fetch or middleware calls are deprecated. ' +
        'Please switch to promises or async/await syntax')

    // fn(context, callback)
    promise = new Promise((resolve) => {
      fn(context, function (err, data) {
        if (err) {
          context.error(err)
        }
        data = data || {}
        resolve(data)
      })
    })
  } else {
    promise = fn(context)
  }

  if (promise && promise instanceof Promise && typeof promise.then === 'function') {
    return promise
  }
  return Promise.resolve(promise)
}

// Imported from vue-router
export function getLocation (base, mode) {
  if (mode === 'hash') {
    return window.location.hash.replace(/^#\//, '')
  }

  base = decodeURI(base).slice(0, -1) // consideration is base is normalized with trailing slash
  let path = decodeURI(window.location.pathname)

  if (base && path.startsWith(base)) {
    path = path.slice(base.length)
  }

  const fullPath = (path || '/') + window.location.search + window.location.hash

  return normalizeURL(fullPath)
}

// Imported from path-to-regexp

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
export function compile (str, options) {
  return tokensToFunction(parse(str, options), options)
}

export function getQueryDiff (toQuery, fromQuery) {
  const diff = {}
  const queries = { ...toQuery, ...fromQuery }
  for (const k in queries) {
    if (String(toQuery[k]) !== String(fromQuery[k])) {
      diff[k] = true
    }
  }
  return diff
}

export function normalizeError (err) {
  let message
  if (!(err.message || typeof err === 'string')) {
    try {
      message = JSON.stringify(err, null, 2)
    } catch (e) {
      message = `[${err.constructor.name}]`
    }
  } else {
    message = err.message || err
  }
  return {
    ...err,
    message,
    statusCode: (err.statusCode || err.status || (err.response && err.response.status) || 500)
  }
}

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
const PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  const tokens = []
  let key = 0
  let index = 0
  let path = ''
  const defaultDelimiter = (options && options.delimiter) || '/'
  let res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    const m = res[0]
    const escaped = res[1]
    const offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    const next = str[index]
    const prefix = res[2]
    const name = res[3]
    const capture = res[4]
    const group = res[5]
    const modifier = res[6]
    const asterisk = res[7]

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    const partial = prefix != null && next != null && next !== prefix
    const repeat = modifier === '+' || modifier === '*'
    const optional = modifier === '?' || modifier === '*'
    const delimiter = res[2] || defaultDelimiter
    const pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter,
      optional,
      repeat,
      partial,
      asterisk: Boolean(asterisk),
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str, slashAllowed) {
  const re = slashAllowed ? /[?#]/g : /[/?#]/g
  return encodeURI(str).replace(re, (c) => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURIComponentPretty(str, true)
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$/()])/g, '\\$1')
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens, options) {
  // Compile all the tokens into regexps.
  const matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options))
    }
  }

  return function (obj, opts) {
    let path = ''
    const data = obj || {}
    const options = opts || {}
    const encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      const value = data[token.name || 'pathMatch']
      let segment

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (Array.isArray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (let j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options && options.sensitive ? '' : 'i'
}

export function addLifecycleHook(vm, hook, fn) {
  if (!vm.$options[hook]) {
    vm.$options[hook] = []
  }
  if (!vm.$options[hook].includes(fn)) {
    vm.$options[hook].push(fn)
  }
}

export const urlJoin = joinURL

export const stripTrailingSlash = withoutTrailingSlash

export const isSamePath = _isSamePath

export function setScrollRestoration (newVal) {
  try {
    window.history.scrollRestoration = newVal;
  } catch(e) {}
}
