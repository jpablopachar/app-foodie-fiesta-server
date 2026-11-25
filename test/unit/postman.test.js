import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const collection = JSON.parse(
  readFileSync(
    new URL('../../Foodie-Fiesta.postman_collection.json', import.meta.url),
    'utf8'
  )
)
const requests = collection.item.flatMap((folder) => folder.item)

function sandbox(path, { body, status = 200, variables = {}, header } = {}) {
  const values = new Map(Object.entries(variables))
  const failures = []
  const pm = {
    request: {
      url: { getPath: () => path },
      headers: {
        get: () => header,
        upsert: vi.fn(),
      },
    },
    collectionVariables: {
      get: (key) => values.get(key),
      set: (key, value) => values.set(key, value),
      unset: (key) => values.delete(key),
    },
    execution: { skipRequest: vi.fn() },
    response: {
      to: { have: { status: (code) => expect(status).toBe(code) } },
      json: () => {
        if (body instanceof Error) throw body
        return body
      },
    },
    expect,
    test: (_name, callback) => {
      try {
        callback()
      } catch (error) {
        failures.push(error)
      }
    },
  }
  const console = { error: vi.fn() }
  const run = (listen) => {
    const script = collection.event.find((event) => event.listen === listen)
    runInNewContext(script.script.exec.join('\n'), { pm, console })
  }
  return { pm, values, failures, console, run }
}

describe('autenticación compartida de Postman', () => {
  it.each([
    ['/api/user/register', 'userToken', 'adminToken'],
    ['/api/user/login', 'userToken', 'adminToken'],
    ['/api/user/admin', 'adminToken', 'userToken'],
  ])('guarda el JWT de %s sin alterar el otro rol', (path, key, otherKey) => {
    const context = sandbox(path, {
      variables: { [key]: 'old-token', [otherKey]: 'other-token' },
      body: { success: true, token: 'header.payload.signature' },
    })

    context.run('prerequest')
    expect(context.values.has(key)).toBe(false)
    context.run('test')
    expect(context.failures).toEqual([])
    expect(context.values.get(key)).toBe('header.payload.signature')
    expect(context.values.get(otherKey)).toBe('other-token')
  })

  it.each([
    { body: { success: false, token: 'header.payload.signature' } },
    { body: { success: true } },
    { body: { success: true, token: 'not-a-jwt' } },
    { body: new SyntaxError('Respuesta no JSON') },
    { status: 401, body: { success: true, token: 'header.payload.signature' } },
  ])('rechaza respuestas de autenticación inválidas: %j', (response) => {
    const context = sandbox('/api/user/login', {
      ...response,
      variables: { userToken: 'old-token' },
    })

    context.run('test')
    expect(context.values.has('userToken')).toBe(false)
    expect(context.failures).toHaveLength(1)
  })

  it.each(
    requests.filter((item) =>
      item.request.header?.some((header) => header.key === 'token')
    )
  )('reutiliza el token del rol correcto en $name', ({ request }) => {
    const header = request.header.find((entry) => entry.key === 'token').value
    const key = header.slice(2, -2)
    const context = sandbox(request.url.replace('{{baseUrl}}', ''), {
      header,
      variables: { userToken: 'user-jwt', adminToken: 'admin-jwt' },
    })

    context.run('prerequest')
    expect(context.pm.request.headers.upsert).toHaveBeenCalledWith({
      key: 'token',
      value: key === 'userToken' ? 'user-jwt' : 'admin-jwt',
    })
    expect(context.pm.execution.skipRequest).not.toHaveBeenCalled()
  })

  it.each([
    ['userToken', undefined],
    ['adminToken', ''],
    ['userToken', '   '],
  ])('bloquea peticiones sin %s utilizable', (key, token) => {
    const context = sandbox('/api/cart/get', {
      header: '{{' + key + '}}',
      variables: { [key]: token },
    })

    expect(() => context.run('prerequest')).toThrow('Falta ' + key)
    expect(context.pm.execution.skipRequest).toHaveBeenCalledOnce()
    expect(context.console.error).toHaveBeenCalledOnce()
    expect(context.pm.request.headers.upsert).not.toHaveBeenCalled()
  })

  it('permite peticiones públicas sin tokens', () => {
    const context = sandbox('/api/product/list')

    context.run('prerequest')
    context.run('test')
    expect(context.failures).toEqual([])
    expect(context.pm.execution.skipRequest).not.toHaveBeenCalled()
    expect(context.pm.request.headers.upsert).not.toHaveBeenCalled()
  })
})
