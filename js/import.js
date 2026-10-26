async function importarElementos(contenedor = document) {
    const elementos = Array.from(contenedor.querySelectorAll("[imports]"));

    await Promise.all(
        elementos.map(async (elemento) => {
            const ruta = elemento.getAttribute("imports");

            try {
                const respuesta = await fetch(ruta);

                if (!respuesta.ok) {
                    throw new Error(`HTTP ${respuesta.status}: ${ruta}`);
                }

                const html = await respuesta.text();

                // Crear un contenedor temporal para analizar el HTML
                const temporal = document.createElement("template");
                temporal.innerHTML = html;

                // Corregir las rutas relativas del HTML importado
                const urlBase = new URL(ruta, document.baseURI);

                temporal.content
                    .querySelectorAll("[href], [src]")
                    .forEach((etiqueta) => {
                        for (const atributo of ["href", "src"]) {
                            if (!etiqueta.hasAttribute(atributo)) continue;

                            const valor = etiqueta.getAttribute(atributo);

                            // No modificar rutas absolutas ni enlaces especiales
                            if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(valor)) {
                                continue;
                            }

                            etiqueta.setAttribute(
                                atributo,
                                new URL(valor, urlBase).href,
                            );
                        }
                    });

                // Insertar los hijos importados en la posición del contenedor
                const fragmento = temporal.content;

                elemento.replaceWith(fragmento);
            } catch (error) {
                console.error(`Error al importar "${ruta}":`, error);
            }
        }),
    );

    // Importar también los elementos anidados recién insertados
    const pendientes = contenedor.querySelectorAll("[imports]");

    if (pendientes.length > 0) {
        await importarElementos(contenedor);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.scrollBehavior = "smooth";
    importarElementos();
});
