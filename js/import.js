async function importarElementos(contenedor = document) {
    const elementos = contenedor.querySelectorAll("[imports]");

    await Promise.all(
        Array.from(elementos).map(async (elemento) => {
            const ruta = elemento.getAttribute("imports");

            try {
                const respuesta = await fetch(ruta);

                if (!respuesta.ok) {
                    throw new Error(`HTTP ${respuesta.status}: ${ruta}`);
                }

                const html = await respuesta.text();

                elemento.innerHTML = html;
                elemento.removeAttribute("imports");

                // Corregir las rutas relativas del HTML importado
                const urlBase = new URL(ruta, document.baseURI);

                elemento
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

                // Importar también los elementos anidados
                await importarElementos(elemento);
            } catch (error) {
                console.error(`Error al importar "${ruta}":`, error);
            }
        }),
    );
}

document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.scrollBehavior = "smooth";
    importarElementos();
});
