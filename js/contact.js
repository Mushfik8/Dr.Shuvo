// Contact form functionality with EmailJS integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS (replace with your actual EmailJS public key)
    emailjs.init("YOUR_EMAILJS_PUBLIC_KEY"); // You need to replace this with your actual key
    
    initializeContactForm();
});

/**
 * Initialize contact form functionality
 */
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.submit-btn');
    const formStatus = document.getElementById('form-status');
    
    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            // Collect form data
            const formData = collectFormData();
            
            // Send email using EmailJS
            await sendEmail(formData);
            
            // Show success message
            showMessage('success', 'Thank you for your message! Dr. Shuvo will get back to you soon.');
            
            // Reset form
            form.reset();
            clearValidationErrors();
            
        } catch (error) {
            console.error('Error sending email:', error);
            showMessage('error', 'Sorry, there was an error sending your message. Please try calling directly at 01727281836.');
        } finally {
            setLoadingState(false);
        }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear error state when user starts typing
            if (this.parentElement.classList.contains('error')) {
                clearFieldError(this);
            }
        });
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
        formatPhoneNumber(this);
    });
}

/**
 * Validate entire form
 */
function validateForm() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = `${getFieldLabel(field)} is required.`;
        isValid = false;
    }
    
    // Specific field validations
    if (value && isValid) {
        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters long.';
                    isValid = false;
                } else if (!/^[a-zA-Z\s.-]+$/.test(value)) {
                    errorMessage = 'Name can only contain letters, spaces, dots, and hyphens.';
                    isValid = false;
                }
                break;
                
            case 'phone':
                const phonePattern = /^(\+8801|01)[3-9]\d{8}$/;
                const cleanPhone = value.replace(/[\s-()]/g, '');
                if (!phonePattern.test(cleanPhone)) {
                    errorMessage = 'Please enter a valid Bangladeshi phone number (e.g., 01727281836).';
                    isValid = false;
                }
                break;
                
            case 'email':
                if (fieldType === 'email' && value) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(value)) {
                        errorMessage = 'Please enter a valid email address.';
                        isValid = false;
                    }
                }
                break;
                
            case 'message':
                if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters long.';
                    isValid = false;
                } else if (value.length > 1000) {
                    errorMessage = 'Message must be less than 1000 characters.';
                    isValid = false;
                }
                break;
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    const formGroup = field.parentElement;
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    errorElement.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorElement.id);
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    const formGroup = field.parentElement;
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error');
    errorElement.textContent = '';
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
}

/**
 * Clear all validation errors
 */
function clearValidationErrors() {
    const formGroups = document.querySelectorAll('.form-group.error');
    formGroups.forEach(group => {
        group.classList.remove('error');
        const errorElement = group.querySelector('.error-message');
        errorElement.textContent = '';
    });
}

/**
 * Get field label text
 */
function getFieldLabel(field) {
    const label = field.parentElement.querySelector('label');
    return label ? label.textContent.replace('*', '').trim() : field.name;
}

/**
 * Format phone number input
 */
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    // Handle Bangladeshi phone number formatting
    if (value.startsWith('880')) {
        value = '+' + value;
    } else if (value.startsWith('01') && value.length === 11) {
        // Keep as is for local format
    }
    
    input.value = value;
}

/**
 * Collect form data
 */
function collectFormData() {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || 'Not provided',
        location: getLocationFullName(formData.get('location')),
        message: formData.get('message'),
        timestamp: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Dhaka',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    return data;
}

/**
 * Get full location name from select value
 */
function getLocationFullName(value) {
    const locations = {
        'super-medical': 'Super Medical Hospital Pvt. Ltd., Savar',
        'popular-diagnostic': 'Popular Diagnostic Center Ltd., Savar',
        'tanha-healthcare': 'Tanha Health Care Hospital, Shofipur, Gazipur'
    };
    
    return locations[value] || value;
}

/**
 * Send email using EmailJS
 */
async function sendEmail(data) {
    // Note: In a production environment, you would replace this with your actual EmailJS configuration
    const serviceID = 'YOUR_SERVICE_ID';
    const templateID = 'YOUR_TEMPLATE_ID';
    
    const templateParams = {
        to_name: 'Dr. Mohidur Rahman Khan (Shuvo)',
        from_name: data.name,
        from_phone: data.phone,
        from_email: data.email,
        preferred_location: data.location,
        message: data.message,
        timestamp: data.timestamp,
        reply_to: data.email
    };
    
    // For demonstration purposes, we'll simulate the email sending
    // In production, uncomment the following line and configure EmailJS properly:
    // return emailjs.send(serviceID, templateID, templateParams);
    
    // Simulated delay for demonstration
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Email would be sent with data:', templateParams);
            resolve({ status: 200 });
        }, 1500);
    });
}

/**
 * Set loading state for form submission
 */
function setLoadingState(isLoading) {
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        btnText.textContent = 'Sending...';
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        btnText.textContent = 'Send Message';
    }
}

/**
 * Show success or error message
 */
function showMessage(type, message) {
    const formStatus = document.getElementById('form-status');
    
    // Clear previous classes
    formStatus.className = 'form-status';
    
    // Add new class and message
    formStatus.classList.add(type);
    formStatus.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        formStatus.className = 'form-status';
        formStatus.textContent = '';
    }, 5000);
    
    // Scroll to message
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Alternative contact methods if EmailJS fails
 */
function handleEmailFailure() {
    const formData = collectFormData();
    
    // Create mailto link as fallback
    const subject = encodeURIComponent(`Appointment Request from ${formData.name}`);
    const body = encodeURIComponent(`
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}
Preferred Location: ${formData.location}

Message:
${formData.message}

Sent at: ${formData.timestamp}
    `.trim());
    
    // You would need to replace this with Dr. Shuvo's actual email
    const mailtoLink = `mailto:doctor@example.com?subject=${subject}&body=${body}`;
    
    // Show alternative options
    const alternativeMessage = `
        <div style="text-align: left;">
            <p><strong>Alternative contact methods:</strong></p>
            <p>📞 <strong>Call directly:</strong> <a href="tel:01727281836">01727281836</a></p>
            <p>📧 <strong>Email manually:</strong> <a href="${mailtoLink}">Click to open email app</a></p>
            <p>🏥 <strong>Visit chamber directly</strong> at your preferred location</p>
        </div>
    `;
    
    showMessage('error', 'Unable to send message automatically. Please use one of these alternatives:');
    
    // Add the alternative options to the form status
    setTimeout(() => {
        const formStatus = document.getElementById('form-status');
        formStatus.innerHTML = alternativeMessage;
        formStatus.className = 'form-status error';
    }, 100);
}

/**
 * Input validation helpers
 */

// Real-time character counter for message field
const messageField = document.getElementById('message');
if (messageField) {
    const maxLength = 1000;
    
    // Create character counter
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = 'text-align: right; margin-top: 4px; font-size: 0.875rem; color: #64748b;';
    messageField.parentElement.appendChild(counter);
    
    // Update counter
    function updateCounter() {
        const remaining = maxLength - messageField.value.length;
        counter.textContent = `${messageField.value.length}/${maxLength}`;
        counter.style.color = remaining < 50 ? '#ef4444' : '#64748b';
    }
    
    messageField.addEventListener('input', updateCounter);
    updateCounter(); // Initialize
}