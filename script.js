// Clase Producto con detalles completos
class Producto {
  constructor(nombre, precio, calificacion, imagen, detalles) {
    this.nombre = nombre;
    this.precio = precio;
    this.calificacion = calificacion;
    this.imagen = imagen;
    this.detalles = detalles;
  }

  mostrarInfo() {
    return `${this.nombre}, Precio: $${this.precio}, Calificación: ${this.calificacion}`;
  }
}

const productosAgregados = [];

// Función para buscar productos en MercadoLibre
const fetchProducts = async (query) => {
  const url = `https://api.mercadolibre.com/sites/MLA/search?q=${query}&limit=5`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// Función para obtener detalles de un producto por su ID
const fetchProductDetails = async (productId) => {
  const url = `https://api.mercadolibre.com/items/${productId}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
};

// Función para obtener la imagen de mayor resolución
function obtenerImagenMasResolucion(producto) {
  if (producto.pictures && producto.pictures.length > 0) {
    const imagenMasResolucion = producto.pictures.reduce((max, imagen) => {
      const [maxAncho, maxAlto] = max.max_size.split("x").map(Number);
      const [ancho, alto] = imagen.max_size.split("x").map(Number);
      return ancho * alto > maxAncho * maxAlto ? imagen : max;
    });
    return imagenMasResolucion.secure_url;
  }
  return null;
}

// Función para obtener detalles específicos del producto
const obtenerDetallesProducto = async (product) => {
  try {
    const details = await fetchProductDetails(product.id);

    // Función interna para obtener el valor de un atributo por su ID
    function obtenerValorAtributo(attributes, attributeId) {
      const attribute = attributes.find((attr) => attr.id === attributeId);
      return attribute ? attribute.value_name : "No especificado";
    }

    // Obtener los valores específicos
    const marca = obtenerValorAtributo(details.attributes, "BRAND");
    const modelo = obtenerValorAtributo(details.attributes, "MODEL");
    const resolucionPantalla = obtenerValorAtributo(
      details.attributes,
      "DISPLAY_RESOLUTION_TYPE"
    );
    const colorPrincipal = obtenerValorAtributo(
      details.attributes,
      "MAIN_COLOR"
    );
    const condicion = obtenerValorAtributo(
      details.attributes,
      "ITEM_CONDITION"
    );
    const modeloProcesador = obtenerValorAtributo(
      details.attributes,
      "PROCESSOR_MODEL"
    );
    const peso = obtenerValorAtributo(details.attributes, "WEIGHT");
    const precio = details.price;
    let ram = obtenerValorAtributo(details.attributes, "RAM");
    if (ram === "No especificado") {
      ram = "No especificado";
    }
    let almacenamiento = obtenerValorAtributo(
      details.attributes,
      "INTERNAL_MEMORY"
    );
    if (almacenamiento === "No especificado") {
      almacenamiento = "No especificado";
    }
    let bateria = obtenerValorAtributo(details.attributes, "BATTERY_CAPACITY");
    if (bateria === "No especificado") {
      bateria = "No especificado";
    }

    console.log(details);

    // Obtener la imagen de mayor resolución
    const imagen = obtenerImagenMasResolucion(details);

    // Retornar un objeto Producto con los detalles del producto
    return new Producto(
      product.title,
      precio,
      product.condition === "new" ? 5 : 4,
      imagen || product.thumbnail,
      {
        marca,
        modelo,
        colorPrincipal,
        resolucionPantalla,
        bateria,
        almacenamiento,
        condicion,
        modeloProcesador,
        peso,
        ram,
      }
    );
  } catch (error) {
    console.error("Error obtaining product details:", error);
  }
};

// Función para agregar un producto a la lista
const agregarProducto = (producto) => {
  productosAgregados.push(producto);
  mostrarProductosAgregados();
};

// Función para mostrar los productos agregados
const mostrarProductosAgregados = () => {
  const productList = document.getElementById("productsList");
  productList.innerHTML = "";
  productosAgregados.forEach((producto, index) => {
    // Estructura de la tarjeta
    const container = document.createElement("div");
    container.classList.add("card_container");

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card_container");

    const cardArticle = document.createElement("article");
    cardArticle.classList.add("card__article");

    const img = document.createElement("img");
    img.src = producto.imagen;
    img.alt = producto.nombre;
    img.classList.add("card__img");
    cardArticle.appendChild(img);

    const cardData = document.createElement("div");
    cardData.classList.add("card__data");

    const cardTitle = document.createElement("h2");
    cardTitle.classList.add("card__title");
    cardTitle.textContent = producto.nombre;
    cardData.appendChild(cardTitle);

    const cardDescription = document.createElement("span");
    cardDescription.classList.add("card__description");
    cardDescription.textContent = `Precio: $${producto.precio}`;
    cardData.appendChild(cardDescription);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("botones", "eliminar-producto");
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => eliminarProducto(index));
    cardData.appendChild(deleteButton);

    cardArticle.appendChild(cardData);
    cardContainer.appendChild(cardArticle);
    container.appendChild(cardContainer);
    productList.appendChild(container);
  });
};

// Función para eliminar un producto de la lista
const eliminarProducto = (index) => {
  productosAgregados.splice(index, 1);
  mostrarProductosAgregados();
};

// Función para comparar productos con más criterios
function compararProductosAvanzada() {
  if (productosAgregados.length < 2) {
    alert("Por favor, agrega al menos dos productos para comparar.");
    return;
  }

  // Criterios de comparación y sus pesos
  const criterios = {
    precio: 0.3, // Peso del precio (40%)
    calificacion: 0.2, // Peso de la calificación (30%)
    ram: 0.1, // Peso de la memoria RAM (10%)
    almacenamiento: 0.1, // Peso del almacenamiento (10%)
    bateria: 0.1, // Peso de la batería (10%)
    peso: 0.1, // Peso del peso (10%)
    resolucionPantalla: 0.1, // Peso de la resolución de pantalla (10%)
  };

  // Calcular la puntuación de cada producto
  const puntuaciones = productosAgregados.map((producto) => {
    let puntuacion = 0;
    puntuacion += (1 / producto.precio) * criterios.precio;
    puntuacion += producto.calificacion * criterios.calificacion;
    puntuacion += (parseFloat(producto.detalles.ram) || 0) * criterios.ram;
    puntuacion +=
      (parseFloat(producto.detalles.almacenamiento) || 0) *
      criterios.almacenamiento;
    puntuacion +=
      (parseFloat(producto.detalles.bateria) || 0) * criterios.bateria;
    puntuacion += (parseFloat(producto.detalles.peso) || 0) * criterios.peso;
    puntuacion +=
      (parseFloat(producto.detalles.resolucionPantalla) || 0) *
      criterios.resolucionPantalla;
    return puntuacion;
  });

  // Encontrar el producto con la puntuación más alta
  const mejorProducto =
    productosAgregados[puntuaciones.indexOf(Math.max(...puntuaciones))];
  mejorProducto.aspectosMejorados = "";

  // Comparar el mejor producto con los demás y agregar los aspectos mejorados
  productosAgregados.forEach((producto) => {
    if (producto !== mejorProducto) {
      if (producto.precio > mejorProducto.precio) {
        mejorProducto.aspectosMejorados +=
          "Precio más bajo que otros productos. ";
      }
      if (producto.calificacion < mejorProducto.calificacion) {
        mejorProducto.aspectosMejorados +=
          "Este producto tiene una mejor calificación que otros. ";
      }
      if (
        producto.detalles.ram &&
        producto.detalles.ram !== "No especificado" &&
        producto.detalles.ram < mejorProducto.detalles.ram
      ) {
        mejorProducto.aspectosMejorados += "Más RAM que otros productos. ";
      }
      if (
        producto.detalles.almacenamiento &&
        producto.detalles.almacenamiento !== "No especificado" &&
        producto.detalles.almacenamiento < mejorProducto.detalles.almacenamiento
      ) {
        mejorProducto.aspectosMejorados +=
          "Mayor almacenamiento que los demas. ";
      }
      if (
        producto.detalles.bateria &&
        producto.detalles.bateria !== "No especificado" &&
        producto.detalles.bateria < mejorProducto.detalles.bateria
      ) {
        mejorProducto.aspectosMejorados += "Mayor capacidad batería. ";
      }
      if (
        producto.detalles.peso &&
        producto.detalles.peso !== "No especificado" &&
        producto.detalles.peso > mejorProducto.detalles.peso
      ) {
        mejorProducto.aspectosMejorados +=
          "Este producto es más ligero que otros productos. ";
      }
      if (
        producto.detalles.resolucionPantalla &&
        producto.detalles.resolucionPantalla !== "No especificado" &&
        producto.detalles.resolucionPantalla <
        mejorProducto.detalles.resolucionPantalla
      ) {
        mejorProducto.aspectosMejorados +=
          "Resolución de pantalla más alta que otros productos. ";
      }
    }
  });

  // Mostrar los resultados de la comparación
  mostrarResultadosComparacionAvanzada(mejorProducto, puntuaciones);
}

// Función para mostrar los resultados de la comparación avanzada
function mostrarResultadosComparacionAvanzada(mejorProducto, puntuaciones) {
  const comparisonResults = document.getElementById("comparisonResults");
  comparisonResults.innerHTML = "";

  if (mejorProducto && puntuaciones && puntuaciones.length >= 0) {
    const mejorProductoDiv = document.createElement("div");
    mejorProductoDiv.classList.add("mejor-producto");

    const puntuacionMejorProducto =
      puntuaciones[productosAgregados.indexOf(mejorProducto)];
    const porcentajePuntuacion = Math.round(
      (puntuacionMejorProducto / puntuaciones.reduce((a, b) => a + b, 0)) * 100
    );

    mejorProductoDiv.innerHTML = `
      <img src="${mejorProducto.imagen}" alt="${mejorProducto.nombre}" class="product-image">
      <span class="destacado">Mejor Producto:</span> ${mejorProducto.nombre}
      <p>Puntuación: ${porcentajePuntuacion}% Superior que otros productos.</p>
      <p>Consideraciones: ${mejorProducto.aspectosMejorados}</p>
    `;

    comparisonResults.appendChild(mejorProductoDiv);
  } else {
    const noResultsDiv = document.createElement("div");
    noResultsDiv.classList.add("no-results");
    noResultsDiv.innerHTML = `
      <span class="destacado">No se encontró mejor producto para mostrar.</span>
    `;
    comparisonResults.appendChild(noResultsDiv);
  }
}

// Mostrar todos los productos comparados
productosAgregados.forEach((producto) => {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  productCard.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">
      <div class="product-info">
        <h3>${producto.nombre}</h3>
        <p>Precio: $${producto.precio}</p>
        <p>Calificación: ${producto.calificacion}</p>
        <p>RAM: ${producto.detalles.ram}</p>
        <p>Almacenamiento: ${producto.detalles.almacenamiento}</p>
        <p>Batería: ${producto.detalles.bateria}</p>
        <p>Peso: ${producto.detalles.peso}</p>
        <p>Resolución de Pantalla: ${producto.detalles.resolucionPantalla}</p>
      </div>
    `;

  comparisonResults.appendChild(productCard);
});

// Botón para comparar productos avanzado
const compararButtonAvanzado = document.getElementById("compareButtonAvanzado");
compararButtonAvanzado.addEventListener("click", compararProductosAvanzada);

// Cargar productos desde MercadoLibre al hacer clic en buscar
document.getElementById("buscarBtn").addEventListener("click", async () => {
  const query = document.getElementById("searchQuery").value;
  if (!query) return;

  const products = await fetchProducts(query);
  mostrarResultadosBusqueda(products);
});

// Mostrar resultados de la búsqueda de productos
const mostrarResultadosBusqueda = async (products) => {
  const searchResults = document.getElementById("searchResults");
  searchResults.innerHTML = "";

  products.forEach(async (product) => {
    const productoConDetalles = await obtenerDetallesProducto(product);

    // Estructura de la tarjeta
    const container = document.createElement("div");
    container.classList.add("container");

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card_container");

    const cardArticle = document.createElement("article");
    cardArticle.classList.add("card__article");

    const img = document.createElement("img");
    img.src = productoConDetalles.imagen;
    img.alt = product.title;
    img.classList.add("card__img");
    cardArticle.appendChild(img);

    const cardData = document.createElement("div");
    cardData.classList.add("card__data");

    const cardDescription = document.createElement("span");
    cardDescription.classList.add("card__description");
    cardDescription.textContent = `Modelo: ${productoConDetalles.detalles.modelo}`;
    cardData.appendChild(cardDescription);

    const cardTitle = document.createElement("h2");
    cardTitle.classList.add("card__title");
    cardTitle.textContent = product.title;
    cardData.appendChild(cardTitle);

    const agregarBtn = document.createElement("button");
    agregarBtn.classList.add("botones", "agregar-producto");
    agregarBtn.textContent = "Agregar";
    agregarBtn.addEventListener("click", () =>
      agregarProducto(productoConDetalles)
    );
    cardData.appendChild(agregarBtn);

    cardArticle.appendChild(cardData);
    cardContainer.appendChild(cardArticle);
    searchResults.appendChild(cardContainer);
  });
};
