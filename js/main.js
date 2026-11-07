(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const mobileBtn = document.getElementById('mobile-menu');
  const nav = document.querySelector('.nav');

 
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;

  const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  if (currentTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  }

  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const dark = root.getAttribute('data-theme') === 'dark';
      const newTheme = dark ? 'light' : 'dark';

      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  
  function typingEffect(el) {
    if (!el) return;

    const text = el.dataset.text || '';
    let index = 0;
    el.textContent = '';

    function typeStep() {
      if (index <= text.length) {
        el.textContent = text.slice(0, index);
        index++;
        setTimeout(typeStep, 35); 
      } else {
        el.style.borderRight = 'none';
      }
    }

    typeStep();
  }

  function keepOnlyNumbers(value) {
    let result = "";

    for (let char of value) {
      if (char >= "0" && char <= "9") {
        result += char;
      }
    }

    return result;
  }

  function formatPhone(value) {
    let numbers = keepOnlyNumbers(value).slice(0, 11);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }


  document.addEventListener('DOMContentLoaded', () => {

    typingEffect(document.querySelector('.typing'));

    
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.15 });

    elements.forEach(el => observer.observe(el));

    
    const form = document.getElementById('contact-form');
    if (form) {
      const phone = document.getElementById('phone');
      const email = document.getElementById('email');
      const status = document.getElementById('form-status');
      
      if (phone) {
        phone.addEventListener('input', (ev) => {
          ev.target.value = formatPhone(ev.target.value);
        });
      }

   
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        let valid = true;

        form.querySelectorAll('[required]').forEach(input => {
          if (!input.value.trim()) {
            valid = false;
          }
        });

        function isValidEmail(mail) {
          return mail.includes('@') && mail.includes('.') && mail.length > 5;
        }

        if (!isValidEmail(email.value)) {
          valid = false;
        }

        if (!valid) {
          status.textContent = 'Preencha corretamente todos os campos.';
          status.style.color = 'crimson';
          return;
        }

        status.textContent = 'Enviando...';
        status.style.color = 'var(--muted)';

        setTimeout(() => {
          status.textContent = 'Mensagem enviada com sucesso — entrarei em contato!';
          status.style.color = 'green';
          form.reset();
        }, 900);
      });
    }
  });
})();
