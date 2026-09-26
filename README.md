# Invitación de Micaela

Sitio estático de una sola pantalla, construido con HTML, CSS, JavaScript, GSAP desde CDN y Canvas 2D. Abrí `index.html` con un servidor local o publicá estos archivos en cualquier hosting estático.

## Confirmaciones por email

El RSVP ya tiene configurada su access key de Web3Forms en `script.js`. La dirección receptora se define en Web3Forms y no se guarda en los archivos públicos del sitio.

Antes de compartir la invitación, probá una confirmación con una URL como `/?guest=Prueba` y verificá que llegue el correo.

Las invitaciones personalizadas usan `/?guest=Nombre`. Sin ese parámetro se pide el nombre al aceptar. Tras una respuesta exitosa, el dispositivo guarda el estado localmente para evitar envíos repetidos. El botón de calendario descarga un `.ics` sin hora de finalización.

Los cuatro `.webp` de `assets/` son los PNG proporcionados, recortados a su área visible y comprimidos sin alterar la ilustración. La referencia de póster se usó únicamente como guía visual.

La intro, la nave y el sobre se omiten o simplifican cuando el sistema solicita movimiento reducido. El RSVP mantiene la misma respuesta y control de errores en ambos modos.
