### US 7: Integración Básica del Frontend (Lectura y Estados de UI)
**Como** usuario de la aplicación React  
**Quiero** visualizar la información provista por la API y conocer el estado de la comunicación con el servidor (carga o error)  
**Para** tener una experiencia de usuario fluida y transparente sin datos mockeados en `localStorage`.

* **Criterios de Aceptación:**
  * Se debe eliminar el uso de `localStorage` para la persistencia del estado en el frontend.
  * Al ingresar, el frontend debe consultar a la API para traer los elementos y mostrarlos.
  * Mientras se obtienen los datos, debe mostrarse un estado de carga claro (spinner, skeleton o texto).
  * Si la conexión con la API falla o devuelve un error, se debe mostrar un mensaje de error descriptivo en pantalla.
  * Si la base de datos está vacía, se debe mostrar un mensaje que indique que no hay elementos cargados.

* **Tareas Técnicas:**
  * Reemplazar las lecturas directas a `localStorage` por llamadas HTTP (usando `fetch` o `axios`).
  * Agregar estados de React (`isLoading`, `error`) para controlar el renderizado condicional del spinner y mensajes de error.
  * Adaptar el flujo de búsquedas y filtrados para que, si corresponde, consulte al backend.
