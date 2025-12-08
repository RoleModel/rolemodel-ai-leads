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
  const WIDGET_URL = `${baseUrl}/embed/leads-page`
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
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 600px;
            border: none;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            overflow: hidden;
            z-index: 999999;
            background: white;
        }

        #${containerId}-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            #${containerId} {
                width: 100%;
                height: 100%;
                bottom: 0;
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

    // Create iframe
    const iframe = document.createElement('iframe')
    iframe.id = `${containerId}-iframe`
    iframe.src = `${WIDGET_URL}?chatbotId=${chatbotId}`
    iframe.setAttribute('allow', 'microphone')

    container.appendChild(iframe)
    document.body.appendChild(container)
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
      if (container) container.style.display = 'block'
    },
    hide: function () {
      const container = document.getElementById(containerId)
      if (container) container.style.display = 'none'
    },
    toggle: function () {
      const container = document.getElementById(containerId)
      if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none'
      }
    },
  }
})()
