# Invitación de Micaela

Sitio estático de una sola pantalla, construido con HTML, CSS, JavaScript, GSAP desde CDN y Canvas 2D. Abrí `index.html` con un servidor local o publicá estos archivos en cualquier hosting estático.

## Activar confirmaciones por email

1. Generá una access key de Web3Forms vinculada al email que recibirá las confirmaciones.
2. En `script.js`, reemplazá `REEMPLAZAR_ACCESS_KEY` en `EVENT.web3FormsAccessKey`.
3. Probá una confirmación real con una URL como `/?guest=Prueba` y verificá que llegue el correo antes de compartir la invitación.

El email receptor se configura en Web3Forms mediante la access key; no se guarda la dirección en los archivos públicos del sitio.

Las invitaciones personalizadas usan `/?guest=Nombre`. Sin ese parámetro se pide el nombre al aceptar. Tras una respuesta exitosa, el dispositivo guarda el estado localmente para evitar envíos repetidos. El botón de calendario descarga un `.ics` sin hora de finalización.

Los cuatro `.webp` de `assets/` son los PNG proporcionados, recortados a su área visible y comprimidos sin alterar la ilustración. La referencia de póster se usó únicamente como guía visual.

La intro, la nave y el sobre se omiten o simplifican cuando el sistema solicita movimiento reducido. El RSVP mantiene la misma respuesta y control de errores en ambos modos.
