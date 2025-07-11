/**
 * Arquivo principal de JavaScript para o sistema de certificados digitais
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializa tooltips do Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Inicializa popovers do Bootstrap
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Adiciona efeito de terminal para elementos com a classe .terminal-effect
  const terminalElements = document.querySelectorAll('.terminal-effect');
  terminalElements.forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    let i = 0;
    const speed = 50; // velocidade da digitação em ms

    function typeWriter() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      } else {
        // Adiciona cursor piscante ao final
        const cursor = document.createElement('span');
        cursor.className = 'cursor-blink';
        cursor.innerHTML = '&nbsp;';
        element.appendChild(cursor);
      }
    }

    typeWriter();
  });

  // Função para copiar texto para a área de transferência
  window.copyToClipboard = function(text, buttonElement) {
    navigator.clipboard.writeText(text).then(function() {
      // Altera o ícone e texto do botão temporariamente
      const originalHTML = buttonElement.innerHTML;
      buttonElement.innerHTML = '<i class="bi bi-check"></i> Copiado!';
      buttonElement.classList.remove('btn-outline-secondary');
      buttonElement.classList.add('btn-success');
      
      setTimeout(function() {
        buttonElement.innerHTML = originalHTML;
        buttonElement.classList.remove('btn-success');
        buttonElement.classList.add('btn-outline-secondary');
      }, 2000);
    }).catch(function(err) {
      console.error('Erro ao copiar texto: ', err);
      alert('Não foi possível copiar o texto. Por favor, tente novamente.');
    });
  };

  // Função para mostrar/esconder senha
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const passwordInput = document.getElementById(this.getAttribute('data-target'));
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Altera o ícone
      const icon = this.querySelector('i');
      if (type === 'text') {
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  });

  // Função para confirmar ações destrutivas
  const confirmActionButtons = document.querySelectorAll('[data-confirm]');
  confirmActionButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const message = this.getAttribute('data-confirm');
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // Função para validar formulários
  const forms = document.querySelectorAll('.needs-validation');
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Função para validar senhas iguais
  const passwordInputs = document.querySelectorAll('input[type="password"][data-match]');
  passwordInputs.forEach(input => {
    input.addEventListener('input', function() {
      const targetId = this.getAttribute('data-match');
      const targetInput = document.getElementById(targetId);
      
      if (this.value !== targetInput.value) {
        this.setCustomValidity('As senhas não coincidem');
      } else {
        this.setCustomValidity('');
      }
    });
  });

  // Função para fechar alertas automaticamente
  const autoCloseAlerts = document.querySelectorAll('.alert-dismissible.auto-close');
  autoCloseAlerts.forEach(alert => {
    const delay = alert.getAttribute('data-delay') || 5000;
    setTimeout(() => {
      const closeButton = alert.querySelector('.btn-close');
      if (closeButton) {
        closeButton.click();
      }
    }, parseInt(delay));
  });

  // Adiciona efeito de hover em linhas de tabela clicáveis
  const clickableRows = document.querySelectorAll('tr[data-href]');
  clickableRows.forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function() {
      window.location.href = this.getAttribute('data-href');
    });
  });

  // Função para atualizar contador de caracteres em textareas
  const textareas = document.querySelectorAll('textarea[maxlength]');
  textareas.forEach(textarea => {
    const maxLength = textarea.getAttribute('maxlength');
    const counterId = textarea.getAttribute('data-counter');
    const counter = document.getElementById(counterId);
    
    if (counter) {
      counter.textContent = `${textarea.value.length}/${maxLength}`;
      
      textarea.addEventListener('input', function() {
        counter.textContent = `${this.value.length}/${maxLength}`;
      });
    }
  });

  // Função para mostrar/esconder campos condicionais
  const conditionalTriggers = document.querySelectorAll('[data-toggle-condition]');
  conditionalTriggers.forEach(trigger => {
    const updateVisibility = function() {
      const targetId = trigger.getAttribute('data-toggle-condition');
      const targetElement = document.getElementById(targetId);
      const conditionType = trigger.getAttribute('data-condition-type') || 'checked';
      const invertCondition = trigger.hasAttribute('data-condition-invert');
      
      let conditionMet = false;
      
      if (conditionType === 'checked') {
        conditionMet = trigger.checked;
      } else if (conditionType === 'value') {
        const requiredValue = trigger.getAttribute('data-condition-value');
        conditionMet = trigger.value === requiredValue;
      } else if (conditionType === 'not-empty') {
        conditionMet = trigger.value.trim() !== '';
      }
      
      if (invertCondition) {
        conditionMet = !conditionMet;
      }
      
      if (targetElement) {
        targetElement.style.display = conditionMet ? '' : 'none';
        
        // Desabilita campos dentro do elemento escondido para não serem enviados no formulário
        const formElements = targetElement.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
          element.disabled = !conditionMet;
        });
      }
    };
    
    // Executa na inicialização
    updateVisibility();
    
    // Adiciona listener para mudanças
    trigger.addEventListener('change', updateVisibility);
    if (trigger.tagName === 'INPUT' && trigger.type === 'text') {
      trigger.addEventListener('input', updateVisibility);
    }
  });
});

// Função para formatar data em formato brasileiro
function formatDateBR(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

// Função para formatar CPF
function formatCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

// Função para formatar CNPJ
function formatCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// Função para validar CPF
function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

// Função para validar CNPJ
function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }
  
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size += 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}