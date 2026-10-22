/* Marca que o JavaScript está disponível antes da primeira pintura.
   Fica em arquivo externo para permitir uma CSP sem 'unsafe-inline'. */
document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");
