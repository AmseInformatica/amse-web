// Active nav highlight
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const parametrosFormulario = new URLSearchParams(window.location.search);
const estadoMensaje = parametrosFormulario.get('mensaje');
const vieneDesdeFormulario = ['error', 'correo-invalido'].includes(estadoMensaje);
const mensajeFormulario = document.getElementById('mensajeFormulario');
const formularioContacto = document.getElementById('formularioContacto') || document.querySelector('.contacto-form');
const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbx-yqKSmBZ96jBeEfBFHDiHykXGVqXR70gKlf_RzMSgO0sKrYd3w8n4yaQs08L7ExOu/exec';
let formularioEnviando = false;
let temporizadorFormulario = null;
let elementoFocoAnterior = null;
const TIEMPO_ESPERA_ENVIO_MS = 15000;

const modalPrivacidad = document.getElementById('privacidad');
const botonesAbrirPrivacidad = document.querySelectorAll('[data-abrir-privacidad]');
const botonesCerrarPrivacidad = document.querySelectorAll('[data-cerrar-privacidad]');

function abrirPrivacidad() {
  if (!modalPrivacidad) return;

  elementoFocoAnterior = document.activeElement;
  modalPrivacidad.classList.add('active');
  modalPrivacidad.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const contenido = modalPrivacidad.querySelector('.privacidad-content');

  if (contenido) {
    contenido.scrollTop = 0;
    contenido.focus({ preventScroll: true });
  }
}

function cerrarPrivacidad() {
  if (!modalPrivacidad) return;

  modalPrivacidad.classList.remove('active');
  modalPrivacidad.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  if (elementoFocoAnterior instanceof HTMLElement) {
    elementoFocoAnterior.focus({ preventScroll: true });
  }
}

botonesAbrirPrivacidad.forEach(boton => {
  boton.addEventListener('click', abrirPrivacidad);
});

botonesCerrarPrivacidad.forEach(boton => {
  boton.addEventListener('click', cerrarPrivacidad);
});

if (modalPrivacidad) {
  modalPrivacidad.addEventListener('click', event => {
    if (event.target === modalPrivacidad) {
      cerrarPrivacidad();
    }
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modalPrivacidad && modalPrivacidad.classList.contains('active')) {
    cerrarPrivacidad();
  }

  if (event.key === 'Tab' && modalPrivacidad && modalPrivacidad.classList.contains('active')) {
    const elementos = [...modalPrivacidad.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')]
      .filter(elemento => !elemento.hasAttribute('disabled'));
    const primero = elementos[0];
    const ultimo = elementos[elementos.length - 1];

    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }
});

function onScroll() {
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 80;

    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');

    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', onScroll);
onScroll();

// Menu hamburguesa responsive
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-links');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(navMenu.classList.contains('open')));
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', event => {
    const clickDentroNav = event.target.closest('nav');

    if (!clickDentroNav) {
      navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Cambio de imagenes en proyectos con flechas
document.querySelectorAll('.proyecto-galeria').forEach(galeria => {
  const imagenes = galeria.querySelectorAll('img');
  const botonPrev = galeria.querySelector('.proyecto-prev');
  const botonNext = galeria.querySelector('.proyecto-next');

  let actual = 0;

  if (imagenes.length === 0) return;

  function mostrarImagen(nuevaImagen) {
    imagenes[actual].classList.remove('active');

    actual = nuevaImagen;

    if (actual < 0) {
      actual = imagenes.length - 1;
    }

    if (actual >= imagenes.length) {
      actual = 0;
    }

    imagenes[actual].classList.add('active');
  }

  if (botonPrev) {
    botonPrev.addEventListener('click', () => {
      mostrarImagen(actual - 1);
    });
  }

  if (botonNext) {
    botonNext.addEventListener('click', () => {
      mostrarImagen(actual + 1);
    });
  }
});

// Mensaje formulario contacto
function mostrarMensajeFormulario(estado) {
  if (!mensajeFormulario) return;

  mensajeFormulario.classList.remove('exito', 'error');

  if (estado === 'enviado') {
    mensajeFormulario.textContent = 'Mensaje enviado correctamente. Te contactaremos a la brevedad.';
    mensajeFormulario.classList.add('exito');
  }

  if (estado === 'error') {
    mensajeFormulario.textContent = 'No se pudo confirmar el envío. Tus datos siguen en el formulario para que intentes nuevamente.';
    mensajeFormulario.classList.add('error');
  }

  if (estado === 'campos-incompletos') {
    mensajeFormulario.textContent = 'Completa todos los campos obligatorios y acepta la Política de Privacidad.';
    mensajeFormulario.classList.add('error');
  }

  if (estado === 'correo-invalido') {
    mensajeFormulario.textContent = 'El correo ingresado no es valido.';
    mensajeFormulario.classList.add('error');
  }

  const contacto = document.getElementById('contacto');

  if (contacto) {
    contacto.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

if (vieneDesdeFormulario) {
  mostrarMensajeFormulario(estadoMensaje);
}

if (formularioContacto) {
  formularioContacto.action = googleAppsScriptUrl;
  formularioContacto.method = 'POST';

  const campoInicioFormulario = formularioContacto.querySelector('[name="form_started"]');

  if (campoInicioFormulario) {
    campoInicioFormulario.value = String(Date.now());
  }

  let iframeContacto = document.getElementById('iframeContacto');

  if (!iframeContacto) {
    iframeContacto = document.createElement('iframe');
    iframeContacto.id = 'iframeContacto';
    iframeContacto.name = 'iframeContacto';
    iframeContacto.hidden = true;
    iframeContacto.title = 'Envio formulario contacto';
    document.body.appendChild(iframeContacto);
  }

  function restaurarBotonFormulario() {
    const botonEnviar = formularioContacto.querySelector('button[type="submit"]');

    if (botonEnviar) {
      botonEnviar.disabled = false;
      botonEnviar.textContent = botonEnviar.dataset.textoOriginal || 'Enviar Mensaje';
    }
  }

  function finalizarEsperaFormulario() {
    formularioEnviando = false;

    if (temporizadorFormulario) {
      clearTimeout(temporizadorFormulario);
      temporizadorFormulario = null;
    }

    restaurarBotonFormulario();
  }

  window.addEventListener('message', event => {
    const origenPermitido = /^https:\/\/(script\.google\.com|script\.googleusercontent\.com)$/.test(event.origin);

    if (!formularioEnviando || !origenPermitido || !event.data || event.data.formulario !== 'contacto-amse') {
      return;
    }

    finalizarEsperaFormulario();

    if (event.data.ok) {
      formularioContacto.reset();
      if (campoInicioFormulario) campoInicioFormulario.value = String(Date.now());
      mostrarMensajeFormulario('enviado');
      return;
    }

    if (event.data.error === 'correo-invalido') {
      mostrarMensajeFormulario('correo-invalido');
      return;
    }

    mostrarMensajeFormulario('error');
  });

  formularioContacto.addEventListener('submit', event => {
    event.preventDefault();
    if (formularioEnviando) return;

    const scriptUrl = formularioContacto.dataset.scriptUrl || googleAppsScriptUrl;
    const datos = new FormData(formularioContacto);
    const correo = String(datos.get('correo') || '').trim();
    const botonEnviar = formularioContacto.querySelector('button[type="submit"]');
    const textoOriginalBoton = botonEnviar ? botonEnviar.textContent : '';
    const aceptaPrivacidad = formularioContacto.querySelector('[name="acepta_privacidad"]');

    if (!datos.get('nombre') || !correo || !datos.get('asunto') || !datos.get('mensaje')) {
      mostrarMensajeFormulario('campos-incompletos');
      return;
    }

    if (aceptaPrivacidad && !aceptaPrivacidad.checked) {
      mostrarMensajeFormulario('campos-incompletos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarMensajeFormulario('correo-invalido');
      return;
    }

    if (!scriptUrl || scriptUrl === 'AQUI_VA_LA_URL_DE_GOOGLE_APPS_SCRIPT') {
      mostrarMensajeFormulario('error');
      return;
    }

    if (botonEnviar) {
      botonEnviar.disabled = true;
      botonEnviar.dataset.textoOriginal = textoOriginalBoton;
      botonEnviar.textContent = 'Enviando...';
    }

    formularioEnviando = true;
    formularioContacto.action = scriptUrl;
    formularioContacto.target = iframeContacto.name;
    formularioContacto.submit();

    temporizadorFormulario = setTimeout(() => {
      if (!formularioEnviando) return;

      finalizarEsperaFormulario();
      mostrarMensajeFormulario('error');
    }, TIEMPO_ESPERA_ENVIO_MS);
  });
}

// Evitar que la web abra en scroll guardado
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  if (!window.location.hash && !vieneDesdeFormulario) {
    window.scrollTo(0, 0);
  }
});
