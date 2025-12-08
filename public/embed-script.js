;(function () {
  // Get script tag and extract parameters
  // Try multiple methods for Framer compatibility
  let currentScript = document.currentScript

  // Fallback: find script by src URL (works in Framer)
  if (!currentScript) {
    const scripts = document.querySelectorAll('script[src*="embed-script"]')
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
  const WIDGET_URL = `${baseUrl}/widget`
  const OPTICS_CSS =
    'https://cdn.jsdelivr.net/npm/@rolemodel/optics@2.2.0/dist/css/optics.min.css'

  const chatbotId =
    currentScript?.getAttribute('data-chatbot-id') ||
    window.ROLEMODEL_CHATBOT_ID ||
    'a0000000-0000-0000-0000-000000000001'
  const containerId =
    currentScript?.getAttribute('data-container-id') ||
    window.ROLEMODEL_CONTAINER_ID ||
    'rolemodel-ai-widget'

  // Load Optics CSS if not already loaded
  if (!document.querySelector(`link[href="${OPTICS_CSS}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = OPTICS_CSS
    document.head.appendChild(link)
  }

  // Add required styles
  const style = document.createElement('style')
  style.textContent = `
        #${containerId} {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 400px;
            height: 600px;
            border: none;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            overflow: hidden;
            z-index: 999999;
            background: white;
            transition: opacity 0.2s, transform 0.2s;
        }

        #${containerId}.hidden {
            opacity: 0;
            transform: scale(0.95);
            pointer-events: none;
        }

        #${containerId}-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        #${containerId}-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #7f51b1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            z-index: 999999;
            transition: transform 0.2s;
        }

        #${containerId}-toggle:hover {
            transform: scale(1.05);
        }

        #${containerId}-toggle svg {
            width: 24px;
            height: 24px;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            #${containerId} {
                width: 100%;
                height: calc(100% - 80px);
                bottom: 80px;
                right: 0;
                border-radius: 0;
            }
        }

        /* Ensure CSS variables are available */
        :root {
            --op-color-background: #ffffff;
            --op-color-on-background: #000000;
            --op-color-primary-base: #7f51b1;
            --op-color-primary-on-base: #ffffff;
            --op-space-small: 8px;
            --op-space-medium: 16px;
            --op-space-large: 24px;
            --op-space-3x-large: 48px;
            --op-radius-medium: 8px;
            --op-font-small: 14px;
            --op-font-medium: 16px;
        }
    `
  document.head.appendChild(style)

  // SVG icons
  const chatIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`

  let isOpen = false

  // Create widget container
  function createWidget() {
    // Check if container already exists
    if (document.getElementById(containerId)) {
      console.warn('Widget container already exists')
      return
    }

    // Create container
    const container = document.createElement('div')
    container.id = containerId
    container.classList.add('hidden')

    // Create iframe
    const iframe = document.createElement('iframe')
    iframe.id = `${containerId}-iframe`
    iframe.src = `${WIDGET_URL}/${chatbotId}`
    iframe.setAttribute('allow', 'microphone')

    container.appendChild(iframe)
    document.body.appendChild(container)

    // Listen for close message from iframe (validate origin for security)
    window.addEventListener('message', function (event) {
      if (event.origin !== baseUrl) return
      if (event.data && event.data.type === 'WIDGET_CLOSE') {
        window.RoleModelAIWidget.hide()
      }
    })

    // Create toggle button
    const toggleBtn = document.createElement('button')
    toggleBtn.id = `${containerId}-toggle`
    toggleBtn.innerHTML = chatIcon
    toggleBtn.onclick = function () {
      isOpen = !isOpen
      if (isOpen) {
        container.classList.remove('hidden')
        toggleBtn.innerHTML = closeIcon
      } else {
        container.classList.add('hidden')
        toggleBtn.innerHTML = chatIcon
      }
    }
    document.body.appendChild(toggleBtn)
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget)
  } else {
    createWidget()
  }

  // Export API for controlling the widget
  window.RoleModelAIWidget = {
    show: function () {
      const container = document.getElementById(containerId)
      const toggleBtn = document.getElementById(`${containerId}-toggle`)
      if (container) {
        container.classList.remove('hidden')
        isOpen = true
        if (toggleBtn) toggleBtn.innerHTML = closeIcon
      }
    },
    hide: function () {
      const container = document.getElementById(containerId)
      const toggleBtn = document.getElementById(`${containerId}-toggle`)
      if (container) {
        container.classList.add('hidden')
        isOpen = false
        if (toggleBtn) toggleBtn.innerHTML = chatIcon
      }
    },
    toggle: function () {
      if (isOpen) {
        this.hide()
      } else {
        this.show()
      }
    },
  }
})()
