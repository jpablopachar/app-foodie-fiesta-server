import swaggerJsdoc from 'swagger-jsdoc'

const response = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
}

const jsonBody = (schema) => ({
  required: true,
  content: { 'application/json': { schema } },
})

const operation = (summary, body, authenticated = false) => ({
  summary,
  ...(authenticated && { security: [{ tokenAuth: [] }] }),
  ...(body && { requestBody: jsonBody(body) }),
  responses: {
    '200': { description: 'Solicitud procesada', content: { 'application/json': { schema: response } } },
    ...(authenticated && { '401': { description: 'Token ausente, inválido o sin permisos' } }),
  },
})

const productId = { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' }

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Foodie Fiesta API',
      version: '1.0.0',
      description: 'API de usuarios, productos, carrito y órdenes.',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Servidor local' }],
    tags: [
      { name: 'Usuarios' },
      { name: 'Productos' },
      { name: 'Carrito' },
      { name: 'Órdenes' },
    ],
    components: {
      securitySchemes: {
        tokenAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'token',
          description: 'Token JWT devuelto por el inicio de sesión.',
        },
      },
      schemas: {
        Credentials: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 8 },
          },
        },
        RegisterUser: {
          allOf: [
            { $ref: '#/components/schemas/Credentials' },
            { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
          ],
        },
        Product: {
          type: 'object',
          properties: {
            _id: productId,
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            image: { type: 'string', format: 'uri' },
            price: { type: 'object', additionalProperties: { type: 'number' }, example: { small: 10, large: 20 } },
            sizes: { type: 'array', items: { type: 'string' } },
            popular: { type: 'boolean' },
            date: { type: 'number' },
          },
        },
        OrderItem: {
          type: 'object',
          required: ['name', 'price', 'size', 'quantity'],
          properties: {
            name: { type: 'string' },
            price: { type: 'object', additionalProperties: { type: 'number' } },
            size: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 },
          },
        },
        Address: {
          type: 'object',
          description: 'Datos de entrega definidos por el cliente.',
          additionalProperties: true,
          example: { firstName: 'Ana', lastName: 'Pérez', street: 'Calle 1', city: 'Quito', phone: '0990000000' },
        },
        PlaceOrder: {
          type: 'object',
          required: ['items', 'amount', 'address'],
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            amount: { type: 'number' },
            address: { $ref: '#/components/schemas/Address' },
          },
        },
        ApiResult: response,
      },
    },
    paths: {
      '/api/user/register': { post: { tags: ['Usuarios'], ...operation('Registra un usuario', { $ref: '#/components/schemas/RegisterUser' }) } },
      '/api/user/login': { post: { tags: ['Usuarios'], ...operation('Inicia sesión como usuario', { $ref: '#/components/schemas/Credentials' }) } },
      '/api/user/admin': { post: { tags: ['Usuarios'], ...operation('Inicia sesión como administrador', { $ref: '#/components/schemas/Credentials' }) } },
      '/api/product/add': {
        post: {
          tags: ['Productos'], summary: 'Crea un producto y carga una imagen opcional', security: [{ tokenAuth: [] }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['name', 'description', 'category', 'prices'], properties: { name: { type: 'string' }, description: { type: 'string' }, category: { type: 'string' }, prices: { type: 'string', description: 'JSON serializado: [{"size":"small","price":10}]' }, popular: { type: 'boolean' }, image: { type: 'string', format: 'binary' } } } } } },
          responses: { '200': { description: 'Producto creado' }, '401': { description: 'No autorizado' } },
        },
      },
      '/api/product/remove': { post: { tags: ['Productos'], ...operation('Elimina un producto', { type: 'object', required: ['id'], properties: { id: productId } }, true) } },
      '/api/product/single': { post: { tags: ['Productos'], ...operation('Obtiene un producto por ID', { type: 'object', required: ['productId'], properties: { productId } }) } },
      '/api/product/list': { get: { tags: ['Productos'], ...operation('Lista los productos') } },
      '/api/cart/add': { post: { tags: ['Carrito'], ...operation('Agrega una unidad de producto al carrito', { type: 'object', required: ['itemId', 'size'], properties: { itemId: productId, size: { type: 'string' } } }, true) } },
      '/api/cart/update': { post: { tags: ['Carrito'], ...operation('Establece la cantidad de un producto en el carrito', { type: 'object', required: ['itemId', 'size', 'quantity'], properties: { itemId: productId, size: { type: 'string' }, quantity: { type: 'integer', minimum: 0 } } }, true) } },
      '/api/cart/get': { post: { tags: ['Carrito'], ...operation('Obtiene el carrito del usuario', undefined, true) } },
      '/api/order/place': { post: { tags: ['Órdenes'], ...operation('Crea una orden con pago contra entrega', { $ref: '#/components/schemas/PlaceOrder' }, true) } },
      '/api/order/stripe': { post: { tags: ['Órdenes'], ...operation('Crea una orden e inicia el pago con Stripe', { $ref: '#/components/schemas/PlaceOrder' }, true) } },
      '/api/order/verifyStripe': { post: { tags: ['Órdenes'], ...operation('Confirma o cancela una orden tras el pago', { type: 'object', required: ['orderId', 'success'], properties: { orderId: productId, success: { type: 'string', enum: ['true', 'false'] } } }, true) } },
      '/api/order/userOrders': { post: { tags: ['Órdenes'], ...operation('Lista las órdenes del usuario autenticado', undefined, true) } },
      '/api/order/list': { post: { tags: ['Órdenes'], ...operation('Lista todas las órdenes (administrador)', undefined, true) } },
      '/api/order/status': { post: { tags: ['Órdenes'], ...operation('Actualiza el estado de una orden (administrador)', { type: 'object', required: ['orderId', 'status'], properties: { orderId: productId, status: { type: 'string' } } }, true) } },
    },
  },
  apis: [],
})
