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

                // Importar también los elementos anidados
                await importarElementos(elemento);

            } catch (error) {
                console.error(`Error al importar "${ruta}":`, error);
            }
        })
    );
}

document.addEventListener("DOMContentLoaded", () => {
    importarElementos();
});
