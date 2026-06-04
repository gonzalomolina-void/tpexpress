### US 8: Integración Avanzada del Frontend (Modificaciones del CRUD)
**Como** usuario o administrador  
**Quiero** poder realizar modificaciones (crear, editar, borrar) desde la UI del Frontend  
**Para** gestionar los datos persistidos en tiempo real.

* **Criterios de Aceptación:**
  * Al realizar una acción de creación, edición o eliminación de forma exitosa, la interfaz gráfica debe actualizarse para reflejar los cambios (sin recargar toda la página).
  * Si la operación de escritura falla, la interfaz debe mostrar un mensaje advirtiendo al usuario de manera clara.

* **Tareas Técnicas:**
  * Conectar los formularios de creación y edición del frontend a los endpoints correspondientes de la API backend.
  * Implementar el manejo del botón "Eliminar" conectándolo con la API.
  * Manejar los casos de error del backend (como el error `400` de validación) y renderizarlos en los formularios.
