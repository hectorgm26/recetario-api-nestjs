# 🧑‍🍳 API de Gestión de Recetas (NestJS + Prisma + MySQL)

API REST completa desarrollada con NestJS 11 y Prisma ORM sobre MySQL.
Incluye: autenticación JWT, subida y gestión de imágenes (Multer), validación con DTOs (class-validator), envío de correos (Nodemailer / MailerModule), documentación con Swagger, y ejemplos explicados detalladamente para estudio.

---

## 📂 Contenido del README

1. [Resumen técnico rápido](#-resumen-técnico-rápido)
2. [Cómo ejecutar el proyecto (quick start)](#-cómo-ejecutar-el-proyecto-quick-start)
3. [Variables de entorno necesarias](#-variables-de-entorno-necesarias)
4. [Prisma schema (modelos y relaciones)](#-prisma-schema-modelos-y-relaciones)
5. [Explicación de main.ts](#-explicación-de-maints)
6. [Explicación de AppModule (app.module.ts)](#-explicación-de-appmodule-appmodulets)
7. [Controladores: explicación de cada ruta y parámetros](#-controladores--explicación-de-rutas-parámetros-y-pipes)
8. [Servicios: explicación de métodos y lógica interna](#-servicios--explicación-detallada-de-métodos-y-lógica)
9. [DTOs y validaciones](#-dtos-y-validaciones)
10. [Autenticación: JwtStrategy y JwtAuthGuard](#-autenticación--jwtstrategy-y-jwtauthguard)
11. [Buenas prácticas, notas y recomendaciones](#-notas-técnicas-esenciales-por-tus-comentarios-en-el-código)
12. [Licencia](#-licencia)

---

## ⚙️ Resumen técnico rápido

- **NestJS 11** como framework.
- **Prisma** como ORM (MySQL).
- **JWT** para autenticación (`@nestjs/jwt`, `passport-jwt`).
- **bcrypt** para hashing de contraseñas.
- **multer** para uploads (configuración con `diskStorage`).
- **@nestjs-modules/mailer + Nodemailer** para envíos (Mailtrap en desarrollo).
- **ServeStaticModule** para exponer archivos subidos en `/uploads`.
- **Swagger** para documentación (configuración en `main.ts`).
- **Validaciones** con DTOs y `ValidationPipe`.
- Uso de **slugify** para slugs amigables.
- **UUID** para token de verificación.

---

## ▶️ Cómo ejecutar el proyecto (quick start)

1. **Clona el repo y entra en la carpeta:**

```bash
git clone https://github.com/<tu-usuario>/<nombre-del-repo>.git
cd <nombre-del-repo>
```

2. **Instala dependencias:**

```bash
npm install
```

3. **Crea y configura el `.env`** (ver sección de variables de entorno abajo).

4. **Genera Prisma Client y aplica migraciones:**

```bash
npx prisma generate
npx prisma migrate dev
```

5. **Ejecuta en modo desarrollo:**

```bash
npm run start:dev
```

6. **Accede a:**
   - API principal: `http://localhost:3000/api/v1/...`
   - Swagger (documentación): `http://localhost:3000/documentacion`
   - Archivos subidos: `http://localhost:3000/uploads/...`

---

## 🧾 Variables de entorno necesarias

Ejemplo mínimo (ajusta valores reales):

```env
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

SMTP_SERVER=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password

CURSO_SERVER_JWT_SECRET=tu_jwt_secret
CURSO_BASE_URL_FRONTEND=http://localhost:4200
CURSO_TEST=valor_de_prueba
PORT=3000
```

**Por qué:** el proyecto utiliza `ConfigModule.forRoot()` para leer variables y configurar JWT, Mailer y Prisma.

---

## 📦 Prisma schema (modelos y relaciones)

Tu `schema.prisma` principal (simplificado a nombres y relaciones que usas):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model categoria {
  id      Int      @id @default(autoincrement())
  nombre  String
  slug    String   @unique
  receta  receta[]
}

model receta {
  id          Int      @id @default(autoincrement())
  nombre      String
  slug        String   @unique
  tiempo      String
  descripcion String   @db.LongText
  fecha       DateTime @default(now())
  foto        String
  categoria   categoria @relation(fields: [categoria_id], references: [id])
  categoria_id Int
  usuario     usuario  @relation(fields: [usuario_id], references: [id])
  usuario_id  Int @default(1)
}

model contacto {
  id      Int      @id @default(autoincrement())
  nombre  String
  correo  String
  telefono String
  mensaje String   @db.LongText
  fecha   DateTime @default(now())
}

model estado {
  id      Int     @id @default(autoincrement())
  nombre  String
  usuario usuario[]
}

model usuario {
  id       Int     @id @default(autoincrement())
  nombre   String
  correo   String  @unique
  password String
  token    String
  estado   estado  @relation(fields: [estado_id], references: [id])
  estado_id Int @default(2)
  receta   receta[]
}
```

### Puntos clave:

- `receta` contiene claves foráneas `categoria_id` y `usuario_id`.
- `usuario` tiene `estado_id` para manejar estados (activo/inactivo).
- `slug` unique en `categoria` y `receta` para URLs amigables.

---

## 🧩 Explicación de main.ts

Archivo (resumen):

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // configurar prefijo global para las rutas
  app.setGlobalPrefix('api/v1');

  // habilitar cors
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Recetas')
    .setDescription('API creada con NestJS y Prisma ORM para la gestion de recetas de cocina')
    .setVersion('1.0')
    .addTag('Recetas')
    // ...
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentacion', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### Explicación detallada

- **`NestFactory.create(AppModule)`**: crea la instancia del servidor Nest, cargando tu módulo raíz (`AppModule`) con sus importaciones, controllers y providers.

- **`app.setGlobalPrefix('api/v1')`**: pone un prefijo global a todas las rutas. **Razón:** versionado de la API y separación de rutas (ej. `localhost:3000/api/v1/recetas`). Mejora compatibilidad futura.

- **`app.enableCors()`**: habilita CORS (Cross-Origin Resource Sharing). **Razón:** cuando el frontend en distinto dominio/puerto (ej. `localhost:4200`) necesita consumir la API.

- **Swagger:**
  - `DocumentBuilder()` configura metadatos (título, descripción, versión y tags).
  - `SwaggerModule.createDocument(app, config)` genera la especificación OpenAPI.
  - `SwaggerModule.setup('documentacion', app, documentFactory)` expone la UI interactiva en `/documentacion`. En tus controladores y DTOs usas decoradores (`@ApiTags`, `@ApiProperty`) para que Swagger documente los modelos y rutas.

- **`await app.listen(...)`**: arranca el servidor.

---

## 🧩 Explicación de app.module.ts (AppModule)

Fragmento:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets/uploads'),
      serveRoot: '/uploads',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_SERVER,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
    }),
    JwtModule.register({
      secret: process.env.CURSO_SERVER_JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ /* ... */ ],
  providers: [ /* ... */ ],
})
export class AppModule {}
```

### Explicación por secciones:

1. **`ConfigModule.forRoot()`**: carga variables de entorno y permite acceder a ellas con `process.env`. Útil para no hardcodear secretos.

2. **`ServeStaticModule.forRoot(...)`**:
   - `rootPath: join(process.cwd(), 'assets/uploads')`: define la carpeta en disco desde donde se servirán archivos estáticos (tus imágenes subidas).
   - `serveRoot: '/uploads'`: la URL pública base. Ejemplo: `http://localhost:3000/uploads/1762737508175.jpg`.
   - **Razón:** evitar exponer disco raíz directamente y tener una ruta estable para servir imágenes.

3. **`MailerModule.forRoot({ transport: { ... } })`**: configura nodemailer (Mailtrap en dev). `mailService.sendMail()` en servicios usa esta configuración.

4. **`JwtModule.register({ secret, signOptions })`**: configura firma de tokens. **Razón:** centralizar secret y expiración para crear/verificar JWT en `UsuariosService` y `JwtStrategy`.

5. **`controllers` y `providers`**: se registran controladores y servicios. `JwtStrategy` es provider para que Passport pueda validar tokens.

---

## 🔎 Controladores — explicación de rutas, parámetros y pipes

A continuación explico cada controlador y cada método importante: qué hace, de dónde toma datos, qué validaciones aplica, y por qué.

**Nota:** cuando digo `@Body() dto` el dato viene del body JSON (o form-data si es upload); `@Param('id')` viene de la ruta; `@Query()` viene de querystring; `@Req()` trae el objeto Request de Express.

---

### 🗂️ CategoriasController

```typescript
@Controller('categorias')
@ApiTags('Categorias')
export class CategoriasController {
  constructor(private categoriaService: CategoriasService) {}

  @Get()
  index() { return this.categoriaService.getDatos(); }

  @Get(':id')
  show(@Param('id') id) { return this.categoriaService.getDato(parseInt(id)); }

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CategoriaDto) { return this.categoriaService.addDatos(dto); }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  update(@Body() dto: CategoriaDto, @Param('id') id) {
    return this.categoriaService.updateDatos(parseInt(id), dto);
  }

  @Delete(':id')
  destroy(@Param('id') id) { return this.categoriaService.deleteDato(parseInt(id)); }
}
```

#### Explicación

- **`@Controller('categorias')`**: base de ruta `/categorias` (realmente `api/v1/categorias` por el `setGlobalPrefix`).

- **`index()` — GET `/categorias`**:
  - Llama a `CategoriasService.getDatos()` para obtener todas las categorías ordenadas.

- **`show(id)` — GET `/categorias/:id`**:
  - Toma `id` como string desde la URL y lo convierte a número con `parseInt`. **Importante:** Prisma espera números para claves `Int`.
  - Lanza excepción si no existe (lanzada en el servicio).

- **`create(dto)` — POST `/categorias`**:
  - Usa `ValidationPipe` para validar DTO (`CategoriaDto`) antes de llegar al servicio.
  - `CategoriaDto` exige `nombre` no vacío.

- **`update(id, dto)` — PUT `/categorias/:id`**:
  - Valida DTO y llama a `updateDatos`.

- **`destroy(id)` — DELETE `/categorias/:id`**:
  - Llama al servicio que valida que no existan recetas asociadas antes de eliminar.

**Por qué se hace `parseInt(id)` en controladores:** Nest recibe parámetros de ruta como string; tus modelos usan `Int`. Hacer el parse en el controller evita fallos al usar Prisma con números.

---

### ✉️ ContactoController

```typescript
@Controller('contacto')
@ApiTags('Contacto')
export class ContactoController {
  constructor(private contactoService: ContactoService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() dto: ContactoDto) {
    return this.contactoService.addDatos(dto);
  }
}
```

#### Explicación

- **POST `/contacto`**: valida `ContactoDto` (nombre, correo - formato email, telefono, mensaje) y delega a `ContactoService.addDatos`.
- `ContactoService` guarda en DB y envía un correo de confirmación.

---

### 🧪 EjemploController

Controlador didáctico para mostrar pipes, headers y responses de ejemplo:

- `@Get()` agrega header personalizado `Cabecero_hector` y devuelve un objeto con estado y mensaje.
- `@Post()` usa DTO `EjemploDto` con validación y devuelve un objeto con los datos recibidos (simula creación).

**Utilidad:** sirve como referencia en tu repo para ver cómo usar `ValidationPipe`, `@Header`, y cómo documentar en Swagger.

---

### 🍳 RecetasController

Métodos principales (resumen):

```typescript
@Get() index(@Req() request: Request) { ... }           // lista formateada
@Get(':id') show(@Param('id') id, @Req() request) { ... } // detalle formateado
@UseGuards(JwtAuthGuard) @Post() create(@Body() dto, @UploadedFile(...) file) { ... } // crea con foto
@UseGuards(JwtAuthGuard) @Put(':id') update(...) { ... }  // actualiza
@UseGuards(JwtAuthGuard) @Delete(':id') destroy(...) { ... } // elimina
```

#### Explicaciones clave

1. **Formateo en controlador:** Para `index()` y `show()` tomas los objetos retornados por Prisma y los mapeas a un JSON más legible:
   - `fecha: dato.fecha.toLocaleDateString('es-CL')` — formatea fecha para frontend.
   - ``foto: `${request.protocol}://${request.get('Host')}/uploads/recetas/${dato.foto}` `` — construye URL absoluta para la imagen (útil en frontends).
   - Mapeas `categoria` y `usuario` para devolver solo campos relevantes (evitas enviar todo el objeto relacional).
   - **Por qué en controller y no en servicio:** el servicio se enfoca en datos (ORM), el controller en representación (presentación y request context).

2. **Subida de archivos (`@UseInterceptors(FileInterceptor(...))`)**:
   - `diskStorage` guarda la imagen en `./assets/uploads/recetas` con nombre basado en `Date.now()` + `extname`.
   - `@UploadedFile(new ParseFilePipe({...validators...}))`:
     - `FileTypeValidator` para controlar extensión / mimetype (png|jpeg|jpg).
     - `MaxFileSizeValidator` para limitar tamaño (5 MB).
   - **Importante:** Nest/Express sube el archivo siempre; por eso en el servicio en caso de errores se borra la foto con `fs.unlink`.

3. **Guard (`@UseGuards(JwtAuthGuard)`)**: protege rutas para que solo usuarios autenticados puedan crear/editar/eliminar recetas.

4. **Por qué `usuario_id` por defecto 1:** en el schema pusiste `usuario_id Int @default(1)` para evitar errores cuando aún no hay usuarios; en producción deberías asignar `usuario_id` desde el token del usuario autenticado.

---

### 🍳 RecetasHelperController

Rutas auxiliares:

- **POST `/recetas-helper/:id`** — actualizar foto (solo el archivo). Similar a create pero solo actualiza la foto para la receta indicada.
  - Valida existencia de receta en servicio y borra foto anterior con `fs.unlink`.

- **GET `/recetas-helper`** — `datos_home()`:
  - Devuelve últimos 3 registros (p. ej. para home).

- **GET `/recetas-helper/buscador`** — `buscador(@Query() query)`:
  - Recibe `categoria_id` y `search` en querystring.
  - Llama `RecetasService.getDatosBuscador(categoria_id, search)` que realiza `where` con `contains`.

**Por qué separar estas rutas:** son endpoints utilitarios (helpers) para el frontend —p. ej. buscador y secciones de home/panel— y mantienen organizado el API.

---

### 📤 UploadController

```typescript
@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({...}) }))
  create(@Body() dto: SampleDto, @UploadedFile(new ParseFilePipe({...})) file: Express.Multer.File) {
    return {
      estado: 'OK',
      archivoSubido: file.filename,
      // ...
    };
  }
}
```

#### Explicación

- Endpoint genérico para subir archivos (field = `file` en form-data).
- Devuelve información de la subida: `originalname`, `filename`, `mimetype`.
- Útil para pruebas o subidas fuera del contexto recetas.

---

### 👥 UsuariosController

```typescript
@Controller('usuarios')
@ApiTags('Usuarios')
export class UsuariosController {
  @Get('verificacion/:token') verificacion(@Param('token') token, @Res() response) {...}
  @Post('registro') registro(@Body() dto: RegistroDto, @Req() request) {...}
  @Post('login') login(@Body() dto: LoginDto) {...}
}
```

#### Explicación

1. **`registro(dto, request)`**:
   - `request` se usa para construir la URL de verificación (`request.protocol` + `request.get('host')`).
   - `UsuariosService.addDatos` crea usuario, genera token (UUIDv4), cifra password (bcrypt), envía mail con enlace de verificación.

2. **`verificacion(token)`**:
   - Llama al servicio para cambiar `estado_id` y limpiar `token`.
   - Redirige a `process.env.CURSO_BASE_URL_FRONTEND + 'login'`.

3. **`login(dto)`**:
   - Llama `UsuariosService.getLogin(correo, password)` que verifica email, estado, compara password con `bcrypt.compare`, y si coincide devuelve token JWT (con `jwtService.sign(payload)`).

---

## 🧠 Servicios — explicación detallada de métodos y lógica

A continuación los servicios con sus métodos, cómo funcionan internamente y por qué tomaste ciertas decisiones.

---

### 🧾 CategoriasService

```typescript
constructor() { this.prisma = new PrismaClient(); }

async getDatos() {
  return await this.prisma.categoria.findMany({ orderBy: [{ id: 'asc' }] });
}

async getDato(id) {
  const datos = await this.prisma.categoria.findFirst({ where: { id } });
  if (!datos) throw new HttpException(...);
  return datos;
}

async addDatos(dto) {
  const existe = await this.prisma.categoria.findFirst({ where: { nombre: dto.nombre }});
  if (existe) throw new HttpException(...);
  await this.prisma.categoria.create({ data: { nombre: dto.nombre, slug: slugify(dto.nombre.toLowerCase()) }});
  return { estado: 'OK', mensaje: 'Registro creado correctamente' };
}

async updateDatos(id, dto) { /* valida existencia, update con slugify */ }

async deleteDato(id) {
  // valida existencia
  // busca recetas asociadas: await this.prisma.receta.findMany({ where: { categoria_id: id }})
  // si no hay recetas: delete; si hay: lanza excepción (no se permite eliminar categoría con recetas)
}
```

#### Claves y razones

- `slugify(dto.nombre.toLowerCase())` crea slug amigable para URL.
- Comprobación de existencia antes de crear/editar evita duplicados.
- Revisión en `deleteDato` para evitar inconsistencias referenciales (no permites eliminar categoría con recetas asociadas).

---

### ✉️ ContactoService

```typescript
constructor(private mailService: MailerService) {
  this.prisma = new PrismaClient();
}

async addDatos(dto) {
  await this.prisma.contacto.create({ data: { nombre: dto.nombre, correo: dto.correo, telefono: dto.telefono, mensaje: dto.mensaje }});
  await this.mailService.sendMail({ from: ..., to: dto.correo, subject: 'Prueba', html: dto.mensaje });
  return { estado: 'OK', mensaje: 'Datos de contacto guardados correctamente' };
}
```

#### Claves

- Guarda contacto en DB (para registro/auditoría) y envía email con `mailService`.
- `MailerModule.forRoot` se configuró en `AppModule` con credenciales de `process.env`.

---

### 🧪 EjemploService

```typescript
getTexto(parametro: string) {
  return "El valor del parametro es: " + parametro + " | test env: " + process.env.CURSO_TEST;
}
```

#### Claves

- Servicio simple para demostrar acceso a variables de entorno y separación de responsabilidades entre controller y service.

---

### 🍳 RecetasService

Métodos clave:

1. **`getDatos()`**:
   - `prisma.receta.findMany({ orderBy: [{ id: 'asc' }], select: { ... } })`
   - `select` para limitar campos y relaciones (mejor rendimiento).

2. **`getDato(id)`**:
   - `findFirst` con `select` y lanzar excepción si no existe.

3. **`addDatos(dto, foto)`**:
   - Validar existencia de categoria con `categoria_id` (evitar crear receta sin categoría válida).
   - Validar duplicidad por nombre.
   - Si hay error antes de crear receta, borrar archivo subido con `fs.unlink` para evitar archivos huérfanos (**importante**).
   - `usuario_id` por defecto (si no está en dto) o parse int si viene.

4. **`updateDatos(id, dto)`**:
   - Validar categoria y existencia de receta; luego `update`.

5. **`delete(id)`**:
   - Validar existencia, borrar foto física (`fs.unlink`) y eliminar registro en DB.

6. **`updateDatosFoto(id, foto)`**:
   - Validar existencia; borrar foto anterior y actualizar campo `foto` en DB.

7. **`getDatosHome()`**:
   - `findMany` con `take: 3` para último 3 elementos (Home).

8. **`getDatosBuscador(categoria_id, search)`**:
   - Valida categoría existe; `where` con `nombre: { contains: search }`.

9. **`getDatosPanel(id)`**:
   - Listar recetas por `usuario_id`.

#### Razones y buenas prácticas aplicadas:

- Borrar archivos en errores evita acumular archivos en el servidor (mantenimiento).
- Validar FK existence evita crear registros huérfanos o inconsistentes.
- Select/Include: seleccionar solo campos necesarios mejora rendimiento.
- Slug único: slugify más unique evita colisiones de rutas.

---

### 👥 UsuariosService

Métodos:

1. **`addDatos(dto, request)`**
   - Comprueba si correo ya existe.
   - Genera token con `uuidv4()` para verificación.
   - Construye `url` de verificación con `request.protocol` + `request.get('host')` → `.../api/v1/usuarios/verificacion/{token}`.
     - **Por qué:** usar `request` permite crear link absoluto (independiente del entorno).
   - Hashea password: `await bcrypt.hash(dto.password, 10)`.
     - `10` es el salt rounds; buen balance entre seguridad y rendimiento.
   - Crea usuario con `token` y envía email con `mailService.sendMail`.
   - Devuelve `{ estado: 'OK', mensaje: 'Usuario registrado correctamente' }`.

2. **`updateDatosVerificacion(token, response)`**
   - Busca usuario con `token` y `estado_id: 2` (pendiente).
   - Si no existe lanza `NOT_FOUND`.
   - Si existe actualiza `token = ''` y `estado_id = 1` (activo).
   - `return response.redirect(process.env.CURSO_BASE_URL_FRONTEND + 'login')` — redirige al frontend para UX de verificación.

3. **`getLogin(correo, password)`**
   - Busca usuario con `correo` y `estado_id: 1` (activo).
   - Si no existe => error.
   - Compara `bcrypt.compare(password, datos.password)`.
   - Si coincide, crea `payload = { username: datos.correo, sub: datos.id }` y firma token con `this.jwtService.sign(payload)`.
   - Devuelve `{ id: datos.id, nombre: datos.nombre, token }`.

#### Razones:

- Separar registro y verificación para control de cuentas y evitar inicios hasta verificación.
- JWT contiene payload mínimo `sub` e `username`; la verificación se hace con `JwtStrategy`.
- **Seguridad:** nunca devolver password; devolver token y datos mínimos.

---

## 🔐 Autenticación — JwtStrategy y JwtAuthGuard

### JwtStrategy (resumen)

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.CURSO_SERVER_JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}
```

#### Explicación

- **`jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()`**: extrae el token del header `Authorization: Bearer <token>`.
- **`ignoreExpiration: false`**: valida expiración del token (no aceptes tokens expirados).
- **`secretOrKey`**: lectura del `.env` para verificar firma.
- **`validate(payload)`**: función llamada cuando token es válido; retorna lo que será `req.user`. En tu caso devuelves `{ userId, username }`.

---

### JwtAuthGuard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }
}
```

#### Explicación

- Extiende `AuthGuard('jwt')` de Passport. `canActivate` delega al guard base.
- `handleRequest` lanza 401 si no hay usuario o si hay error.
- **Uso:** proteges rutas con `@UseGuards(JwtAuthGuard)` para restringir acceso.

---

## 📦 DTOs y Validaciones

Explico los DTOs principales (qué validan y por qué):

### CategoriaDto

```typescript
export class CategoriaDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre no debe estar vacio' })
  nombre: string;
}
```

- Solo exige `nombre`. `slug` se genera en servicio con `slugify`.

---

### ContactoDto

- `nombre`: `IsNotEmpty`
- `correo`: `IsEmail`
- `telefono`: `IsPhoneNumber('CL')` — valida formato chileno (útil si frontend es local).
- `mensaje`: `IsNotEmpty`

---

### EjemploDto

- Muestra uso de `IsNumber`, `IsBoolean` y `IsNotEmpty` — útil como referencia.

---

### LoginDto

- `correo` (`IsEmail`), `password` (`IsNotEmpty`).

---

### RecetaDto

- `nombre`, `tiempo`, `descripcion` con `IsNotEmpty`
- `categoria_id` `IsNotEmpty` (se recibe como string y luego parseas a número en servicio)
- `usuario_id?` opcional (si no viene, el servicio asigna 1).

---

### RegistroDto

- `nombre`, `correo` (`IsEmail`), `password` (`IsNotEmpty`).

---

**Por qué usar DTOs y `ValidationPipe`:** centraliza validación, evita lógica de validación esparcida por controladores/servicios. `ValidationPipe` lanza 400 con errores claros antes de ejecutar la lógica.

---

## ✅ Buenas prácticas aplicadas y recomendaciones

### Aplicadas:

- ✅ Validaciones exhaustivas (DTO + pipes).
- ✅ Separation of concerns: controller => presentación / request context; service => lógica y DB.
- ✅ Manejo de errores con `HttpException` y códigos HTTP claros.
- ✅ No exponer contraseñas ni información sensible en responses.
- ✅ Eliminar archivos físicos cuando hay errores para mantener el servidor limpio.
- ✅ Documentación con Swagger (útil para reclutadores y pruebas).
- ✅ Versionado de API con `setGlobalPrefix('api/v1')`.

---

## 📜 Licencia

**MIT** — libre para usar y adaptar. Mantén créditos si lo compartes públicamente.
---

**¡Gracias por revisar esta documentación! Si tienes dudas o mejoras, no dudes en contribuir al repositorio.**
