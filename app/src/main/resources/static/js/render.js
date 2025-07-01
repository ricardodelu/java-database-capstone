/**
 * render.js - Common rendering utilities for the Clinic Management System
 */

/**
 * Renders a list of items using a provided render function
 * @param {Array} items - Array of items to render
 * @param {Function} renderItem - Function that renders a single item
 * @param {HTMLElement} container - Container element to append rendered items to
 * @param {string} emptyMessage - Message to display when no items are available
 */
export function renderList(items, renderItem, container, emptyMessage = 'No items found') {
    if (!container) {
        console.error('Container element not found');
        return;
    }

    // Clear the container
    container.innerHTML = '';

    // Show message if no items
    if (!items || items.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'empty-state';
        emptyElement.textContent = emptyMessage;
        container.appendChild(emptyElement);
        return;
    }

    // Render each item
    items.forEach(item => {
        const element = renderItem(item);
        if (element) {
            container.appendChild(element);
        }
    });
}

/**
 * Creates a DOM element with the specified tag, classes, and attributes
 * @param {string} tag - HTML tag name
 * @param {string|string[]} className - Class name or array of class names
 * @param {Object} attributes - Object of attributes to set
 * @param {string} text - Text content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, className = '', attributes = {}, text = '') {
    const element = document.createElement(tag);
    
    // Handle class names (string or array)
    if (Array.isArray(className)) {
        element.classList.add(...className.filter(Boolean));
    } else if (className) {
        element.className = className;
    }
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            element.setAttribute(key, value);
        }
    });
    
    // Set text content
    if (text) {
        element.textContent = text;
    }
    
    return element;
}

/**
 * Updates the UI to show a loading state
 * @param {HTMLElement} element - Element to show loading state in
 * @param {boolean} isLoading - Whether to show or hide loading state
 */
export function setLoading(element, isLoading = true) {
    if (!element) return;
    
    if (isLoading) {
        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        element.appendChild(loader);
        element.classList.add('loading');
    } else {
        const loader = element.querySelector('.loading-spinner');
        if (loader) {
            element.removeChild(loader);
            element.classList.remove('loading');
        }
    }
}

/**
 * Updates the page title and header
 * @param {string} title - New page title
 * @param {string} [header] - Optional header text (if different from title)
 */
export function updatePageTitle(title, header) {
    document.title = `${title} | Clinic Management System`;
    
    const headerElement = document.querySelector('header h1');
    if (headerElement) {
        headerElement.textContent = header || title;
    }
}

/**
 * Renders a notification/message to the user
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 * @param {number} [duration=5000] - How long to show the notification in ms
 */
export function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to the notification container or create one
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            container.removeChild(notification);
            
            // Remove container if no more notifications
            if (container.children.length === 0) {
                document.body.removeChild(container);
            }
        }, 300);
    }, duration);
}

/**
 * Toggles the visibility of an element
 * @param {HTMLElement} element - Element to toggle
 * @param {boolean} [show] - Force show or hide (optional)
 */
export function toggleElement(element, show) {
    if (!element) return;
    
    if (show === undefined) {
        element.style.display = element.style.display === 'none' ? '' : 'none';
    } else {
        element.style.display = show ? '' : 'none';
    }
}

// Add CSS for notifications if not already present
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 300px;
        }
        
        .notification {
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            color: white;
            opacity: 0;
            transform: translateX(100%);
            animation: slideIn 0.3s ease-out forwards;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .notification.success { background-color: #4caf50; }
        .notification.error { background-color: #f44336; }
        .notification.warning { background-color: #ff9800; }
        .notification.info { background-color: #2196f3; }
        
        .notification.fade-out {
            animation: fadeOut 0.3s ease-in forwards;
        }
        
        @keyframes slideIn {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
}
