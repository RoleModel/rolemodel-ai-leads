;(function () {
  // Get script tag and extract parameters
  // Try multiple methods for Framer compatibility
  let currentScript = document.currentScript

  // Fallback: find script by src URL (works in Framer)
  if (!currentScript) {
    const scripts = document.querySelectorAll('script[src*="widget.js"]')
    currentScript = scripts[scripts.length - 1] // Get the last matching script
  }

  // Fallback: find script by data attribute
  if (!currentScript) {
    currentScript = document.querySelector('script[data-chatbot-id]')
  }

  // Derive base URL from script src (works on any deployment)
  let baseUrl = 'https://rolemodel-ai-leads.vercel.app'
  if (currentScript?.src) {
    try {
      const scriptUrl = new URL(currentScript.src)
      baseUrl = scriptUrl.origin
    } catch (e) {
      // Keep default if URL parsing fails
    }
  }

  // Configuration
  const chatbotId =
    currentScript?.getAttribute('data-chatbot-id') ||
    window.ROLEMODEL_CHATBOT_ID ||
    'a0000000-0000-0000-0000-000000000001'
  const containerId =
    currentScript?.getAttribute('data-container-id') ||
    window.ROLEMODEL_CONTAINER_ID ||
    'rolemodel-widget'
  const position = currentScript?.getAttribute('data-position') || 'bottom-right'
  const buttonColor = currentScript?.getAttribute('data-button-color') || '#0066FF'

  const WIDGET_URL = `${baseUrl}/widget/${chatbotId}`

  // Add required styles
  const style = document.createElement('style')
  style.textContent = `
    #${containerId} {
      position: fixed;
      ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      overflow: hidden;
      z-index: 999999;
      background: white;
      display: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    #${containerId}.open {
      display: block;
    }

    #${containerId}-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    #${containerId}-toggle-btn {
      position: fixed;
      ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${buttonColor};
      border: none;
      cursor: pointer;
      z-index: 999998;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    #${containerId}-toggle-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    }

    #${containerId}-toggle-btn svg {
      width: 28px;
      height: 28px;
      fill: white;
      transition: transform 0.2s ease;
    }

    #${containerId}-toggle-btn.open svg.chat-icon {
      display: none;
    }

    #${containerId}-toggle-btn.open svg.close-icon {
      display: block;
    }

    #${containerId}-toggle-btn:not(.open) svg.chat-icon {
      display: block;
    }

    #${containerId}-toggle-btn:not(.open) svg.close-icon {
      display: none;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      #${containerId} {
        width: 100%;
        height: 100%;
        bottom: 0;
        right: 0;
        left: 0;
        border-radius: 0;
      }

      #${containerId}-toggle-btn {
        bottom: 16px;
        ${position === 'bottom-left' ? 'left: 16px;' : 'right: 16px;'}
      }
    }
  `
  document.head.appendChild(style)

  // Create widget container
  function createWidget() {
    // Check if container already exists
    if (document.getElementById(containerId)) {
      console.warn('Widget container already exists')
      return
    }

    // Create toggle button
    const toggleBtn = document.createElement('button')
    toggleBtn.id = `${containerId}-toggle-btn`
    toggleBtn.setAttribute('aria-label', 'Toggle chat widget')
    toggleBtn.innerHTML = `
      <svg class="chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.2L4 17.2V4H20V16Z"/>
        <path d="M7 9H17V11H7V9ZM7 6H17V8H7V6ZM7 12H14V14H7V12Z"/>
      </svg>
      <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
      </svg>
    `

    // Create container
    const container = document.createElement('div')
    container.id = containerId

    // Create iframe
    const iframe = document.createElement('iframe')
    iframe.id = `${containerId}-iframe`
    iframe.src = WIDGET_URL
    iframe.setAttribute('allow', 'microphone')

    container.appendChild(iframe)
    document.body.appendChild(toggleBtn)
    document.body.appendChild(container)

    // Toggle functionality
    toggleBtn.addEventListener('click', function () {
      const isOpen = container.classList.toggle('open')
      toggleBtn.classList.toggle('open', isOpen)
    })
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget)
  } else {
    createWidget()
  }

  // Export API for controlling the widget
  window.RoleModelWidget = {
    show: function () {
      const container = document.getElementById(containerId)
      const toggleBtn = document.getElementById(`${containerId}-toggle-btn`)
      if (container) {
        container.classList.add('open')
        if (toggleBtn) toggleBtn.classList.add('open')
      }
    },
    hide: function () {
      const container = document.getElementById(containerId)
      const toggleBtn = document.getElementById(`${containerId}-toggle-btn`)
      if (container) {
        container.classList.remove('open')
        if (toggleBtn) toggleBtn.classList.remove('open')
      }
    },
    toggle: function () {
      const container = document.getElementById(containerId)
      const toggleBtn = document.getElementById(`${containerId}-toggle-btn`)
      if (container) {
        const isOpen = container.classList.toggle('open')
        if (toggleBtn) toggleBtn.classList.toggle('open', isOpen)
      }
    },
  }
})()
