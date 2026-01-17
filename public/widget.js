;(function () {
  'use strict'

  console.log('[RoleModel Widget] Script loaded')

  // Configuration with fallbacks for Framer compatibility
  var config = {
    chatbotId: 'a0000000-0000-0000-0000-000000000001',
    containerId: 'rolemodel-widget',
    position: 'bottom-right',
    buttonColor: '#0066FF',
    baseUrl: 'https://rolemodel-ai-leads.vercel.app',
  }

  // Try to get script element using multiple methods
  var currentScript = null

  // Method 1: document.currentScript
  try {
    currentScript = document.currentScript
  } catch (e) {}

  // Method 2: Find by src URL
  if (!currentScript) {
    try {
      var scripts = document.getElementsByTagName('script')
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) {
          currentScript = scripts[i]
          break
        }
      }
    } catch (e) {}
  }

  // Method 3: Find by data attribute
  if (!currentScript) {
    try {
      currentScript = document.querySelector('script[data-chatbot-id]')
    } catch (e) {}
  }

  // Extract config from script attributes
  if (currentScript) {
    console.log('[RoleModel Widget] Found script element')
    if (currentScript.getAttribute('data-chatbot-id')) {
      config.chatbotId = currentScript.getAttribute('data-chatbot-id')
    }
    if (currentScript.getAttribute('data-container-id')) {
      config.containerId = currentScript.getAttribute('data-container-id')
    }
    if (currentScript.getAttribute('data-position')) {
      config.position = currentScript.getAttribute('data-position')
    }
    if (currentScript.getAttribute('data-button-color')) {
      config.buttonColor = currentScript.getAttribute('data-button-color')
    }
    if (currentScript.src) {
      try {
        var url = new URL(currentScript.src)
        config.baseUrl = url.origin
      } catch (e) {}
    }
  }

  // Override with window globals (useful for Framer)
  if (window.ROLEMODEL_CHATBOT_ID) config.chatbotId = window.ROLEMODEL_CHATBOT_ID
  if (window.ROLEMODEL_CONTAINER_ID) config.containerId = window.ROLEMODEL_CONTAINER_ID
  if (window.ROLEMODEL_POSITION) config.position = window.ROLEMODEL_POSITION
  if (window.ROLEMODEL_BUTTON_COLOR) config.buttonColor = window.ROLEMODEL_BUTTON_COLOR
  if (window.ROLEMODEL_BASE_URL) config.baseUrl = window.ROLEMODEL_BASE_URL

  var containerId = config.containerId
  var position = config.position
  var buttonColor = config.buttonColor
  var WIDGET_URL = config.baseUrl + '/widget/' + config.chatbotId

  console.log('[RoleModel Widget] Config:', config)
  console.log('[RoleModel Widget] Widget URL:', WIDGET_URL)

  // Fetch widget configuration from API to get admin-set colors
  function fetchWidgetConfig(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', config.baseUrl + '/api/widget-config?chatbotId=' + config.chatbotId, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            if (response.config && response.config.buttonColor) {
              buttonColor = response.config.buttonColor;
              console.log('[RoleModel Widget] Using admin button color:', buttonColor);
            }
          } catch (e) {
            console.log('[RoleModel Widget] Could not parse config response');
          }
        }
        callback();
      }
    };
    xhr.send();
  }

  // Add required styles with !important for Framer compatibility
  function injectStyles() {
    var styleId = containerId + '-styles';
    if (document.getElementById(styleId)) return;
    
    var positionLeft = position === 'bottom-left';
    var positionRule = positionLeft ? 'left: 20px !important;' : 'right: 20px !important;';
    var mobilePositionRule = positionLeft ? 'left: 16px !important;' : 'right: 16px !important;';
    
    var css = '#' + containerId + ' {' +
      'position: fixed !important;' +
      positionRule +
      'bottom: 90px !important;' +
      'width: 400px !important;' +
      'height: 600px !important;' +
      'max-height: calc(100vh - 120px) !important;' +
      'border: none !important;' +
      'border-radius: 12px !important;' +
      'box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;' +
      'overflow: hidden !important;' +
      'z-index: 2147483646 !important;' +
      'background: white !important;' +
      'opacity: 0 !important;' +
      'visibility: hidden !important;' +
      'pointer-events: none !important;' +
      'transform: translateY(20px) !important;' +
      'transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease !important;' +
    '}' +
    '#' + containerId + '.rm-open {' +
      'opacity: 1 !important;' +
      'visibility: visible !important;' +
      'pointer-events: auto !important;' +
      'transform: translateY(0) !important;' +
    '}' +
    '#' + containerId + '-iframe {' +
      'width: 100% !important;' +
      'height: 100% !important;' +
      'border: none !important;' +
    '}' +
    '#' + containerId + '-toggle-btn {' +
      'position: fixed !important;' +
      positionRule +
      'bottom: 20px !important;' +
      'width: 60px !important;' +
      'height: 60px !important;' +
      'border-radius: 50% !important;' +
      'background: ' + buttonColor + ' !important;' +
      'border: none !important;' +
      'cursor: pointer !important;' +
      'z-index: 2147483647 !important;' +
      'box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;' +
      'display: flex !important;' +
      'align-items: center !important;' +
      'justify-content: center !important;' +
      'transition: transform 0.2s ease, box-shadow 0.2s ease !important;' +
      'padding: 0 !important;' +
      'margin: 0 !important;' +
    '}' +
    '#' + containerId + '-toggle-btn:hover {' +
      'transform: scale(1.05) !important;' +
      'box-shadow: 0 6px 16px rgba(0,0,0,0.25) !important;' +
    '}' +
    '#' + containerId + '-toggle-btn svg {' +
      'width: 28px !important;' +
      'height: 28px !important;' +
      'fill: white !important;' +
    '}' +
    '#' + containerId + '-toggle-btn .rm-close-icon {' +
      'display: none !important;' +
    '}' +
    '#' + containerId + '-toggle-btn.rm-open .rm-chat-icon {' +
      'display: none !important;' +
    '}' +
    '#' + containerId + '-toggle-btn.rm-open .rm-close-icon {' +
      'display: block !important;' +
    '}' +
    '@media (max-width: 768px) {' +
      '#' + containerId + ' {' +
        'width: 100% !important;' +
        'height: 100% !important;' +
        'max-height: 100% !important;' +
        'bottom: 0 !important;' +
        'right: 0 !important;' +
        'left: 0 !important;' +
        'border-radius: 0 !important;' +
      '}' +
      '#' + containerId + '-toggle-btn {' +
        'bottom: 16px !important;' +
        mobilePositionRule +
      '}' +
    '}';
    
    var style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css; // IE8
    } else {
      style.appendChild(document.createTextNode(css));
    }
    
    var head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
      head.appendChild(style);
      console.log('[RoleModel Widget] Styles injected');
    } else {
      console.error('[RoleModel Widget] No head element found');
    }
  }

  // Create widget container
  function createWidget() {
    // Check if container already exists
    if (document.getElementById(containerId)) {
      console.log('[RoleModel Widget] Already initialized');
      return;
    }

    console.log('[RoleModel Widget] Creating widget...');

    // Create toggle button
    var toggleBtn = document.createElement('button');
    toggleBtn.id = containerId + '-toggle-btn';
    toggleBtn.setAttribute('type', 'button');
    toggleBtn.setAttribute('aria-label', 'Toggle chat widget');
    toggleBtn.innerHTML = 
      '<svg class="rm-chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.2L4 17.2V4H20V16Z"/>' +
        '<path d="M7 9H17V11H7V9ZM7 6H17V8H7V6ZM7 12H14V14H7V12Z"/>' +
      '</svg>' +
      '<svg class="rm-close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>' +
      '</svg>';

    // Create container
    var container = document.createElement('div');
    container.id = containerId;

    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.id = containerId + '-iframe';
    iframe.src = WIDGET_URL;
    iframe.setAttribute('allow', 'microphone');
    iframe.setAttribute('loading', 'lazy');

    container.appendChild(iframe);
    
    // Append to body
    document.body.appendChild(toggleBtn);
    document.body.appendChild(container);
    
    console.log('[RoleModel Widget] Elements added to body');

    // Toggle functionality
    toggleBtn.addEventListener('click', function () {
      var isOpen = container.classList.toggle('rm-open');
      toggleBtn.classList.toggle('rm-open', isOpen);
      toggleBtn.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
      console.log('[RoleModel Widget] Toggled:', isOpen ? 'open' : 'closed');
    });
    
    console.log('[RoleModel Widget] Initialized successfully');
  }

  // Initialize when DOM is ready
  function init() {
    // Fetch config from API first to get admin colors, then create widget
    fetchWidgetConfig(function() {
      injectStyles();
      
      if (document.body) {
        createWidget();
      } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
      } else {
        // Fallback: poll for body
        var attempts = 0;
        var checkBody = setInterval(function() {
          attempts++;
          if (document.body) {
            clearInterval(checkBody);
            createWidget();
          } else if (attempts > 100) {
            clearInterval(checkBody);
            console.error('[RoleModel Widget] Could not find document.body');
          }
        }, 50);
      }
    });
  }
  
  init();

  // Export API for controlling the widget
  window.RoleModelWidget = {
    show: function () {
      var container = document.getElementById(containerId);
      var toggleBtn = document.getElementById(containerId + '-toggle-btn');
      if (container) {
        container.classList.add('rm-open');
        if (toggleBtn) toggleBtn.classList.add('rm-open');
      }
    },
    hide: function () {
      var container = document.getElementById(containerId);
      var toggleBtn = document.getElementById(containerId + '-toggle-btn');
      if (container) {
        container.classList.remove('rm-open');
        if (toggleBtn) toggleBtn.classList.remove('rm-open');
      }
    },
    toggle: function () {
      var container = document.getElementById(containerId);
      var toggleBtn = document.getElementById(containerId + '-toggle-btn');
      if (container) {
        var isOpen = container.classList.toggle('rm-open');
        if (toggleBtn) toggleBtn.classList.toggle('rm-open', isOpen);
      }
    }
  };
})();
