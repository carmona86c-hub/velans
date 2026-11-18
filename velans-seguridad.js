/* Velan's · seguridad: impide que otra web muestre velans.es dentro de un marco (clickjacking). */
(function(){if(window.top!==window.self){try{window.top.location.replace(window.self.location.href)}catch(e){document.documentElement.style.visibility='hidden'}}})();
