// ================== HORA EN FORMATO 24 ==================
function actualizarHora() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  const segundos = ahora.getSeconds().toString().padStart(2, '0');

  const hora24 = `${horas}:${minutos}:${segundos}`;
  const reloj = document.getElementById('fecha-hora');
  if (reloj) reloj.innerHTML = `${fecha} - ${hora24}`;
}
setInterval(actualizarHora, 1000);
actualizarHora();

// ================== CONTADORES ==================
let contadores = { general: 3, deporte: 3, negocios: 3 };
function actualizarContadores() {
  if (document.getElementById('contador-general'))
    document.getElementById('contador-general').textContent = contadores.general;
  if (document.getElementById('contador-deporte'))
    document.getElementById('contador-deporte').textContent = contadores.deporte;
  if (document.getElementById('contador-negocios'))
    document.getElementById('contador-negocios').textContent = contadores.negocios;
}
actualizarContadores();

// ================== EXPANDIR UNA SOLA NOTICIA A LA VEZ ==================
document.addEventListener('click', function (e) {
  const noticia = e.target.closest('.noticia');
  if (!noticia || e.target.closest('form')) return;

  document.querySelectorAll('.noticia.expandida').forEach(n => {
    if (n !== noticia) n.classList.remove('expandida');
  });

  noticia.classList.toggle('expandida');
});

// ================== FORMULARIO: AGREGAR ARTÍCULO ==================
document.getElementById('form-articulo')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const titulo = document.getElementById('titulo-articulo').value;
  const contenido = document.getElementById('contenido-articulo').value;
  const seccion = document.getElementById('seccion-articulo').value;
  const imagenInput = document.getElementById('imagen-articulo');

  let imagenURL = 'img/default.jpg';
  if (imagenInput.files.length === 1) {
    imagenURL = URL.createObjectURL(imagenInput.files[0]);
  }

  const nuevoArticulo = {
    titulo,
    contenido,
    seccion,
    imagen: imagenURL,
    fecha: new Date().toLocaleDateString('es-CL', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  };

  const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
  articulos.push(nuevoArticulo);
  localStorage.setItem('articulos', JSON.stringify(articulos));

  contadores[seccion]++;
  actualizarContadores();
  actualizarSelectorEliminar();
  actualizarMarquee();
  this.reset();
  alert("Artículo agregado correctamente.");

  if (document.getElementById(`contenedor-${seccion}`)) {
    renderArticulo(nuevoArticulo);
  }
});

// ================== FORMULARIO DE CONTACTO ==================
document.getElementById('form-contacto')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  alert(`Gracias por contactarnos, ${nombre}. Tu mensaje fue recibido.`);
  this.reset();
});

// ================== FUNCIÓN PARA RENDERIZAR UN ARTÍCULO ==================
function renderArticulo(articulo) {
  const contenedor = document.getElementById(`contenedor-${articulo.seccion}`);
  if (!contenedor) return;

  const nuevoArticulo = document.createElement('div');
  nuevoArticulo.className = 'column is-one-third';
  nuevoArticulo.innerHTML = `
    <div class="card noticia">
      <div class="card-image">
        <figure class="image is-4by3">
          <img src="${articulo.imagen}" alt="Imagen cargada">
        </figure>
      </div>
      <div class="card-content">
        <h3 class="title is-5">${articulo.titulo}</h3>
        <p class="is-italic">${articulo.contenido.substring(0, 100)}...</p>
        <div class="contenido-completo">
          <p class="contenido-noticia">${articulo.contenido}</p>
        </div>
      </div>
    </div>
  `;
  contenedor.appendChild(nuevoArticulo);
}

// ================== FORMULARIO: ELIMINAR ARTÍCULO ==================
function actualizarSelectorEliminar() {
  const select = document.getElementById('select-articulo-eliminar');
  if (!select) return;

  const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
  select.innerHTML = '<option value="" disabled selected hidden>Elija un artículo para eliminar</option>';

  articulos.forEach((articulo, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${articulo.titulo} (${articulo.seccion})`;
    select.appendChild(option);
  });
}


document.getElementById('form-eliminar-articulo')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const index = parseInt(document.getElementById('select-articulo-eliminar').value);
  const motivo = document.getElementById('motivo-eliminacion').value;

  if (!Number.isInteger(index) || !motivo.trim()) return;

  const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
  const eliminado = articulos.splice(index, 1);
  localStorage.setItem('articulos', JSON.stringify(articulos));

  alert(`Artículo "${eliminado[0].titulo}" eliminado.\nMotivo: ${motivo}`);
  location.reload();
});

// ================== CARGA GENERAL ==================
window.addEventListener('DOMContentLoaded', () => {
  const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
  const ruta = window.location.pathname;

  const seccion = ruta.includes("general") ? "general" :
                  ruta.includes("deporte") ? "deporte" :
                  ruta.includes("negocios") ? "negocios" : null;

  if (seccion) {
    const contenedor = document.getElementById(`contenedor-${seccion}`);
    const laterales = {
      general: ["deporte", "negocios"],
      deporte: ["general", "negocios"],
      negocios: ["general", "deporte"]
    };

    const propios = articulos.filter(a => a.seccion === seccion);
    const otros1 = articulos.filter(a => a.seccion === laterales[seccion][0]);
    const otros2 = articulos.filter(a => a.seccion === laterales[seccion][1]);

    const lateralIzq = document.getElementById("lateral-izq");
    const lateralDer = document.getElementById("lateral-der");

    if (propios.length > 0) {
      const reciente = propios[propios.length - 1];

      const destacado = document.createElement("article");
      destacado.className = "box destacado";
      destacado.innerHTML = `
        <div class="is-flex is-justify-content-space-between mb-2">
          <span class="has-text-grey is-uppercase has-text-weight-bold">${seccion}</span>
          <span class="tag is-info is-light is-small">🆕 Artículo más reciente</span>
        </div>
        <h3 class="title is-4">${reciente.titulo}</h3>
        <figure class="image is-3by2"><img src="${reciente.imagen}" alt="Imagen destacada"></figure>
        <p class="mt-2">${reciente.contenido}</p>
        <p class="has-text-grey-light is-size-7 mt-2">${reciente.fecha}</p>
      `;
      contenedor.prepend(destacado);

      const anteriores = propios.slice(0, -1).reverse();
      anteriores.forEach(a => {
        const art = document.createElement("article");
        art.className = "box";
        art.innerHTML = `
          <h4 class="title is-5">${a.titulo}</h4>
          <figure class="image is-4by3"><img src="${a.imagen}" alt="Imagen noticia"></figure>
          <p class="mt-2">${a.contenido}</p>
          <p class="has-text-grey-light is-size-7 mt-2">${a.fecha}</p>
        `;
        contenedor.appendChild(art);
      });
    }

    const renderLateral = (lista, contenedor) => {
      lista.slice(-2).reverse().forEach(a => {
        const div = document.createElement("div");
        div.className = "articulo-lateral";
        div.innerHTML = `
          <h4>${a.titulo}</h4>
          <figure class="image is-4by3"><img src="${a.imagen}" alt="Miniatura"></figure>
          <p class="is-size-7">${a.contenido.substring(0, 80)}...</p>
        `;
        contenedor.appendChild(div);
      });
    };

    renderLateral(otros1, lateralIzq);
    renderLateral(otros2, lateralDer);
  } else {
    articulos.forEach(a => {
      renderArticulo(a);
      contadores[a.seccion]++;
    });
    actualizarContadores();
    actualizarSelectorEliminar();
    actualizarMarquee();
  }
});

// ================== MARQUEE ==================
function actualizarMarquee() {
  const marquee = document.getElementById("marquee-aviso");
  if (!marquee) return;

  const articulosFijos = [
    { titulo: "Protesta de pescadores en Valparaíso", url: "general.html" },
    { titulo: "Incendio forestal arrasa 50 hectáreas", url: "general.html" },
    { titulo: "Choque múltiple en Coquimbo", url: "general.html" },
    { titulo: "Tabilo avanza a semifinales", url: "deportes.html" },
    { titulo: "Garín elimina a top 20", url: "deportes.html" },
    { titulo: "Jarry se retira por lesión", url: "deportes.html" },
    { titulo: "Startup crea app para reciclaje", url: "negocios.html" },
    { titulo: "Café aumenta ventas", url: "negocios.html" },
    { titulo: "Criptomonedas se estabilizan", url: "negocios.html" }
  ];

  const articulosLocal = JSON.parse(localStorage.getItem("articulos")) || [];
  const titulosLocal = articulosLocal.map(a => {
    const mapaURL = {
      general: "general.html",
      deporte: "deportes.html",
      negocios: "negocios.html"
    };
    return {
      titulo: a.titulo,
      url: mapaURL[a.seccion] || "#"
    };
  });
  

  const todos = [...articulosFijos, ...titulosLocal];

  marquee.innerHTML = todos.map(a =>
    `<a href="${a.url}" class="has-text-link-dark mx-4" style="text-decoration:none">${a.titulo}</a>`
  ).join(" ⚫ ");
}
